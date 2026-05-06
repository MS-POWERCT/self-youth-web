<template>
  <div class="value-habits">

    <!-- 记录列表 -->
    <div class="records-container">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="!loading && valueRecords.length === 0" class="empty-state">
          <van-icon name="chart-trending-o" size="48" color="#c8c9cc" />
          <p>暂无记录</p>
        </div>
        
        <div v-else class="records-list">
          <div
            v-for="record in valueRecords"
            :key="record.id"
            class="record-item"
          >
          <!-- 格式n月n日record.record_date -->

            <div class="record-date">{{ formatDate(record.record_date) }}</div>
            <div class="record-info" v-for="v in record.list">
              <!-- <div class="record-habit">{{ getHabitName(record.habit_id) }}</div> -->
              
              <div class="record-time">{{formatTime(v.record_start_time)}}</div>
              <div class="record-name">
                <svg class="icon" aria-hidden="true">
                  <use :xlink:href="joinIcon(v.user_habit.icon)" />
                </svg>
                {{ v.user_habit.name }}
              </div>
              <div class="record-value">{{ v.value }} 分钟</div>
              <!-- <div class="record-time">{{ formatTime(record.record_start_time) }}</div> -->
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    
      </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useHabitStore } from '../../stores/habit'

const habitStore = useHabitStore()
const loading = ref(false)
const refreshing = ref(false)

const habits = computed(() => habitStore.habits)
const valueRecords = computed(() => habitStore.valueRecords)



// 格式化时间n月n日
const formatDate = (timeStr) => {
    return timeStr.slice(5, 10)
}
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
// 拼接
const joinIcon = (icon) => {
  return `#${icon}`
}

// 加载习惯列表
const loadHabits = async () => {
  try {
    loading.value = true
    await habitStore.fetchHabits('2')
    // 修复时区问题：使用本地时间格式化日期
    const today = new Date()
    await habitStore.fetchValueRecords()
  } catch (error) {
    console.error('加载习惯列表失败', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 刷新
const onRefresh = async () => {
  try {
    refreshing.value = true
    await habitStore.fetchHabits('2')
    const today = new Date().toISOString().split('T')[0]
    await habitStore.fetchValueRecords(20, today)
  } catch (error) {
    console.error('刷新失败', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}




onMounted(() => {
  loadHabits()
})
</script>

<style scoped>
.value-habits {
  background: #f7f8fa;
  min-height: calc(100vh);
  display: flex;
  flex-direction: column;
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 16px 20px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.page-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.header-date {
  margin: 0;
  font-size: 12px;
  color: #969799;
}

/* 记录列表容器 */
.records-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #969799;
}

.empty-state p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

/* 记录列表 */
.records-list {
  padding: 12px 0;
}

.record-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.record-info {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin: 8px;
}

.record-habit {
  flex: 1;
  font-size: 14px;
  color: #323233;
  font-weight: 500;
}

.record-value {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b6b;
  min-width: 60px;
  text-align: center;
}

.record-time {
  font-size: 12px;
  color: #969799;
  min-width: 60px;
  text-align: right;
}



</style>
