<template>
  <div class="github-contribution-chart">
    <div class="chart-header">
      <h4 class="chart-title font-bold">{{ title }}</h4>
      <div class="chart-legend">
        <span class="legend-text">少</span>
        <div class="legend-levels">
          <div class="level level-0"></div>
          <div class="level level-1"></div>
          <div class="level level-2"></div>
          <div class="level level-3"></div>
          <div class="level level-4"></div>
        </div>
        <span class="legend-text">多</span>
      </div>
    </div>

    <div class="chart-container">
      <div class="months-label">
        <div
          v-for="(month, index) in monthLabels"
          :key="index"
          class="month-label"
          :style="{ left: month.left + 'px' }"
        >
          {{ month.name }}
        </div>
      </div>

      <div class="chart-grid">
        <div class="weekdays-label">
          <div class="weekday-label" v-for="day in weekdays" :key="day">
            {{ day }}
          </div>
        </div>

        <div class="weeks-container">
          <div
            v-for="(week, weekIndex) in weeks"
            :key="weekIndex"
            class="week"
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="day-cell"
              :class="getDayClass(day)"
              :title="getDayTitle(day)"
              @click="onDayClick(day)"
            >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-summary" v-if="totalChecks > 0">
      <span class="summary-text">
        已连续打卡 <strong>{{ currentStreak }}</strong> 天，
        总计 <strong>{{ totalChecks }}</strong> 次
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: '打卡统计'
  }
})

const emit = defineEmits(['day-click'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 生成最近一年的日期数据网格
const generateDateGrid = () => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)
  startDate.setDate(startDate.getDate() + 1) // 从明天开始，总共52周

  const grid = []
  let currentDate = new Date(startDate)

  // 确保从周日开始 (getDay() 返回 0 表示周日)
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // 生成52周的数据
  for (let week = 0; week < 52; week++) {
    const weekData = []

    for (let day = 0; day < 7; day++) {
      // 如果当前日期超过今天，则不显示
      if (currentDate > today) {
        weekData.push({ date: null, count: 0, level: 0 })
      } else {
        // 修复时区问题：使用本地时间格式化日期
      const dateStr = currentDate.getFullYear() + '-' +
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(currentDate.getDate()).padStart(2, '0')
        const count = props.data[dateStr] || 0

        weekData.push({
          date: new Date(currentDate),
          dateStr: dateStr,
          count: count,
          level: getLevel(count)
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    grid.push(weekData)
  }

  return grid
}

// 根据打卡次数确定颜色等级
const getLevel = (count) => {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

// 计算月份标签
const monthLabels = computed(() => {
  const labels = []
  const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                  '七月', '八月', '九月', '十月', '十一月', '十二月']

  if (weeks.value.length > 0) {
    const firstDate = weeks.value[0].find(d => d.date)?.date
    if (firstDate) {
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(firstDate)
        monthDate.setMonth(firstDate.getMonth() + i)

        if (monthDate <= new Date()) {
          const weekIndex = Math.floor((monthDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
          if (weekIndex >= 0 && weekIndex < weeks.value.length) {
            labels.push({
              name: months[monthDate.getMonth()],
              left: weekIndex * 15 + 30
            })
          }
        }
      }
    }
  }

  return labels
})

const weeks = computed(() => generateDateGrid())

const totalChecks = computed(() => {
  return Object.values(props.data).reduce((sum, count) => sum + count, 0)
})

const currentStreak = computed(() => {
  const today = new Date()
  let streak = 0

  // 从今天开始往前查找连续打卡
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    const count = props.data[dateStr] || 0

    if (count > 0) {
      streak++
    } else if (i > 0) { // 今天没打卡不算断
      break
    }
  }

  return streak
})

const getDayClass = (day) => {
  if (!day.date) return 'empty'
  return `level-${day.level}`
}

const getDayTitle = (day) => {
  if (!day.date) return ''
  const date = day.date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  return `${date}：${day.count}次打卡`
}

const onDayClick = (day) => {
  if (day.date && day.count > 0) {
    emit('day-click', day)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  console.log('数据更新:', props.data)
}, { deep: true })

onMounted(() => {
  console.log('GitHub贡献表组件挂载，数据:', props.data)
})
</script>

<style scoped>

.github-contribution-chart {
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-levels {
  display: flex;
  gap: 3px;
}

.level {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}


.chart-container {
  position: relative;
  overflow-x: auto;
}

.months-label {
  position: relative;
  height: 20px;
  margin-bottom: 8px;
}

.month-label {
  position: absolute;
  white-space: nowrap;
}

.chart-grid {
  display: flex;
  gap: 8px;
}

.weekdays-label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 2px;
}

.weekday-label {
  height: 12px;
  line-height: 12px;
  text-align: right;
  width: 20px;
}

.weeks-container {
  display: flex;
  gap: 3px;
}

.week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.day-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.day-cell:hover {
  transform: scale(1.2);
  z-index: 10;
}

.day-cell.empty {
  background: transparent;
}


.level-0 { background: var(--github-contribution-color); }
.level-1 { background: var(--github-contribution-color-1); }
.level-2 { background: var(--github-contribution-color-2); }
.level-3 { background: var(--github-contribution-color-3); }
.level-4 { background: var(--github-contribution-color-4); }

.day-cell.level-0 { background: var(--github-contribution-color); }
.day-cell.level-1 { background: var(--github-contribution-color-1); }
.day-cell.level-2 { background: var(--github-contribution-color-2); }
.day-cell.level-3 { background: var(--github-contribution-color-3); }
.day-cell.level-4 { background: var(--github-contribution-color-4); }


.chart-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
  text-align: center;
}


</style>
