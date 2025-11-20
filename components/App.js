import { useAuth } from '../composables/useAuth.js'
import { useErrorHandler } from '../composables/useErrorHandler.js'
import { BaseModal } from './BaseModal.js'

const { useStore } = Vuex
const { computed } = Vue

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
                        <template v-else>
                            <span v-if="userFullName" class="username">{{ userFullName }}</span>
                            <button @click="handleLogout">Logout</button>
                        </template>
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
        const store = useStore()

        // Get username from Vuex store
        const userFullName = computed(() => store.getters['auth/userFullName'])

        return {
            isAuthenticated: auth.isAuthenticated,
            showLogoutModal: auth.showLogoutModal,
            userFullName,
            handleLogin: auth.login,
            handleLogout: auth.logout,
            closeModal: auth.closeModal,
            showErrorModal: errorHandler.showErrorModal,
            errorMessage: errorHandler.errorMessage,
            clearError: errorHandler.clearError
        }
    }
}