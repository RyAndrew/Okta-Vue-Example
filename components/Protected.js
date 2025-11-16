import { useAuth } from '../composables/useAuth.js'
import { useErrorHandler } from '../composables/useErrorHandler.js'

const { ref, onMounted } = Vue

export const Protected = {
    template: `
        <div class="container">
            <div class="card">
                <h1>🔒 Protected Page</h1>
                <p>This is a protected page. You must be authenticated to view this content.</p>
                
                <div v-if="user" class="user-info">
                    <h3>User Information:</h3>
                    <p><strong>Name:</strong> {{ user.name }}</p>
                    <p><strong>Email:</strong> {{ user.email }}</p>
                    <p><strong>Sub:</strong> {{ user.sub }}</p>
                </div>

                <div v-else class="loading">
                    Loading user information...
                </div>

                <div class="api-section" v-if="user">
                    <h3>API Test</h3>
                    <p>Test calling a protected API endpoint with your access token:</p>
                    <div class="button-group">
                        <button @click="callApi" :disabled="loading">
                            {{ loading ? 'Calling API...' : 'Call API' }}
                        </button>
                    </div>
                    
                    <div v-if="apiResponse" class="api-response" :class="apiResponseClass">
                        <strong>API Response:</strong>
                        {{ apiResponse }}
                    </div>
                </div>
            </div>

            <div class="card" v-if="tokens">
                <h1>🎫 Tokens</h1>
                
                <div class="token-section">
                    <div class="token-header">
                        <span class="token-type">Access Token</span>
                    </div>
                    <div class="token-content">{{ tokens.accessToken }}</div>
                    <h3>Access Token Claims:</h3>
                    <div class="token-decoded">
                        {{ tokens.accessTokenClaims }}
                    </div>
                </div>

                <div class="token-section">
                    <div class="token-header">
                        <span class="token-type">ID Token</span>
                    </div>
                    <div class="token-content">{{ tokens.idToken }}</div>
                    <h3>ID Token Claims:</h3>
                    <div class="token-decoded">
                        {{ tokens.idTokenClaims }}
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const auth = useAuth()
        const { handleError } = useErrorHandler()
        
        const tokens = ref(null)
        const loading = ref(false)
        const apiResponse = ref(null)
        const apiResponseClass = ref('')

        onMounted(async () => {
            try {
                tokens.value = await auth.getTokensWithClaims()
            } catch (error) {
                handleError(error, 'Failed to load tokens')
            }
        })

        const callApi = async () => {
            loading.value = true
            apiResponse.value = null
            apiResponseClass.value = ''
            
            try {
                const accessToken = await auth.getAccessToken()
                
                if (!accessToken) {
                    throw new Error('No access token available')
                }
                
                const response = await fetch('https://api.example.com/protected-endpoint', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
                
                const data = await response.json()
                apiResponse.value = JSON.stringify(data, null, 2)
                apiResponseClass.value = 'success'
            } catch (error) {
                apiResponse.value = `Error: ${error.message}`
                apiResponseClass.value = 'error'
                handleError(error, 'API call failed. Please check your connection and try again.')
            } finally {
                loading.value = false
            }
        }

        return {
            user: auth.user,
            tokens,
            loading,
            apiResponse,
            apiResponseClass,
            callApi
        }
    }
}
