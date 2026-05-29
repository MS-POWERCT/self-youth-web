<template>
  <div id="app">
    <router-view class="content" />
    <van-tabbar v-model="active" route v-if="showTabbar">
      <van-tabbar-item to="/habits">
        <template #icon>
          <IconifyIcon icon="fluent-color:circle-multiple-hint-checkmark-48" width="24" />
        </template>
        <div>习惯</div>
      </van-tabbar-item>
      <van-tabbar-item to="/mark">
        <template #icon>
          <IconifyIcon icon="noto:kiss-mark" width="24" />
        </template>
        <div>标记</div>
      </van-tabbar-item>
      <van-tabbar-item to="/find">
        <template #icon>
          <IconifyIcon icon="fluent-color:alert-24" width="24" />
        </template>
        <div>发现</div>
      </van-tabbar-item>
      <van-tabbar-item to="/profile">
        <template #icon>
          <IconifyIcon icon="fluent-color:person-starburst-32" width="24" />
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
  const showTabbarRoutes = ['profile', 'habits', 'mark', 'find', 'home']
  return showTabbarRoutes.includes(route.name)
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
  padding: 0;
}

.van-tabbar {
  position: fixed;
  bottom: 0;
  width: 100%;
}
</style>
