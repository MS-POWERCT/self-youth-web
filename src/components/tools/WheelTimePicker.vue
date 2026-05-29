<template>
  <div class="time-picker-container">
    <!-- 标题栏 -->
    <div class="picker-header">
      <span class="picker-title">时长</span>
      <span class="keyboard-input" @click="toggleInputMode">
        {{ inputMode ? '滚轮选择' : '键盘输入' }}
      </span>
    </div>

    <!-- 主体内容容器 -->
    <div class="picker-body">
      <!-- 滚轮模式 -->
      <div v-if="!inputMode" class="wheel-container">
        <!-- 沙漏图标 -->
         <div class="hourglass-wrapper">
          <IconifyIcon icon="twemoji:hourglass-done" class="cell-icon" width="80"/>
        </div>

        <!-- 分钟滚轮 -->
        <div class="wheel-wrapper">
          <div
            class="wheel"
            :style="{ transform: `translateY(${minuteOffset}px)` }"
            @touchstart="handleTouchStart($event, 'minute')"
            @touchmove="handleTouchMove($event, 'minute')"
            @touchend="handleTouchEnd('minute')"
            @mousedown="handleMouseDown($event, 'minute')"
          >
            <div
              v-for="(item, index) in minuteOptions"
              :key="index"
              class="wheel-item"
              :class="{ active: index === selectedMinuteIndex }"
            >
              {{ item }}
            </div>
          </div>
        </div>

        <!-- 单位 -->
        <div class="unit-wrapper">
          <span class="unit">分钟</span>
        </div>

        <!-- 选中框 -->
        <div class="picker-mask"></div>
        <div class="picker-highlight"></div>
      </div>

      <!-- 键盘输入模式 -->
      <div v-else class="keyboard-container">
        <div class="keyboard-display" @touchstart.stop="showKeyboard = true">
          <span class="display-value">{{ inputValue || '0' }}</span>
          <span class="display-unit">分钟</span>
        </div>
      </div>
    </div>


    <!-- Vant数字键盘Popup -->
      <van-number-keyboard
        v-model="inputValue"
        :show="showKeyboard"
        :maxlength="3"
        @blur="handleKeyboardBlur"
      />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 30
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputMode = ref(false)
const selectedMinute = ref(props.modelValue)
const selectedMinuteIndex = ref(0)
const minuteOffset = ref(0)
const inputValue = ref('')
const showKeyboard = ref(false)
// 最大可选择的分钟数
const maxMinute = 240

const itemHeight = 44
const visibleItems = 5
const centerIndex = Math.floor(visibleItems / 2)

const touchStartY = ref({})
const touchCurrentOffset = ref({})
const isDragging = ref({ minute: false })

const minuteOptions = ref([])
const step = ref(5)

const generateMinuteOptions = (value) => {
  const options = []
  console.log('value', value)

  // 检查传入的值是否是5的倍数，如果不是则使用步长1
  if (value % 5 !== 0) {
    step.value = 1
    for (let i = 1; i <= maxMinute; i += 1) {
      options.push(`${i}`)
    }
  } else {
    step.value = 5
    for (let i = 5; i <= maxMinute; i += 5) {
      options.push(`${i}`)
    }
  }
  return options
}

const getMaxIndex = () => minuteOptions.value.length - 1

const getIndexFromOffset = (offset) => Math.round(-offset / itemHeight) + centerIndex

const getOffsetFromIndex = (index) => -(index - centerIndex) * itemHeight

const updateValue = (value) => {
  selectedMinute.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

const toggleInputMode = () => {
  if (inputMode.value) {
    inputMode.value = false
  } else {
    inputValue.value = String(selectedMinute.value)
    inputMode.value = true
  }
}

const handleKeyboardBlur = () => {
  showKeyboard.value = false
  let val = parseInt(inputValue.value) || 0
  updateValue(val)
}

const handleTouchStart = (event, type) => {
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  touchStartY.value[type] = clientY
  touchCurrentOffset.value[type] = minuteOffset.value
  isDragging.value[type] = true
}

const handleTouchMove = (event, type) => {
  if (!isDragging.value[type]) return
  event.preventDefault()

  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  const deltaY = clientY - touchStartY.value[type]
  let newOffset = touchCurrentOffset.value[type] + deltaY

  const maxIndex = getMaxIndex()
  const minOffset = getOffsetFromIndex(maxIndex)
  const maxOffset = getOffsetFromIndex(0)
  newOffset = Math.max(minOffset, Math.min(maxOffset, newOffset))

  minuteOffset.value = newOffset
}

const handleTouchEnd = (type) => {
  if (!isDragging.value[type]) return
  isDragging.value[type] = false

  const currentOffset = minuteOffset.value
  let index = getIndexFromOffset(currentOffset)

  const maxIndex = getMaxIndex()
  index = Math.max(0, Math.min(maxIndex, index))

  const newOffset = getOffsetFromIndex(index)

  selectedMinuteIndex.value = index
  minuteOffset.value = newOffset
  const newValue = parseInt(minuteOptions.value[index])
  updateValue(newValue)
}

const handleMouseDown = (event, type) => handleTouchStart(event, type)

const handleMouseMoveGlobal = (event) => {
  if (isDragging.value.minute) {
    handleTouchMove(event, 'minute')
  }
}

const handleMouseUpGlobal = () => {
  if (isDragging.value.minute) {
    handleTouchEnd('minute')
  }
}

watch(() => props.modelValue, (val) => {
  if (val !== selectedMinute.value && !inputMode.value) {
    const index = minuteOptions.value.findIndex(item => parseInt(item) === val)
    if (index >= 0) {
      selectedMinuteIndex.value = index
      minuteOffset.value = getOffsetFromIndex(index)
      selectedMinute.value = val
    }
  }
})

onMounted(() => {
  minuteOptions.value = generateMinuteOptions(props.modelValue)

  const defaultIndex = minuteOptions.value.findIndex(item => parseInt(item) === props.modelValue)
  selectedMinuteIndex.value = defaultIndex >= 0 ? defaultIndex : 5

  selectedMinute.value = parseInt(minuteOptions.value[selectedMinuteIndex.value])
  minuteOffset.value = getOffsetFromIndex(selectedMinuteIndex.value)

  document.addEventListener('mousemove', handleMouseMoveGlobal)
  document.addEventListener('mouseup', handleMouseUpGlobal)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMoveGlobal)
  document.removeEventListener('mouseup', handleMouseUpGlobal)
})
</script>

<style lang="scss" scoped>
.time-picker-container {
  background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 16px;
  position: relative;
  width: 300px;
  height: 320px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  flex-shrink: 0;

  .picker-title {
    font-weight: 600;
  }

  .keyboard-input {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.1);
    transition: all 0.2s;

    &:hover {
      background: rgba(59, 130, 246, 0.2);
    }
  }
}

.picker-body {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 16px;
  width: 100%;
  height: 100%;
}

.hourglass-wrapper {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

}

.wheel-wrapper {
  width: 80px;
  height: 220px;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.wheel {
  position: relative;
  transition: transform 0.1s ease-out;
  user-select: none;
}

.wheel-item {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
}

.wheel-item.active {
  font-weight: 600;
}

.unit-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .unit {
    font-weight: 500;
  }
}

.picker-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(240, 247, 255, 0.95), transparent 15%, transparent 85%, rgba(240, 247, 255, 0.95));
  pointer-events: none;
  z-index: 10;
  border-radius: 8px;
}

.picker-highlight {
  position: absolute;
  top: 7.7rem;
  left: 10.2rem;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 44px;
  border-top: 2px solid var(--info-primary);
  border-bottom: 2px solid var(--info-primary);
  background: rgba(59, 130, 246, 0.08);
  pointer-events: none;
  z-index: 10;
  border-radius: 4px;
}

.keyboard-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.keyboard-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 40px;
  background: var(--white);
  border-radius: 12px;
  border: 2px solid var(--info-primary);
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: rgba(59, 130, 246, 0.05);
  }

  .display-value {
    font-weight: 700;
    min-width: 80px;
    text-align: center;
  }

  .display-unit {
    font-weight: 500;
  }
}

.keyboard-actions {
  flex-shrink: 0;
  margin-top: 10px;
}
</style>
