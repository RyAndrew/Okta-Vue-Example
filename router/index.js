// router/index.js
import { Home } from '../components/Home.js';
import { Protected } from '../components/Protected.js';
import { useAuth, BASE_PATH } from '../composables/useAuth.js';

const { createRouter, createWebHistory } = VueRouter;

export function createAppRouter() {
    const router = createRouter({
        history: createWebHistory(BASE_PATH),
        routes: [
            {
                path: '/',
                component: Home
            },
            {
                path: '/protected',
                component: Protected,
                meta: { requiresAuth: true }
            }
        ]
    });

    const auth = useAuth();
    router.beforeEach(auth.authGuard);

    return router;
}
