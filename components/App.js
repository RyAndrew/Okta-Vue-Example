// components/App.js
import { useAuth } from '../composables/useAuth.js';

export const App = {
    template: `
        <div>
            <nav>
                <ul>
                    <li><router-link to="/">Home</router-link></li>
                    <li><router-link to="/protected">Protected Page</router-link></li>
                    <li class="auth-buttons">
                        <button v-if="!isAuthenticated" @click="handleLogin">Login</button>
                        <button v-else @click="handleLogout">Logout</button>
                    </li>
                </ul>
            </nav>
            <router-view />
            <div v-if="showLogoutModal" class="modal-overlay" @click="closeModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h2>Logged Out</h2>
                    </div>
                    <div class="modal-body">
                        <p>You have been successfully logged out.</p>
                    </div>
                    <div class="modal-footer">
                        <button @click="closeModal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const router = VueRouter.useRouter();
        const auth = useAuth(router);

        const handleLogin = () => {
            auth.login();
        };

        const handleLogout = () => {
            auth.logout(router);
        };

        return {
            isAuthenticated: auth.isAuthenticated,
            showLogoutModal: auth.showLogoutModal,
            handleLogin,
            handleLogout,
            closeModal: auth.closeModal
        };
    }
};
