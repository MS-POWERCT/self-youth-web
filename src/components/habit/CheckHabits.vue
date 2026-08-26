<template>
  <div class="check-habits">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="habits-list">
        <div
          v-for="habit in activeHabits"
          :key="habit.id"
          class="habit-item"
          :class="{ checked: isCheckedToday(habit.id) }"
          @click="toggleCheck(habit)"
        >
          <div class="habit-body">
            <div class="habit-icon" :style="{ backgroundColor: getIconBg(habit.id) }">
              <IconifyIcon :icon="habit.habit_icon.icon" width="24" />
            </div>
            <div class="habit-info">
              <div class="habit-name">{{ habit.name }}</div>
              <div class="habit-meta">{{ getHabitMeta(habit) }}</div>
            </div>
          </div>

          <div class="check-indicator" :class="{ done: isCheckedToday(habit.id) }">
            <van-icon v-if="isCheckedToday(habit.id)" name="success" color="#fff" size="18" />
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

const iconBgColors = ['#fff3c4', '#ffe8d6', '#fff0b3', '#e8dff5', '#fce4ec']

const habits = computed(() => habitStore.habits)
const todayChecks = computed(() => habitStore.todayChecks)

const activeHabits = computed(() => {
  return habits.value.filter(habit => habit.is_show)
})

const getIconBg = (id) => iconBgColors[id % iconBgColors.length]

const getHabitMeta = (habit) => {
  const parts = []
  const time = habit.remind_time || habit.time || ''

  parts.push(time ? `每日 ${time}` : '每日')

  if (habit.streak > 0) {
    parts.push(`连续 ${habit.streak} 天`)
  }

  return parts.join(' · ')
}

const isCheckedToday = (habitId) => {
  return todayChecks.value.some(check => check.habit_id === habitId)
}

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

const toggleCheck = async (habit) => {
  try {
    checkingId.value = habit.id
    const wasChecked = isCheckedToday(habit.id)
    await habitStore.toggleCheck(habit.id)
    showToast(wasChecked ? '取消打卡成功' : '打卡成功')
  } catch (error) {
    console.error('打卡操作失败', error)
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
  background-color: #f4f5f7;
}

.habit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--px-12);
  padding: var(--px-16);
  margin-bottom: var(--px-12);
  border-radius: var(--radius-20);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.habit-item:last-child {
  margin-bottom: 0;
}

.habit-item:active {
  transform: scale(0.99);
}

.habit-body {
  display: flex;
  align-items: center;
  gap: var(--px-12);
  flex: 1;
  min-width: 0;
  transition: opacity 0.2s ease;
}

.habit-item.checked .habit-body {
  opacity: 0.45;
}

.habit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-12);
  flex-shrink: 0;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-name {
  font-size: var(--rem-10);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.4;
}

.habit-meta {
  margin-top: var(--px-4);
  font-size: var(--rem-8);
  color: var(--gray500);
  line-height: 1.4;
}

.check-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #3d8f82;
  background-color: transparent;
  flex-shrink: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.check-indicator.done {
  background-color: #3d8f82;
  border-color: #3d8f82;
}
</style>
