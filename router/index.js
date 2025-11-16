import { Home } from '../components/Home.js'
import { Protected } from '../components/Protected.js'
import { getBasePath } from '../config.js'

const { createRouter, createWebHistory } = VueRouter

export function createAppRouter() {
    return createRouter({
        history: createWebHistory(getBasePath()),
        routes: [
            {
                path: '/',
                component: Home
            },
            {
                path: '/protected',
                component: Protected,
                meta: { requiresAuth: true }
            },{
                path:'/:catchAll(.*)',
                redirect:function(to){
                    console.log('catch all route!',to)
                    return {path:'/', replace:true}
                }
            }
        ]
    })
}
