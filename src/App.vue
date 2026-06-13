<template>
  <div id="app">
    <router-view />
    <van-tabbar class="app-van-tabbar" v-model="active" route v-if="showTabbar">
      <van-tabbar-item to="/habits">
        <template #icon>
          <IconifyIcon icon="streamline-stickies-color:validation-1" width="24" />
        </template>
        <div>习惯</div>
      </van-tabbar-item>
      <van-tabbar-item to="/mark">
        <template #icon>
          <IconifyIcon icon="streamline-stickies-color:keyboard-direction" width="24" />
        </template>
        <div>标记</div>
      </van-tabbar-item>

      <van-tabbar-item to="/profile">
        <template #icon>
          <IconifyIcon icon="streamline-stickies-color:ghost-duo" width="24" />
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

<style scoped>
.app-van-tabbar {

  /* 高一点 */
  height: 4rem;

}
</style>
