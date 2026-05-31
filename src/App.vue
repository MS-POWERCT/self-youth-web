<template>
  <div id="app">
    <router-view/>
    <van-tabbar class="app-van-tabbar"  v-model="active" route v-if="showTabbar">
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
      <!-- <van-tabbar-item to="/find">
        <template #icon>
          <IconifyIcon icon="fluent-color:alert-24" width="24" />
        </template>
        <div>发现</div>
      </van-tabbar-item> -->
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

<style scoped>
.app-van-tabbar {

  /* 高一点 */
  height: 4rem;
  /* 背景渐变 */
  /* 背景渐变 - 从白色过渡到底部 */
  background: linear-gradient(to top,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 10%,
    rgba(255, 255, 255, 0.6) 30%,
    rgba(255, 255, 255, 0.9) 100%
  ),
  radial-gradient(circle at 20% 20%, rgba(237, 131, 131, 0.5) 0%, transparent 75%),
  radial-gradient(circle at 80% 20%, rgba(121, 236, 228, 0.5) 0%, transparent 75%);
  background-blend-mode: screen;
  /* 没有边框 */
  /* border: none; */
}
/* 选中的透明 变大*/
.app-van-tabbar .van-tabbar-item--active {
  background-color: transparent;
 }
</style>
