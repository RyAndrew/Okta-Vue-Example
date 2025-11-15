// components/Home.js
import { useAuth } from '../composables/useAuth.js';

export const Home = {
    template: `
        <div class="container">
            <div class="card">
                <h1>🏠 Home Page</h1>
                <p>This is an unprotected page. Anyone can view this content.</p>
                <p>Try navigating to the <strong>Protected Page</strong> to see authentication in action.</p>
                <p v-if="!isAuthenticated">Click the <strong>Login</strong> button in the navigation to sign in with Okta.</p>
                <p v-else>You're currently signed in! Visit the protected page to see your user info.</p>
                
                <div v-if="isAuthenticated" class="welcome-message">
                    Welcome Back {{ userFullName }}
                </div>
                <div v-else class="welcome-message unauthenticated">
                    Please Login to Access Secure Pages
                </div>
            </div>
        </div>
    `,
    setup() {
        const auth = useAuth();

        return {
            isAuthenticated: auth.isAuthenticated,
            userFullName: auth.userFullName
        };
    }
};