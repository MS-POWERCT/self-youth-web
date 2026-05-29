<template>
  <div class="progress-bar-container">
    <div class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-percent">{{ percent }}%</span>
    </div>
    <div class="progress-track bg-gray300">
      <div
        class="progress-fill"
        :style="{ width: `${percent}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: '当前进度'
  }
})

const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.floor((props.current / props.total) * 100)
})
</script>

<style lang="scss" scoped>
.progress-bar-container {
  border-radius: 16px;
  margin-top: 8px;
  padding: 8px;
  position: relative;
  overflow: hidden;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.progress-label {
  font-weight:500;
}

.progress-percent {
  font-weight:900;
}

.progress-track {
  height: 8px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #cae7f0 0%, #6f8fce 100%);
  border-radius: 6px;
  transition: width 0.5s ease-out;
}
</style>
