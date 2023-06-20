import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/index',
    },
    {
        path: '/index',
        name: 'index',
        component: () => import('@/pages/index.vue'),
        meta: {
            navigation: '首页',
            unlogin: true,
        },
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
