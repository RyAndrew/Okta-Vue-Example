import { useAuth } from '../composables/useAuth.js'
import { useErrorHandler } from '../composables/useErrorHandler.js'
import { BaseModal } from './BaseModal.js'

export const App = {
    components: {
        BaseModal
    },
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
            
            <BaseModal
                v-model="showLogoutModal"
                title="Logged Out"
                type="warning"
                @close="closeModal"
            >
                <p>You have been logged out.</p>
                <template #footer>
                    <button class="btn btn-primary" @click="closeModal">OK</button>
                </template>
            </BaseModal>
            
            <BaseModal
                v-model="showErrorModal"
                title="Error"
                type="error"
                @close="clearError"
            >
                <p>{{ errorMessage }}</p>
                <template #footer>
                    <button class="btn btn-primary" @click="clearError">OK</button>
                </template>
            </BaseModal>
        </div>
    `,
    setup() {
        const auth = useAuth()
        const errorHandler = useErrorHandler()

        return {
            isAuthenticated: auth.isAuthenticated,
            showLogoutModal: auth.showLogoutModal,
            handleLogin: auth.login,
            handleLogout: auth.logout,
            closeModal: auth.closeModal,
            showErrorModal: errorHandler.showErrorModal,
            errorMessage: errorHandler.errorMessage,
            clearError: errorHandler.clearError
        }
    }
}