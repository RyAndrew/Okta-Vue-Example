const { ref } = Vue

const errorMessage = ref('')
const showErrorModal = ref(false)

const handleError = (error, userMessage = 'An unexpected error occurred.') => {
    console.error('[Error Handler]:', error)
    errorMessage.value = userMessage
    showErrorModal.value = true
}

const clearError = () => {
    errorMessage.value = ''
    showErrorModal.value = false
}

export function useErrorHandler() {
    return {
        errorMessage,
        showErrorModal,
        handleError,
        clearError
    }
}
