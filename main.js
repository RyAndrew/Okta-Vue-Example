import { App } from './components/App.js'
import { createAppRouter } from './router/index.js'
import { useAuth } from './composables/useAuth.js'

const { createApp } = Vue

function initializeApp() {
    console.log('Initializing App')

    //prevent bfc
    document.body.onunload=function(){}

    const app = createApp(App)
    const router = createAppRouter()
    useAuth(router)
    
    app.use(router)
    app.mount('#app')
}

initializeApp()