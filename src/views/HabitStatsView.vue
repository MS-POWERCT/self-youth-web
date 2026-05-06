<template>
  <div class="habit-stats-page">
    <van-nav-bar
      title="习惯统计"
      left-arrow
      @click-left="$router.go(-1)"
    />
    
    <div class="stats-content">
      <!-- 调试信息 -->
      <div class="debug-info" style="padding: 10px; background: #f0f0f0; margin: 10px; border-radius: 5px;">
        <p>统计数据数量: {{ Object.keys(statsData).length }}</p>
        <p>总打卡次数: {{ totalChecks }}</p>
        <button @click="loadStatsData" style="padding: 5px 10px; margin: 5px;">重新加载数据</button>
        <div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
          <p v-for="(count, date) in statsData" :key="date">
            {{ date }}: {{ count }}次
          </p>
        </div>
      </div>

      <!-- GitHub风格贡献表 -->
      <GitHubContributionChart
        :data="statsData"
        :title="'打卡贡献图'"
        @day-click="onDayClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useHabitStore } from '../stores/habit'
import GitHubContributionChart from '../components/habit/GitHubContributionChart.vue'

const habitStore = useHabitStore()

const statsData = ref({})
const loading = ref(false)

const totalChecks = computed(() => {
  return Object.values(statsData.value).reduce((sum, count) => sum + count, 0)
})

// 加载统计数据
const loadStatsData = async () => {
  try {
    loading.value = true
    console.log('开始加载统计数据...')
    
    const response = await habitStore.checkStatsRecords()
    console.log('API响应:', response)
    
    // 处理API返回的数据格式
    if (response) {
      statsData.value = response
      console.log('处理后的统计数据:', statsData.value)
    } else {
      console.log('API返回数据格式不正确:', response)
      showToast('数据格式错误')
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
    showToast('加载失败: ' + (error.message || error))
  } finally {
    loading.value = false
  }
}

// 处理贡献表点击
const onDayClick = (day) => {
  showToast(`${day.dateStr} 打卡 ${day.count} 次`)
}

onMounted(() => {
  loadStatsData()
})
</script>

<style scoped>
.habit-stats-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.stats-content {
  padding: 12px 0;
}

.debug-info p {
  margin: 5px 0;
}
</style>