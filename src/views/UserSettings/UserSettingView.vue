<template>
  <div class="mark-detail-view bg-gray300">
    <van-nav-bar title="设置" left-arrow @click-left="$router.go(-1)" />
  </div>

  <!-- 跳转登录管理 -->
  <van-cell title="登录管理" is-link @click="$router.push('/userSettings/account-login')" />
  <!-- 测试组件 -->
  <van-cell title="测试组件" is-link @click="$router.push('/demo/test-tool')" />
  <!-- 退出登录 -->
  <van-cell title="退出登录" is-link @click="handleLogout" />
</template>
<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
