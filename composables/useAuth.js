import { getOktaConfig, getBasePath } from '../config.js'
import { useErrorHandler } from './useErrorHandler.js'

const { ref, computed } = Vue

const oktaAuth = new OktaAuth(getOktaConfig())
let currentRouter = null
let currentStore = null
let routerGuardAdded = false
let userInitiatedLogout = false

const isAuthenticated = ref(false)
const user = ref(null)
const showLogoutModal = ref(false)
const userFullName = computed(() => user?.value?.name)

const { handleError } = useErrorHandler()

const updateUserStateFromIdToken = async () => {
    try {
        const idTokenObj = await oktaAuth.tokenManager.get('idToken')
        user.value = idTokenObj.claims

        // Update Vuex store if available
        if (currentStore) {
            currentStore.dispatch('auth/updateUser', idTokenObj.claims)
        }
    } catch (error) {
        console.error('Error loading user:', error)
        user.value = null

        // Clear user in Vuex store if available
        if (currentStore) {
            currentStore.dispatch('auth/updateUser', null)
        }
    }
}

oktaAuth.authStateManager.subscribe((authState) => {
    console.log('authStateManager authState!', authState)

    const newAuthState = authState.isAuthenticated

    if (newAuthState && showLogoutModal.value) {
        showLogoutModal.value = false
    }

    if (newAuthState && !isAuthenticated.value) {
        updateUserStateFromIdToken()
    }

    //if user is logged out, route back to root page
    if (isAuthenticated.value && !newAuthState && !userInitiatedLogout) {
        if (currentRouter && currentRouter.currentRoute.value.path !== '/') {
            currentRouter.push('/').then(() => {
                showLogoutModal.value = true
            })
        } else {
            showLogoutModal.value = true
        }
    }

    if (!newAuthState) {
        userInitiatedLogout = false

        // Clear auth state in Vuex store if available
        if (currentStore) {
            currentStore.dispatch('auth/clearAuth')
        }
    }

    isAuthenticated.value = newAuthState

    // Update Vuex store if available
    if (currentStore) {
        currentStore.dispatch('auth/updateAuthState', newAuthState)
    }
})

//this triggers initial auth state check
oktaAuth.start()


const login = async () => {
    try {
        await oktaAuth.signInWithRedirect()
    } catch (error) {
        handleError(error, 'Failed to initiate login. Please verify configuration.')
    }
}

const logout = async () => {
    try {
        userInitiatedLogout = true
        await oktaAuth.signOut({ clearTokensBeforeRedirect: true })
        if (currentRouter) {
            currentRouter.push('/')
        }
    } catch (error) {
        handleError(error, 'Failed to log out. Please try again.')
    }
}

const closeModal = () => {
    showLogoutModal.value = false
}

const getAccessToken = () => {
    //returns a promise
    return oktaAuth.getAccessToken()
}

const getTokensWithClaims = async () => {

    const { accessToken, idToken } = await oktaAuth.tokenManager.getTokens()
    
    return {
        accessToken: accessToken.accessToken,
        idToken: idToken.idToken,
        accessTokenClaims: JSON.stringify(accessToken.claims, null, 2),
        idTokenClaims: JSON.stringify(idToken.claims, null, 2)
    }
}

const authGuard = async (to, from) => {
    console.log('router.beforeEach to', to, 'from', from)

    if (oktaAuth.isLoginRedirect()) {
        console.log('Yes isLoginRedirect')

        let originalUri = oktaAuth.getOriginalUri()
        console.log('getOriginalUri:', originalUri)

        try {
            //option 1 - gets and saves tokens and redirects user
            //await oktaAuth.handleLoginRedirect();

            //option 2 - calling parse & save tokens individually then manually redirect/route
            //const { tokens } = await oktaAuth.token.parseFromUrl()
            //oktaAuth.tokenManager.setTokens(tokens)

            //option 3 - one call for parse & save tokens then manually redirect/route
            await oktaAuth.storeTokensFromRedirect()
            
        } catch (error) {
            //route back to root
            originalUri = false

            //clear on error maybe in the future?
            //oktaAuth.transactionManager.clear()

            //clear auth code from url to prevent looping
            window.history.replaceState({}, document.title, window.location.pathname);

            handleError(error, 'Login callback failed. Please try logging in again.')
        }
        
        //route back to the original url or the root if there's an error
        return { replace: true, path: originalUri || '/' }
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
        const authenticated = await oktaAuth.isAuthenticated()
        
        if (!authenticated) {
            console.log('trying to access authenticated route', to.fullPath)
            oktaAuth.setOriginalUri( to.fullPath )
            login()
            return false
        }
    }
}

export function useAuth(router = null, store = null) {
    if (router) {
        currentRouter = router

        if(!routerGuardAdded){
            routerGuardAdded = true
            router.beforeEach(authGuard)
        }
    }

    if (store) {
        currentStore = store
    }

    return {
        isAuthenticated,
        user,
        showLogoutModal,
        userFullName,
        login,
        logout,
        closeModal,
        getAccessToken,
        getTokensWithClaims,
        oktaAuth
    }
}
