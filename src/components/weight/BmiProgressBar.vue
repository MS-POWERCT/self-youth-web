<template>
  <div class="bmi-progress">
    <div class="bmi-progress__status" :style="{ color: statusColor, backgroundColor: statusBgColor }">
      {{ statusLabel }}
    </div>

    <div class="bmi-progress__track-wrap">
      <div class="bmi-progress__marker" :style="{ left: `${markerPercent}%` }">
        <span class="bmi-progress__marker-dot" :style="{ borderColor: statusColor }" />
      </div>

      <div class="bmi-progress__track">
        <div
          v-for="segment in segments"
          :key="segment.label"
          class="bmi-progress__segment"
          :style="{ flex: segment.flex, backgroundColor: segment.color }"
        />
      </div>

      <div class="bmi-progress__ticks">
        <span
          v-for="tick in scaleTicks"
          :key="tick.value"
          class="bmi-progress__tick"
          :style="{ left: `${tick.percent}%` }"
        >
          {{ tick.label }}
        </span>
      </div>
    </div>

    <div class="bmi-progress__labels">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="bmi-progress__label-col"
        :style="{ flex: segment.flex }"
      >
        <span
          class="bmi-progress__label"
          :class="{ active: segment.label === statusLabel }"
          :style="segment.label === statusLabel ? { color: segment.color } : undefined"
        >
          {{ segment.label }}
        </span>
        <span
          class="bmi-progress__range"
          :class="{ active: segment.label === statusLabel }"
          :style="segment.label === statusLabel ? { color: segment.color } : undefined"
        >
          {{ segment.rangeText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  BMI_SEGMENTS,
  getBmiMarkerPercent,
  getBmiScaleTicks,
  getBmiSegmentRangeText,
  getBmiStatus,
  getBmiStatusColor,
} from '@/utils/weight'

const props = defineProps({
  bmi: {
    type: Number,
    default: null,
  },
})

const segments = computed(() =>
  BMI_SEGMENTS.map((segment) => ({
    ...segment,
    flex: segment.max - segment.min,
    rangeText: getBmiSegmentRangeText(segment),
  })),
)

const scaleTicks = computed(() => getBmiScaleTicks())

const statusLabel = computed(() => getBmiStatus(props.bmi) || '--')
const statusColor = computed(() => getBmiStatusColor(props.bmi))
const markerPercent = computed(() => getBmiMarkerPercent(props.bmi))

const statusBgColor = computed(() => {
  const color = statusColor.value
  return `${color}18`
})
</script>

<style scoped>
.bmi-progress {
  padding: var(--px-4) 0 var(--px-6);
}

.bmi-progress__status {
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--px-10);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--rem-8);
  font-weight: 600;
  line-height: 1.6;
}

.bmi-progress__track-wrap {
  position: relative;
  padding-top: 14px;
  padding-bottom: 18px;
}

.bmi-progress__marker {
  position: absolute;
  top: 0;
  z-index: 2;
  transform: translateX(-50%);
  transition: left 0.35s ease;
}

.bmi-progress__marker-dot {
  display: block;
  width: 14px;
  height: 14px;
  border: 3px solid #3d8f82;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.bmi-progress__track {
  display: flex;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.bmi-progress__segment:first-child {
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}

.bmi-progress__segment:last-child {
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.bmi-progress__ticks {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 14px;
}

.bmi-progress__tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 9px;
  line-height: 1;
  color: var(--gray500);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.bmi-progress__tick:first-child {
  transform: translateX(0);
}

.bmi-progress__tick:last-child {
  transform: translateX(-100%);
}

.bmi-progress__labels {
  display: flex;
  margin-top: var(--px-6);
}

.bmi-progress__label-col {
  min-width: 0;
  text-align: center;
}

.bmi-progress__label {
  display: block;
  font-size: var(--rem-7);
  color: var(--gray500);
  line-height: 1.2;
}

.bmi-progress__range {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: var(--gray500);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
}

.bmi-progress__label.active,
.bmi-progress__range.active {
  font-weight: 600;
  opacity: 1;
}
</style>
