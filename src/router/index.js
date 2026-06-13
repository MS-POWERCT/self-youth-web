import { createRouter, createWebHashHistory } from 'vue-router'

import UserSettingsRoutes from '@/views/UserSettings/routes.js'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }, // 添加路由元信息，表示需要身份验证
    },
    {
      path: '/find/moments',
      name: 'Find Moments',
      component: () => import('../views/Finds/MomentsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/find/publish',
      name: 'Find Publish',
      component: () => import('../views/Finds/PublishMomentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits',
      name: 'habits',
      component: () => import('../views/HabitView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/find',
      name: 'find',
      component: () => import('../views/FindView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits/stats',
      name: 'habit-stats',
      component: () => import('../views/HabitStatsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits/edit',
      name: 'habit-edit',
      component: () => import('../views/HabitEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/demo/test-tool',
      name: 'test-tool-demo',
      component: () => import('../views/TestToolDemoView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mark',
      name: 'mark',
      component: () => import('../views/MarkView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mark/item',
      name: 'mark-item',
      component: () => import('../views/MarkItemView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mark/cycling',
      name: 'mark-cycling',
      component: () => import('../views/mark/CyclingView.vue'),
      meta: { requiresAuth: true },
    },

    // 用户设置路由
    ...UserSettingsRoutes,
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 💡 建议: 直接读取 localStorage 而非使用 store，可能导致状态不一致
  // 💡       建议改为: import { useUserStore } from '../stores/user'
  // 💡       const userStore = useUserStore()
  // 💡       const isAuthenticated = !!userStore.token
  const isAuthenticated = localStorage.getItem('user-token')
  const isVisitor = localStorage.getItem('visitor_id')

  // 如果用户已认证且访问登录页，自动跳转到首页
  if (to.path === '/login' && isAuthenticated) {
    next('/')
    return
  }

  // 如果需要认证但未登录，检查是否有游客身份
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated && !isVisitor) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
