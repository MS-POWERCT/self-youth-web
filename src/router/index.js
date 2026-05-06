import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import HabitView from '../views/HabitView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
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
      path: '/habits/stats',
      name: 'habit-stats',
      component: () => import('../views/HabitStatsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user-token')
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
