// main.js
import { App } from './components/App.js';
import { createAppRouter } from './router/index.js';

const { createApp } = Vue;

// Initialize the application
async function initializeApp() {
    console.log('initializeApp');

    //bugfix for back button - prevent page cache to re-render after piv fails and you hit back
    document.body.onunload=function(){}

    const app = createApp(App);
    const router = createAppRouter();
    
    app.use(router);
    app.mount('#app');
}

// Start the app
initializeApp();
