<template>
  <div id="app">
    <router-view class="content" />
    <van-tabbar v-model="active" route v-if="showTabbar">
      <van-tabbar-item to="/habits">
        <template #icon>
          <Icon icon="fluent-color:beach-28" width="24" />
        </template>
        <div>习惯</div>
      </van-tabbar-item>
      <!-- <van-tabbar-item to="/about">
        <template #icon>
          <Icon icon="fluent-color:beach-28" width="24" />
        </template>
        <div>情侣</div>
      </van-tabbar-item>-->
      <van-tabbar-item to="/find/moments">
        <template #icon>
          <Icon icon="fluent-color:beach-28" width="24" />
        </template>
        <div>社交</div>
      </van-tabbar-item> 
      <van-tabbar-item to="/profile">
        <template #icon>
          <Icon icon="fluent-color:beach-28" width="24" />
        </template>
        <div>我</div>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const active = ref(0)

const showTabbar = computed(() => {
  // 在这里定义需要显示 tabbar 的路由名称
  const showTabbarRoutes = ['profile']
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

.content {
  padding-bottom: 50px; /* 为底部导航留出空间 */
}
.van-tabbar {
  position: fixed;
  bottom: 0;
  width: 100%;
}
</style>
