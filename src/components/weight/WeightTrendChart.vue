<template>
  <div class="weight-trend-chart" :class="{ compact }">
    <svg
      v-if="chartData.length"
      class="chart-svg"
      :viewBox="`0 0 ${width} ${chartHeight}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d8f82" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#3d8f82" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <line
        v-for="(tick, index) in yTicks"
        :key="`grid-${index}`"
        :x1="chartPadding.left"
        :y1="tick.y"
        :x2="width - chartPadding.right"
        :y2="tick.y"
        stroke="#eef1f3"
        stroke-width="1"
      />

      <text
        v-if="!compact"
        v-for="(tick, index) in yTicks"
        :key="`ylabel-${index}`"
        :x="chartPadding.left - 6"
        :y="tick.y + 3"
        fill="#9aa3ad"
        font-size="9"
        text-anchor="end"
      >
        {{ tick.label }}
      </text>

      <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradientId})`" />
      <path
        v-if="linePath"
        :d="linePath"
        fill="none"
        stroke="#3d8f82"
        :stroke-width="compact ? 2 : 2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <circle
        v-for="(point, index) in points"
        :key="`point-${index}`"
        :cx="point.x"
        :cy="point.y"
        :r="compact ? 3 : 4"
        fill="#ffffff"
        stroke="#3d8f82"
        stroke-width="2"
      />

      <text
        v-for="(point, index) in points"
        :key="`xlabel-${index}`"
        :x="point.x"
        :y="chartHeight - 6"
        fill="#9aa3ad"
        :font-size="compact ? 8 : 9"
        text-anchor="middle"
      >
        {{ point.date }}
      </text>
    </svg>

    <div v-else class="empty-chart">暂无趋势数据</div>
  </div>
</template>

<script setup>
import { computed, useId, unref } from 'vue'

const props = defineProps({
  series: {
    type: Array,
    default: () => [],
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const gradientId = useId().replace(/:/g, '')
const width = 320
const chartHeight = computed(() => (props.compact ? 96 : 160))
const chartPadding = computed(() =>
  props.compact
    ? { top: 8, right: 8, bottom: 16, left: 4 }
    : { top: 12, right: 12, bottom: 28, left: 36 },
)

const chartData = computed(() => {
  const raw = unref(props.series)
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .map((item) => ({
      date: item?.date ?? '',
      value: Number(item?.value),
    }))
    .filter((item) => item.date && !Number.isNaN(item.value))
})

const chartValues = computed(() => chartData.value.map((item) => item.value))

const yRange = computed(() => {
  if (!chartValues.value.length) {
    return { min: 0, max: 1 }
  }

  const minValue = Math.min(...chartValues.value)
  const maxValue = Math.max(...chartValues.value)
  const span = maxValue - minValue || 1
  const buffer = span * 0.15

  return {
    min: minValue - buffer,
    max: maxValue + buffer,
  }
})

const points = computed(() => {
  const pad = chartPadding.value
  const h = chartHeight.value
  const chartWidth = width - pad.left - pad.right
  const chartAreaHeight = h - pad.top - pad.bottom
  const count = chartData.value.length

  if (!count) {
    return []
  }

  const { min, max } = yRange.value
  const span = max - min || 1

  return chartData.value.map((item, index) => {
    const x = count === 1 ? pad.left + chartWidth / 2 : pad.left + (chartWidth * index) / (count - 1)
    const ratio = (item.value - min) / span
    const y = pad.top + chartAreaHeight * (1 - ratio)

    return {
      x,
      y,
      date: item.date,
      value: item.value,
    }
  })
})

const linePath = computed(() => {
  if (!points.value.length) {
    return ''
  }

  return points.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const areaPath = computed(() => {
  if (!points.value.length) {
    return ''
  }

  const pad = chartPadding.value
  const h = chartHeight.value
  const bottom = h - pad.bottom
  const first = points.value[0]
  const last = points.value[points.value.length - 1]

  return `${linePath.value} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`
})

const yTicks = computed(() => {
  const pad = chartPadding.value
  const h = chartHeight.value
  const chartAreaHeight = h - pad.top - pad.bottom
  const { min, max } = yRange.value
  const tickCount = props.compact ? 2 : 4

  return Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1)
    const value = max - (max - min) * ratio
    const y = pad.top + chartAreaHeight * ratio

    return {
      y,
      label: value.toFixed(1),
    }
  })
})
</script>

<style scoped>
.weight-trend-chart {
  width: 100%;
  height: 160px;
}

.weight-trend-chart.compact {
  height: 96px;
}

.chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray500);
  font-size: var(--rem-8);
}
</style>
