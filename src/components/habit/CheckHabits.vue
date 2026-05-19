<template>
  <div class="check-habits">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 习惯列表 -->
      <div class="habits-list">
        <div
          v-for="habit in activeHabits"
          :key="habit.id"
          class="habit-item"
          :class="{ 'checked': isCheckedToday(habit.id) }"
          @click="toggleCheck(habit)"
        >
          <div class="habit-left">
            <div class="habit-icon">
              <van-icon
                :name="isCheckedToday(habit.id) ? 'success' : 'circle'"
                :color="isCheckedToday(habit.id) ? '#07c160' : '#c8c9cc'"
                size="20"
              />
            </div>
            <div class="habit-info">
              <svg class="icon" aria-hidden="true">
                <use :xlink:href="'#' + habit.icon" />
              </svg>
              <h4 class="habit-name">{{ habit.name }}</h4>
              <div class="habit-streak" v-if="habit.streak > 0">
                <van-icon name="fire" color="#ff6b6b" size="12" />
                <span>{{ habit.streak }}天连续</span>
              </div>
            </div>
          </div>

          <div class="habit-right">
            <van-button
              size="small"
              round
              :type="isCheckedToday(habit.id) ? 'default' : 'primary'"
              :loading="checkingId === habit.id"
              @click.stop="toggleCheck(habit)"
            >
              {{ isCheckedToday(habit.id) ? '已完成' : '打卡' }}
            </van-button>
          </div>
        </div>
      </div>

    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { useHabitStore } from '../../stores/habit'

const habitStore = useHabitStore()
const loading = ref(false)
const refreshing = ref(false)
const checkingId = ref(null)

const habits = computed(() => habitStore.habits)
const todayChecks = computed(() => habitStore.todayChecks)

const activeHabits = computed(() => {
  return habits.value.filter(habit => habit.is_show)
})

// 检查今日是否已打卡
const isCheckedToday = (habitId) => {
  return todayChecks.value.some(check => check.habit_id === habitId)
}

// 加载习惯列表
const loadHabits = async () => {
  try {
    loading.value = true
    await habitStore.fetchHabits('1')
    await habitStore.fetchTodayChecks()
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
    await habitStore.fetchHabits('1')
    await habitStore.fetchTodayChecks()
  } catch (error) {
    console.error('刷新失败', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 切换打卡状态
const toggleCheck = async (habit) => {
  try {
    checkingId.value = habit.id
    await habitStore.toggleCheck(habit.id)
    showToast(isCheckedToday(habit.id) ? '打卡成功' : '取消打卡成功')
  } catch (error) {
    console.error('打卡操作失败', error)
    showToast(error || '操作失败')
  } finally {
    checkingId.value = null
  }
}

onMounted(() => {
  loadHabits()
})
</script>

<style scoped>
.check-habits {
  background: #ffffff;
  position: relative;
}

/* 页面头部 */
.page-header {
  background: rgba(255, 255, 255, 0.9);
  margin: 12px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.header-title h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-date {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 20px;
}

.empty-content {
  text-align: center;
  padding: 30px 20px;
}

.empty-content h3 {
  margin: 16px 0 8px 0;
  font-size: 16px;
  color: #333;
}

.empty-content p {
  margin: 0 0 20px 0;
  color: #666;
}

/* 习惯列表 */
.habits-list {
  padding: 12px;
}

/* 习惯项 */
.habit-item{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f5f5f5;
  transition: all 0.2s ease;
}


.habit-item:last-child {
  margin-bottom: 0;
}

.habit-item.checked {
  background: #f8fffe;
  border-color: #e6f7ff;
  box-shadow: 0 2px 12px rgba(7, 193, 96, 0.08);
}

.habit-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.habit-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.habit-icon {
  margin-right: 12px;
}

.habit-info {
  flex: 1;
}

.habit-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.habit-streak {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 500;
}

.habit-right {
  margin-left: 12px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .habits-list {
    padding: 8px;
  }

  .habit-item {
    padding: 12px;
    margin-bottom: 6px;
  }

  .habit-name {
    font-size: 15px;
  }

  .habit-streak {
    font-size: 11px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.habit-card {
  animation: fadeIn 0.5s ease forwards;
}

.habit-card:nth-child(1) { animation-delay: 0.1s; }
.habit-card:nth-child(2) { animation-delay: 0.2s; }
.habit-card:nth-child(3) { animation-delay: 0.3s; }
.habit-card:nth-child(4) { animation-delay: 0.4s; }
</style>
