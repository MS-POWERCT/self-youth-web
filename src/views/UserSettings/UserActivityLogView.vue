<template>
  <div class="activity-log-view">
    <van-nav-bar title="活动记录" left-arrow @click-left="$router.go(-1)" />

    <div class="log-content">
      <div v-if="loading" class="loading-state">
        <van-loading size="24" />
      </div>

      <div v-else-if="userLog.length === 0" class="empty-state">
        <IconifyIcon icon="streamline-stickies-color:bell-duo" width="48" />
        <p>暂无活动记录</p>
      </div>

      <div v-else class="log-list">
        <div v-for="item in userLog" :key="item.id" class="log-item">
          <div class="log-icon" :style="{ backgroundColor: getLogIconBg(item.type) }">
            <IconifyIcon :icon="getLogIcon(item.type)" width="18" />
          </div>
          <div class="log-info">
            <div class="log-text">{{ item.log }}</div>
            <div class="log-time" :class="{ muted: !isToday(item.updated_at) }">
              {{ formatLogTime(item.updated_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userLog = ref([])
const loading = ref(false)

const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const formatLogTime = (dateString) => {
  if (!dateString) return ''
  if (isToday(dateString)) {
    return dateString.substring(11, 16)
  }
  return dateString.substring(5, 16).replace('-', '月').replace(' ', '日 ')
}

const getLogIcon = (type) => {
  if (type === 'mark') {
    return 'streamline-stickies-color:keyboard-direction'
  }
  if (type === 'habit') {
    return 'streamline-stickies-color:validation-1'
  }
  return 'streamline-stickies-color:star-duo'
}

const getLogIconBg = (type) => {
  if (type === 'mark') {
    return '#dce8f5'
  }
  if (type === 'habit') {
    return '#d4f0e8'
  }
  return '#fff3c4'
}

const loadUserLog = async () => {
  try {
    loading.value = true
    const log = await userStore.getUserLog()
    userLog.value = log || []
  } catch (error) {
    console.error('加载用户操作日志失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserLog()
})
</script>

<style scoped>
.activity-log-view {
  min-height: 100vh;
  background-color: #f4f5f7;
}

.log-content {
  padding: var(--px-16);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--gray500);
}

.empty-state p {
  margin-top: var(--px-12);
  font-size: var(--rem-9);
}

.log-list {
  background-color: var(--white);
  border-radius: var(--radius-16);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.log-item {
  display: flex;
  align-items: center;
  gap: var(--px-12);
  padding: var(--px-16);
  border-bottom: 1px solid var(--gray300);
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-12);
  flex-shrink: 0;
}

.log-info {
  flex: 1;
  min-width: 0;
}

.log-text {
  font-size: var(--rem-10);
  color: var(--black300);
  line-height: 1.4;
}

.log-time {
  margin-top: var(--px-4);
  font-size: var(--rem-8);
  color: #3d8f82;
  line-height: 1.4;
}

.log-time.muted {
  color: var(--gray500);
}
</style>
