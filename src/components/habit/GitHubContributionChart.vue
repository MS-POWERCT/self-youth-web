<template>
  <div class="github-contribution-chart">
    <div class="chart-header">
      <div class="chart-title-row">
        <h3 class="chart-title">{{ title }}</h3>
      </div>
      <div class="chart-summary">
        <span class="summary-item">
          <span>连续 <strong>{{ currentStreak }}</strong> 天</span>
        </span>
        <span class="summary-divider">|</span>
        <span class="summary-item">
          <span>总计 <strong>{{ totalChecks }}</strong> 次</span>
        </span>
      </div>
    </div>

    <div class="period-tabs">
      <span v-for="period in periods" :key="period.value"
        :class="['period-tab', { active: selectedPeriod === period.value }]" @click="selectedPeriod = period.value">
        <!-- <IconifyIcon :icon="period.icon" width="20" /> -->
        <span>{{ period.label }}</span>
      </span>
    </div>

    <div class="chart-scroll">
      <div class="chart-container">
        <div class="months-label">
          <div v-for="(month, index) in visibleMonthLabels" :key="index" class="month-label"
            :style="{ left: month.left + 'px' }">
            {{ month.name }}
          </div>
        </div>

        <div class="chart-grid">
          <div class="weekdays-label">
            <div class="weekday-label" v-for="(day, index) in weekdays" :key="index">
              {{ day }}
            </div>
          </div>
          <div class="weeks-container">
            <div v-for="(week, weekIndex) in visibleWeeks" :key="weekIndex" class="week">
              <div v-for="(day, dayIndex) in week" :key="dayIndex" class="day-cell" :class="getDayClass(day)"
                :title="getDayTitle(day)" @click="onDayClick(day)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-footer">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const CELL_SIZE = 11
const CELL_GAP = 3
const WEEKDAY_LABEL_WIDTH = 32

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

const weekdays = ['', '一', '', '三', '', '五', '']

const periods = [
  { label: '3个月', value: '3m', icon: 'streamline-stickies-color:date-time-setting' },
  { label: '6个月', value: '6m', icon: 'streamline-stickies-color:date-time-setting' },
  { label: '今年', value: 'year', icon: 'streamline-stickies-color:date-time-setting' },
  { label: '全部', value: 'all', icon: 'streamline-stickies-color:date-time-setting' }
]

const selectedPeriod = ref('3m')

const generateDateGrid = () => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)
  startDate.setDate(startDate.getDate() + 2)
  const grid = []
  let currentDate = new Date(startDate)

  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() + 1)
  }

  for (let week = 0; week < 52; week++) {
    const weekData = []

    for (let day = 0; day < 7; day++) {
      if (currentDate > today) {
        weekData.push({ date: null, count: 0, level: 0 })
      } else {
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

const getLevel = (count) => {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

const weeks = computed(() => generateDateGrid())

const visibleWeeks = computed(() => {
  const allWeeks = weeks.value
  if (!allWeeks.length) return []

  const today = new Date()
  let startWeekIndex = 0

  switch (selectedPeriod.value) {
    case '3m':
      startWeekIndex = Math.max(0, allWeeks.length - 13)
      break
    case '6m':
      startWeekIndex = Math.max(0, allWeeks.length - 26)
      break
    case 'year': {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
      const firstWeekOfYear = allWeeks.findIndex(w =>
        w.some(d => d.date && d.date >= firstDayOfYear)
      )
      startWeekIndex = firstWeekOfYear >= 0 ? firstWeekOfYear : 0
      break
    }
    case 'all':
    default:
      startWeekIndex = 0
      break
  }

  return allWeeks.slice(startWeekIndex)
})

const visibleMonthLabels = computed(() => {
  if (!weeks.value.length || !visibleWeeks.value.length) return []

  const months = ['1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月']

  const labels = []
  const firstWeekIndex = weeks.value.length - visibleWeeks.value.length
  const firstDate = weeks.value[firstWeekIndex]?.find(d => d.date)?.date

  if (firstDate) {
    const endDate = new Date()
    let currentMonth = firstDate.getMonth()
    let currentYear = firstDate.getFullYear()

    while (currentYear < endDate.getFullYear() ||
      (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth())) {
      const monthDate = new Date(currentYear, currentMonth, 1)
      const weekIndex = Math.floor(
        (monthDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + firstWeekIndex

      if (weekIndex >= firstWeekIndex && weekIndex < weeks.value.length) {
        labels.push({
          name: months[currentMonth],
          left: (weekIndex - firstWeekIndex) * (CELL_SIZE + CELL_GAP) + WEEKDAY_LABEL_WIDTH
        })
      }

      currentMonth++
      if (currentMonth > 11) {
        currentMonth = 0
        currentYear++
      }
    }
  }

  return labels
})

const totalChecks = computed(() => {
  return Object.values(props.data).reduce((sum, count) => sum + count, 0)
})

const currentStreak = computed(() => {
  const today = new Date()
  let streak = 0

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    const count = props.data[dateStr] || 0

    if (count > 0) {
      streak++
    } else if (i > 0) {
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

watch(() => props.data, () => { }, { deep: true })

onMounted(() => { })
</script>

<style scoped>
.github-contribution-chart {
  --cell-size: 11px;
  --cell-gap: 3px;
  --weekday-label-width: 24px;

  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #8c9ad7 0%, #9770bf 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.chart-header {
  margin-bottom: 12px;
}

.chart-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.chart-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-item strong {
  color: #fff;
  font-weight: 600;
}

.summary-divider {
  color: rgba(255, 255, 255, 0.5);
}

.icon-flame {
  color: #ffd700;
}

.icon-check {
  color: #4ade80;
}

.period-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.period-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.period-tab:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.period-tab.active {
  color: #a9b5ed;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chart-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
}

.chart-scroll::-webkit-scrollbar {
  height: 4px;
}

.chart-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.chart-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.chart-container {
  position: relative;
  display: inline-block;
  min-width: min-content;
}

.months-label {
  position: relative;
  height: 16px;
  margin-bottom: 4px;
  margin-left: var(--weekday-label-width);
}

.month-label {
  position: absolute;
  top: 0;
  font-size: 11px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  font-weight: 500;
}

.chart-grid {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.weekdays-label {
  display: flex;
  flex-direction: column;
  gap: var(--cell-gap);
  flex-shrink: 0;
  width: var(--weekday-label-width);
  padding-top: 0;
}

.weekday-label {
  height: var(--cell-size);
  line-height: var(--cell-size);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  flex-shrink: 0;
}

.weeks-container {
  display: flex;
  gap: var(--cell-gap);
  flex-shrink: 0;
}

.week {
  display: flex;
  flex-direction: column;
  gap: var(--cell-gap);
  flex-shrink: 0;
}

.day-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  min-width: var(--cell-size);
  min-height: var(--cell-size);
  border-radius: 2px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.day-cell:hover:not(.empty) {
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.day-cell.empty {
  background: transparent;
  cursor: default;
}

.level-0,
.day-cell.level-0 {
  background: rgba(255, 255, 255, 0.15);
}

.level-1,
.day-cell.level-1 {
  background: rgba(74, 222, 128, 0.4);
}

.level-2,
.day-cell.level-2 {
  background: rgba(74, 222, 128, 0.6);
}

.level-3,
.day-cell.level-3 {
  background: rgba(74, 222, 128, 0.8);
}

.level-4,
.day-cell.level-4 {
  background: #4ade80;
}

.chart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-levels {
  display: flex;
  gap: var(--cell-gap);
}

.level {
  width: var(--cell-size);
  height: var(--cell-size);
  min-width: var(--cell-size);
  min-height: var(--cell-size);
  border-radius: 2px;
  flex-shrink: 0;
}

.chart-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
