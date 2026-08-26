<template>
  <div class="app-version-view">
    <van-nav-bar title="版本信息" left-arrow @click-left="$router.go(-1)" class="nav-bar" />

    <div class="version-content">
      <section class="hero-card">
        <div class="app-logo">{{ appInitial }}</div>
        <h1 class="app-name">{{ appName }}</h1>
        <p class="app-version">v{{ displayVersion }}</p>
        <span class="version-badge">当前已是最新版本</span>
      </section>

      <section class="info-card">
        <div class="info-row">
          <span class="info-label">版本号</span>
          <span class="info-value">{{ displayVersion }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">运行环境</span>
          <span class="info-value">{{ platformLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">构建环境</span>
          <span class="info-value">{{ envLabel }}</span>
        </div>
      </section>

      <p class="version-note">
        当前为 Web 应用预览版本，暂未接入自动更新。打包 App 后可在此展示安装包版本信息。
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useGlobalStore } from '@/stores/global'
import { APP_VERSION } from '@/constants/app'

const globalStore = useGlobalStore()
const nativeVersion = ref('')

const appName = computed(() => globalStore.APP_NAME || 'Self Youth')
const appInitial = computed(() => appName.value.charAt(0).toUpperCase())
const displayVersion = computed(() => nativeVersion.value || APP_VERSION)

const platformLabel = computed(() => {
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') return 'iOS App'
  if (platform === 'android') return 'Android App'
  return 'Web 浏览器'
})

const envLabel = computed(() => {
  if (globalStore.APP_ENV === 'development') return '开发环境'
  if (globalStore.APP_ENV === 'production') return '生产环境'
  return globalStore.APP_ENV || '未知'
})

onMounted(async () => {
  if (!Capacitor.isNativePlatform()) return

  try {
    const info = await App.getInfo()
    nativeVersion.value = info.version || ''
  } catch (error) {
    console.error('获取原生版本信息失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.app-version-view {
  min-height: 100vh;
  background: #f5f6f8;
}

.nav-bar {
  background: #fff;
}

.version-content {
  padding: 16px;
}

.hero-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 20px 28px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.app-logo {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2d8f5f 0%, #3cb371 100%);
  color: #fff;
  font-size: 32px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(45, 143, 95, 0.22);
}

.app-name {
  margin: 16px 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
}

.app-version {
  margin: 0;
  font-size: 15px;
  color: #666;
}

.version-badge {
  margin-top: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eef8f3;
  color: #2d8f5f;
  font-size: 12px;
  font-weight: 600;
}

.info-card {
  margin-top: 12px;
  padding: 4px 16px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.version-note {
  margin: 16px 8px 0;
  font-size: 12px;
  line-height: 1.6;
  color: #999;
  text-align: center;
}
</style>
