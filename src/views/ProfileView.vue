<template>
  <div class="primary-tab-page profile-container">
    <PrimaryPageHeader />

    <template v-if="userStore.token && userStore.user">
      <div class="profile-section">
        <div class="avatar-wrap">
          <div class="avatar-inner">
            <van-image
              round
              fit="cover"
              width="76"
              height="76"
              :src="userStore.user.avatar || `https://picsum.photos/seed/${userStore.user.id}/152/152`"
            />
          </div>
        </div>
        <div class="profile-name">{{ userStore.user.name || '用户名' }}</div>
      </div>

      <div class="statistics-card">
        <div class="stat-item">
          <div class="stat-value">{{ userStore.user.continuous_days_check || 0 }}<span class="stat-unit">天</span></div>
          <div class="stat-label">连续打卡</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userStore.user.continuous_days_value || 0 }}<span class="stat-unit">天</span></div>
          <div class="stat-label">连续记录</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userStore.user.mark_user_count || 0 }}</div>
          <div class="stat-label">累计标记</div>
        </div>
      </div>

      <div class="menu-card">
        <div
          v-for="(item, index) in menuItems"
          :key="item.label"
          class="menu-item"
          :class="{ 'no-border': index === menuItems.length - 1 }"
          @click="handleMenuClick(item)"
        >
          <div class="menu-left">
            <div class="menu-icon" :style="{ backgroundColor: item.bgColor }">
              <IconifyIcon :icon="item.icon" width="20" />
            </div>
            <span class="menu-label">{{ item.label }}</span>
          </div>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '../stores/user'
import { TAB_PAGE_LABELS } from '@/constants/tabPages'
import PrimaryPageHeader from '@/components/layout/PrimaryPageHeader.vue'

defineOptions({ name: 'ProfileView' })

const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  {
    label: '统计数据',
    icon: 'glyphs-poly:analytics',
    bgColor: '#d4f0e8',
    route: '/habits/stats',
  },
  {
    label: '活动记录',
    icon: 'material-icon-theme:folder-log',
    bgColor: '#e8dff5',
    route: '/userSettings/activity-log',
  },
  {
    label: '数据导出',
    icon: 'fluent-color:data-trending-20',
    bgColor: '#fce4ec',
    action: 'export',
  },
  {
    label: '关于',
    icon: 'flat-color-icons:about',
    bgColor: '#fff3c4',
    action: 'about',
  },
  {
    label: '设置',
    icon: 'material-icon-theme:settings',
    bgColor: '#dce8f5',
    route: '/userSettings/statistics',
  },

]

const handleMenuClick = (item) => {
  if (item.route) {
    router.push(item.route)
    return
  }

  if (item.action === 'export') {
    showToast('功能开发中')
    return
  }

  if (item.action === 'about') {
    showToast('Self Youth')
  }
}

onMounted(async () => {
  await userStore.getUserInfo()
})
</script>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--px-16);
}

.avatar-wrap {
  position: relative;
  width: 84px;
  height: 84px;
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(145deg, #5ec9a8 0%, #56b8d9 48%, #6a90d8 100%);
  box-shadow:
    0 8px 24px rgba(94, 185, 170, 0.32),
    0 2px 8px rgba(91, 155, 213, 0.16);
}

.avatar-wrap::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(94, 203, 160, 0.18) 0%, transparent 70%);
  z-index: -1;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  padding: 2px;
  border-radius: 50%;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

.avatar-inner :deep(.van-image) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-inner :deep(.van-image__img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  margin-top: var(--px-12);
  font-size: var(--rem-12);
  font-weight: var(--number-700);
  color: var(--black300);
}

.profile-subtitle {
  margin-top: var(--px-4);
  font-size: var(--rem-9);
  color: var(--gray500);
}

.statistics-card {
  display: flex;
  justify-content: space-around;
  padding: var(--px-20) var(--px-16);
  margin-bottom: var(--px-16);
  border-radius: var(--radius-16);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: var(--rem-16);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.2;
}

.stat-unit {
  font-size: var(--rem-10);
  font-weight: var(--number-500);
  margin-left: 2px;
}

.stat-label {
  margin-top: var(--px-6);
  font-size: var(--rem-8);
  color: var(--gray500);
}

.menu-card {
  border-radius: var(--radius-16);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--px-16);
  border-bottom: 1px solid var(--gray300);
  cursor: pointer;
}

.menu-item.no-border {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: var(--px-12);
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-12);
  flex-shrink: 0;
}

.menu-label {
  font-size: var(--rem-10);
  font-weight: var(--number-500);
  color: var(--black300);
}

.menu-arrow {
  color: #c8c9cc;
  font-size: 14px;
  flex-shrink: 0;
}
</style>
