// composables/useAuth.js

const { ref, computed } = Vue;

// Base path for the application because it's hosted in a subdir
const BASE_PATH = '/vue/';

const OKTA_CONFIG = {
    issuer: 'https://auth.myapp.com/oauth2/ausakx48dmHwpI9D1697',
    clientId: '0oaxel75x5wwhmO64697',
    redirectUri: window.location.origin + BASE_PATH,
    postLogoutRedirectUri: window.location.origin + BASE_PATH,
    scopes: ['openid', 'profile', 'email'],
    pkce: true
};

console.log('BASE_PATH', BASE_PATH);
console.log('Creating OktaAuth instance with config:', OKTA_CONFIG);

// Create Okta Auth instance (singleton)
const oktaAuth = new OktaAuth(OKTA_CONFIG);
let currentRouter = null;
let userInitiatedLogout = false;

// State
const isAuthenticated = ref(false);
const user = ref(null);
const showLogoutModal = ref(false);

// Load user information from ID token claims
const updateUserStateFromTokens = async () => {
    try {
        const tokenManager = oktaAuth.tokenManager;
        const idTokenObj = await tokenManager.get('idToken');
        
        if (idTokenObj?.claims) {
            user.value = idTokenObj.claims;
        } else {
            user.value = null;
        }
    } catch (error) {
        console.error('Error loading user:', error);
        user.value = null;
    }
};

// Subscribe to auth state changes
oktaAuth.authStateManager.subscribe((authState) => {
    console.log('authStateManager authState!', authState);

    const newAuthState = authState.isAuthenticated;
    
    // Automatically hide logout modal if user logs back in
    if (newAuthState && showLogoutModal.value) {
        showLogoutModal.value = false;
    }
    
    // Load user info when authentication state becomes true
    if (newAuthState && !isAuthenticated.value) {
        updateUserStateFromTokens();
    }
    
    // Show modal if user was authenticated and now is not
    // BUT only if it wasn't a user initiated logout
    if (isAuthenticated.value && !newAuthState && !userInitiatedLogout) {
        // Redirect to root if not already there
        if (currentRouter && currentRouter.currentRoute.value.path !== '/') {
            currentRouter.push('/').then(() => {
                showLogoutModal.value = true;
            });
        } else {
            showLogoutModal.value = true;
        }
    }
    
    // Reset intentional logout flag after processing
    if (!newAuthState) {
        userInitiatedLogout = false;
    }
    
    isAuthenticated.value = newAuthState;
});

// Start the service to sync tokens between tabs
oktaAuth.start();

export function useAuth(router = null) {
    if (router) {
        currentRouter = router;
    }

    // Computed property for user's full name from ID token
    const userFullName = computed(() => {
        return user?.value?.name;
    });

    const login = async () => {
        await oktaAuth.signInWithRedirect();
    };

    const logout = async (router) => {
        userInitiatedLogout = true;
        await oktaAuth.signOut({ clearTokensBeforeRedirect: true });
        if (router) {
            router.push('/');
        }
    };

    const closeModal = () => {
        showLogoutModal.value = false;
    };

    const getAccessToken = async () => {
        return await oktaAuth.getAccessToken();
    };

    const getIdToken = async () => {
        return await oktaAuth.getIdToken();
    };

    const getTokensWithClaims = async () => {
        const accessToken = await oktaAuth.getAccessToken();
        const idToken = await oktaAuth.getIdToken();
        
        const tokenManager = oktaAuth.tokenManager;
        const accessTokenObj = await tokenManager.get('accessToken');
        const idTokenObj = await tokenManager.get('idToken');
        
        return {
            accessToken: accessToken || 'No access token available',
            idToken: idToken || 'No ID token available',
            accessTokenClaims: accessTokenObj?.claims ? JSON.stringify(accessTokenObj.claims, null, 2) : 'No claims available',
            idTokenClaims: idTokenObj?.claims ? JSON.stringify(idTokenObj.claims, null, 2) : 'No claims available'
        };
    };

    // Router navigation guard
    const authGuard = async (to, from) => {
        console.log('router.beforeEach to', to, 'from', from);

        // Check if this is an OAuth callback (has code and state parameters)
        if (oktaAuth.token.isLoginRedirect()) {
            try {
                const originalUri = oktaAuth.getOriginalUri();
                console.log('getOriginalUri:', originalUri);

                await oktaAuth.handleLoginRedirect();
                if (originalUri) {
                    console.log('Routing to:', originalUri);
                    return { replace: true, path: originalUri };
                }
                return '/';
            } catch (error) {
                console.error('Login callback error:', error);
                return false;
            }
        }

        if (to.matched.some(record => record.meta.requiresAuth)) {
            const authenticated = await oktaAuth.isAuthenticated();
            
            if (!authenticated) {
                console.log('trying to access authenticated route', to.fullPath);
                oktaAuth.setOriginalUri(BASE_PATH + to.fullPath.substring(1));
                oktaAuth.signInWithRedirect();
                return false;
            }
        }
    };

    return {
        // State
        isAuthenticated,
        user,
        showLogoutModal,
        userFullName,
        
        // Methods
        login,
        logout,
        closeModal,
        getAccessToken,
        getIdToken,
        getTokensWithClaims,
        authGuard,
        
        // Okta Auth instance (for plugins and advanced use)
        oktaAuth
    };
}

export { BASE_PATH };