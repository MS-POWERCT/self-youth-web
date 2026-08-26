<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="PRIMARY_TAB_PAGE_NAMES">
        <component :is="Component" :key="route.name" />
      </keep-alive>
    </router-view>
    <van-tabbar class="app-van-tabbar" v-model="active" route v-if="showTabbar">
      <van-tabbar-item
        v-for="tab in PRIMARY_TAB_PAGES"
        :key="tab.name"
        :to="tab.route"
      >
        <template #icon>
          <IconifyIcon :icon="tab.icon" width="24" />
        </template>
        <div>{{ tab.label }}</div>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { PRIMARY_TAB_PAGES } from '@/constants/tabPages'

const PRIMARY_TAB_PAGE_NAMES = PRIMARY_TAB_PAGES.map((tab) => tab.componentName)

const route = useRoute()
const active = ref(0)

const showTabbar = computed(() => {
  const showTabbarRoutes = PRIMARY_TAB_PAGES.map((tab) => tab.name)
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
