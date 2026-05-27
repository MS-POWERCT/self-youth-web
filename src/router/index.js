import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import HabitView from '../views/HabitView.vue'
import HabitEditView from '../views/HabitEditView.vue'
import TestToolDemoView from '../views/TestToolDemoView.vue'
import FindView from '../views/FindView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
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
      component: HabitView,
      meta: { requiresAuth: true },
    },
    {
      path: '/find',
      name: 'find',
      component: FindView,
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
      component: HabitEditView,
      meta: { requiresAuth: true },
    },
    {
      path: '/demo/test-tool',
      name: 'test-tool-demo',
      component: TestToolDemoView,
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
