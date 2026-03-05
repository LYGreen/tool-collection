import { createRouter, createWebHistory } from 'vue-router'

const BASE_URL = import.meta.env.BASE_URL || '/';

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes: [
    { 
        path: '/', 
        component: () => import('../views/Home.vue') // 路由懒加载
    },
    {
        path: '/home',
        redirect: '/',
    },
    {
        path: '/tools/json-formatter',
        name: 'json-formatter',
        component: () => import('../views/tools/JsonFormatter.vue'),
        meta: { title: 'JSON 格式化', icon: '✨', desc: '格式化 JSON' },
    },
    {
        path: '/tools/uuid',
        name: 'uuid',
        component: () => import('../views/tools/Uuid.vue'),
        meta: { title: 'UUID 生成器', icon: '🆔', desc: '快速生成 UUID' }
    },
    {
        path: '/tools/pic-to-pdf',
        name: 'pic-to-pdf',
        component: () => import('../views/tools/PicToPdf.vue'),
        meta: { title: '图片转 PDF', icon: '📄', desc: '将多张图片合并并转换为 PDF 文档' }
    },
    {
        path: '/tools/snake',
        name: 'snake',
        component: () => import('../views/tools/Snake.vue'),
        meta: { title: '贪吃蛇', icon: '🐍', desc: '经典贪吃蛇游戏' }
    },
    {
        path: '/tools/minesweeper',
        name: 'minesweeper',
        component: () => import('../views/tools/Minesweeper.vue'),
        meta: { title: '扫雷', icon: '💣', desc: '经典的逻辑排雷游戏' }
    },
    // 404 路由 - 务必放在数组最后！
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: {
            hidden: true // 如果你的 Sidebar 逻辑会自动渲染所有路由，记得加个标志位过滤掉 404
        }
    },
    
]})

export default router
