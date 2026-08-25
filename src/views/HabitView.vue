<template>
  <div class="habit-page">
    <header class="habit-header">
      <div class="habit-header-top mt-12">
        <h3 class="habit-title">习惯管理</h3>
        <button
          class="edit-btn"
          aria-label="编辑习惯"
          @click="$router.push('/habits/edit?tab=' + (activeTab === 'check' ? '1' : '2'))"
        >
          <IconifyIcon icon="fluent-color:edit-16" width="16" />
        </button>
      </div>
      <br/>
      <div class="habit-tab-bar">
        <button
          class="habit-tab"
          :class="{ active: activeTab === 'check' }"
          @click="onTabChange('check')"
        >
          打卡习惯
        </button>
        <button
          class="habit-tab"
          :class="{ active: activeTab === 'value' }"
          @click="onTabChange('value')"
        >
          数值习惯
        </button>
      </div>
    </header>

    <div class="habit-content">
      <CheckHabits v-show="activeTab === 'check'" />
      <ValueHabits v-show="activeTab === 'value'" />
    </div>

    <!-- <div class="stats-button" @click="$router.push('/habits/stats')">
      <IconifyIcon icon="streamline-stickies-color:graph-bar" width="24" />
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CheckHabits from '../components/habit/CheckHabits.vue'
import ValueHabits from '../components/habit/ValueHabits.vue'
import { useHabitStore } from '../stores/habit'

const habitStore = useHabitStore()

const savedTab = localStorage.getItem('habit-active-tab')
const activeTab = ref(savedTab || 'check')

const onTabChange = (name) => {
  activeTab.value = name
  localStorage.setItem('habit-active-tab', name)
  const type = name === 'check' ? '1' : '2'
  habitStore.fetchHabits(type)
}

onMounted(() => {
  const type = activeTab.value === 'check' ? '1' : '2'
  habitStore.fetchHabits(type)
})
</script>

<style scoped>
.habit-page {
  min-height: 100vh;
  background-color: #f4f5f7;
}

.habit-header {
  padding: var(--px-16) var(--px-16) 0;
  background-color: #f4f5f7;
}

.habit-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.habit-title {
  font-size: var(--rem-18);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.2;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background-color: #e4dcf5;
  cursor: pointer;
  flex-shrink: 0;
}

.habit-tab-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--px-24);
  margin-top: var(--px-20);
  border-bottom: 1px solid var(--gray300);
}

.habit-tab {
  position: relative;
  padding: 0 0 var(--px-12);
  border: none;
  background: none;
  font-size: var(--rem-10);
  font-weight: var(--number-500);
  color: var(--gray500);
  cursor: pointer;
}

.habit-tab.active {
  color: var(--black300);
  font-weight: var(--number-700);
}

.habit-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background-color: #3d8f82;
}

.habit-content {
  padding-bottom: 80px;
}

.stats-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--white);
  box-shadow: 0 4px 20px rgb(152, 187, 239);
  cursor: pointer;
  z-index: 1000;
}
</style>
