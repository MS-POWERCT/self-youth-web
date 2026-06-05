<template>
  <div class="habit-page bg-gray50">
    <div class="text-center font-bold text-lg">
      <br />
      <IconifyIcon icon="fluent-color:circle-multiple-hint-checkmark-48" width="16" class="mr-2" />
      习惯管理
      <van-icon name="edit" size="18" @click="$router.push('/habits/edit?tab=' + (activeTab === 'check' ? '1' : '2'))"
        style="cursor: pointer;" />
    </div>
    <!-- left-arrow
      @click-left="$router.go(-1)" -->
    <!-- <template #right>
        <van-icon
          name="edit"
          size="18"
          @click="$router.push('/habits/edit?tab=' + (activeTab === 'check' ? '1' : '2'))"
          style="cursor: pointer;"
        />
      </template>
</van-nav-bar> -->
    <div class="habit-tabs mt-12">
      <van-tabs v-model:active="activeTab" @update:active="onTabChange">
        <van-tab title="打卡习惯" name="check">
          <CheckHabits />
        </van-tab>
        <van-tab title="数值习惯" name="value">
          <ValueHabits />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 统计入口 -->
    <div class="stats-button text-white" @click="$router.push('/habits/stats')">
      <van-icon name="chart-trending-o" size="24" />
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CheckHabits from '../components/habit/CheckHabits.vue'
import ValueHabits from '../components/habit/ValueHabits.vue'
import { useHabitStore } from '../stores/habit'

const habitStore = useHabitStore()

// 从localStorage恢复标签页状态
const savedTab = localStorage.getItem('habit-active-tab')
const activeTab = ref(savedTab || 'check')

// 标签页切换
const onTabChange = (name) => {
  activeTab.value = name
  // 保存到localStorage
  localStorage.setItem('habit-active-tab', name)
  // 切换标签时重新加载数据
  const type = name === 'check' ? '1' : '2'
  habitStore.fetchHabits(type)
}
onMounted(() => {
  // 根据保存的标签页状态加载对应的数据
  const type = activeTab.value === 'check' ? '1' : '2'
  habitStore.fetchHabits(type)
})
</script>

<style scoped>
.stats-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}
</style>
