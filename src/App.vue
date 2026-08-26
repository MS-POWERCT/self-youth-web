<template>
  <div id="app">
    <router-view />
    <van-tabbar class="app-van-tabbar" v-model="active" route v-if="showTabbar">
      <van-tabbar-item to="/weight">
        <template #icon>
          <IconifyIcon icon="fluent-emoji-flat:balance-scale" width="24" />
        </template>
        <div>体重</div>
      </van-tabbar-item>
      <van-tabbar-item to="/habits">
        <template #icon>
          <IconifyIcon icon="flat-color-icons:ok" width="24" />
        </template>
        <div>习惯</div>
      </van-tabbar-item>
      <van-tabbar-item to="/mark">
        <template #icon>
          <IconifyIcon icon="twemoji:pushpin" width="24" />
        </template>
        <div>标记</div>
      </van-tabbar-item>
      <van-tabbar-item to="/profile">
        <template #icon>
          <IconifyIcon icon="twemoji:anguished-face" width="24" />
        </template>
        <div>我</div>
      </van-tabbar-item>

    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

const showTabbar = computed(() => {
  // 在这里定义需要显示 tabbar 的路由名称
  const showTabbarRoutes = ['profile', 'habits', 'weight', 'mark', 'find', 'home']
  return showTabbarRoutes.includes(route.name)
})
</script>

<style scoped>
.app-van-tabbar {
  height: 4rem;
  left: var(--px-16);
  right: var(--px-16);
  bottom: calc(var(--px-12) + env(safe-area-inset-bottom, 0px));
  width: auto;
  border-radius: var(--radius-24);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
</style>
