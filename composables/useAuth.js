import { getOktaConfig, getBasePath } from '../config.js'
import { useErrorHandler } from './useErrorHandler.js'

const { ref, computed } = Vue

const oktaAuth = new OktaAuth(getOktaConfig())
let currentRouter = null
let routerGuardAdded = false
let userInitiatedLogout = false

const isAuthenticated = ref(false)
const user = ref(null)
const showLogoutModal = ref(false)

const { handleError } = useErrorHandler()

const updateUserStateFromTokens = async () => {
    try {
        const tokenManager = oktaAuth.tokenManager
        const idTokenObj = await tokenManager.get('idToken')
        
        if (idTokenObj?.claims) {
            user.value = idTokenObj.claims
        } else {
            user.value = null
        }
    } catch (error) {
        console.error('Error loading user:', error)
        user.value = null
    }
}

oktaAuth.authStateManager.subscribe((authState) => {
    console.log('authStateManager authState!', authState)

    const newAuthState = authState.isAuthenticated
    
    if (newAuthState && showLogoutModal.value) {
        showLogoutModal.value = false
    }
    
    if (newAuthState && !isAuthenticated.value) {
        updateUserStateFromTokens()
    }
    
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
    }
    
    isAuthenticated.value = newAuthState
})

oktaAuth.start()

const userFullName = computed(() => user?.value?.name)

const login = async () => {
    try {
        await oktaAuth.signInWithRedirect()
    } catch (error) {
        handleError(error, 'Failed to initiate login. Please try again.')
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
    return oktaAuth.getAccessToken()
}

const getIdToken = () => {
    return oktaAuth.getIdToken()
}

const getTokensWithClaims = async () => {
    const accessToken = await oktaAuth.getAccessToken()
    const idToken = await oktaAuth.getIdToken()
    
    const tokenManager = oktaAuth.tokenManager
    const accessTokenObj = await tokenManager.get('accessToken')
    const idTokenObj = await tokenManager.get('idToken')
    
    return {
        accessToken: accessToken || 'No access token available',
        idToken: idToken || 'No ID token available',
        accessTokenClaims: accessTokenObj?.claims ? JSON.stringify(accessTokenObj.claims, null, 2) : 'No claims available',
        idTokenClaims: idTokenObj?.claims ? JSON.stringify(idTokenObj.claims, null, 2) : 'No claims available'
    }
}

const authGuard = async (to, from) => {
    console.log('router.beforeEach to', to, 'from', from)

    if (oktaAuth.isLoginRedirect()) {
        console.log('Yes isLoginRedirect')

        let originalUri = oktaAuth.getOriginalUri()
        console.log('getOriginalUri:', originalUri)

        try {
            const { tokens } = await oktaAuth.token.parseFromUrl()
            oktaAuth.tokenManager.setTokens(tokens)
            
        } catch (error) {
            //route back to root
            originalUri = false

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
            oktaAuth.signInWithRedirect()
            return false
        }
    }
}

export function useAuth(router = null) {
    if (router) {
        currentRouter = router
        
        if(!routerGuardAdded){
            routerGuardAdded = true
            router.beforeEach(authGuard)
        }

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
        getIdToken,
        getTokensWithClaims,
        authGuard,
        oktaAuth
    }
}
