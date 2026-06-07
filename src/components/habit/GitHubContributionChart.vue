<template>
  <div class="github-contribution-chart">
    <div class="chart-summary">
      <span class="summary-text" v-if="totalChecks > 0">
        已连续打卡 <strong>{{ currentStreak }}</strong> 天，
        总计 <strong>{{ totalChecks }}</strong> 次
      </span>
      <span class="summary-text" v-else>暂无打卡记录</span>
    </div>

    <div class="chart-scroll">
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
            <div
              class="weekday-label"
              v-for="(day, index) in weekdays"
              :key="index"
            >
              {{ day }}
            </div>
          </div>
          <div class="weeks-container">
            <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="week">
              <div
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                class="day-cell"
                :class="getDayClass(day)"
                :title="getDayTitle(day)"
                @click="onDayClick(day)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-footer">
      <h4 class="chart-title" v-if="title">{{ title }}</h4>
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
import { computed, onMounted, watch } from 'vue'

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

const weekdays = ['', '周一', '', '周三', '', '周五', '']

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

const monthLabels = computed(() => {
  const labels = []
  const months = ['1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月']

  if (weeks.value.length > 0) {
    const firstDate = weeks.value[0].find(d => d.date)?.date
    if (firstDate) {
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(firstDate)
        monthDate.setMonth(firstDate.getMonth() + i)

        if (monthDate <= new Date()) {
          const weekIndex = Math.floor(
            (monthDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          )
          if (weekIndex >= 0 && weekIndex < weeks.value.length) {
            labels.push({
              name: months[monthDate.getMonth()],
              left: weekIndex * (CELL_SIZE + CELL_GAP) + WEEKDAY_LABEL_WIDTH
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

watch(() => props.data, () => {}, { deep: true })

onMounted(() => {})
</script>

<style scoped>
.github-contribution-chart {
  --cell-size: 11px;
  --cell-gap: 3px;
  --weekday-label-width: 32px;

  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
}

.chart-summary {
  margin-bottom: 12px;
  font-size: 14px;
  color: #24292f;
  line-height: 1.5;
}

.chart-summary strong {
  font-weight: 600;
}

.chart-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  font-size: 12px;
  line-height: 16px;
  color: #57606a;
  white-space: nowrap;
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
  font-size: 12px;
  color: #57606a;
  text-align: left;
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
  transition: outline 0.1s ease;
}

.day-cell:hover:not(.empty) {
  outline: 1px solid rgba(27, 31, 36, 0.15);
  outline-offset: -1px;
}

.day-cell.empty {
  background: transparent;
  cursor: default;
}

.level-0,
.day-cell.level-0 {
  background: var(--github-contribution-color);
}

.level-1,
.day-cell.level-1 {
  background: var(--github-contribution-color-1);
}

.level-2,
.day-cell.level-2 {
  background: var(--github-contribution-color-2);
}

.level-3,
.day-cell.level-3 {
  background: var(--github-contribution-color-3);
}

.level-4,
.day-cell.level-4 {
  background: var(--github-contribution-color-4);
}

.chart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
}

.chart-title {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #57606a;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
}

.legend-text {
  font-size: 12px;
  color: #57606a;
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
</style>
