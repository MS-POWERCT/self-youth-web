<template>
  <div class="primary-tab-page habit-page">
    <PrimaryPageHeader :title="TAB_PAGE_LABELS.habits">
      <template #action>
        <button
          class="edit-btn"
          aria-label="编辑习惯"
          @click="$router.push('/habits/edit?tab=' + (activeTab === 'check' ? '1' : '2'))"
        >
          <IconifyIcon icon="fluent-color:edit-16" width="16" />
        </button>
      </template>
    </PrimaryPageHeader>

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

    <div class="habit-content">
      <CheckHabits v-show="activeTab === 'check'" />
      <ValueHabits v-show="activeTab === 'value'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CheckHabits from '../components/habit/CheckHabits.vue'
import ValueHabits from '../components/habit/ValueHabits.vue'
import { useHabitStore } from '../stores/habit'
import { TAB_PAGE_LABELS } from '@/constants/tabPages'
import PrimaryPageHeader from '@/components/layout/PrimaryPageHeader.vue'

defineOptions({ name: 'HabitView' })

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
.habit-tab-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--px-24);
  margin-bottom: var(--px-12);
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
}
</style>
