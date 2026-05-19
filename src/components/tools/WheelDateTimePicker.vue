<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '18rem' }" @closed="onPopupClosed">
    <div class="picker-header">
      <span class="picker-cancel" @click="handleCancel">取消</span>
      <span class="picker-title">选择日期时间</span>
      <span class="picker-confirm" @click="handleConfirm">确定</span>
    </div>
    <div class="wheel-container">
      <!-- 日期滚轮 -->
      <div class="wheel-wrapper">
        <div
          class="wheel"
          :style="{ transform: `translateY(${dateOffset}px)` }"
          @touchstart="handleTouchStart($event, 'date')"
          @touchmove="handleTouchMove($event, 'date')"
          @touchend="handleTouchEnd('date')"
          @mousedown="handleMouseDown($event, 'date')"
        >
          <div
            v-for="(item, index) in dateOptions"
            :key="index"
            class="wheel-item date-item"
            :class="{ active: index === selectedDateIndex }"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <!-- 分隔符 -->
      <div class="wheel-separator">
        <span>:</span>
      </div>

      <!-- 小时滚轮 -->
      <div class="wheel-wrapper">
        <div
          class="wheel"
          :style="{ transform: `translateY(${hourOffset}px)` }"
          @touchstart="handleTouchStart($event, 'hour')"
          @touchmove="handleTouchMove($event, 'hour')"
          @touchend="handleTouchEnd('hour')"
          @mousedown="handleMouseDown($event, 'hour')"
        >
          <div
            v-for="(item, index) in hourOptions"
            :key="index"
            class="wheel-item"
            :class="{ active: index === selectedHourIndex }"
          >
            {{ item }}
          </div>
        </div>
      </div>

      <!-- 分隔符 -->
      <div class="wheel-separator">
        <span>:</span>
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
    </div>

    <!-- 选中框 -->
    <div class="picker-mask"></div>
    <div class="picker-highlight"></div>
  </van-popup>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  defaultDate: {
    default: () => new Date()
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const visible = ref(props.show)

watch(() => props.show, (val) => {
  visible.value = val
})

// 选中的值
const selectedYear = ref(0)
const selectedMonth = ref(0)
const selectedDay = ref(0)
const selectedHour = ref(0)
const selectedMinute = ref(0)

// 选中的索引
const selectedDateIndex = ref(0)
const selectedHourIndex = ref(0)
const selectedMinuteIndex = ref(0)

// 偏移量
const dateOffset = ref(0)
const hourOffset = ref(0)
const minuteOffset = ref(0)

// 滚轮项高度
const itemHeight = 44
// 可见项数量
const visibleItems = 5
// 中间位置（第3项）
const centerIndex = Math.floor(visibleItems / 2)

// 触摸状态
const touchStartY = ref({})
const touchCurrentOffset = ref({})
const isDragging = ref({ date: false, hour: false, minute: false })

// 日期选项
const dateOptions = ref([])
// 小时选项
const hourOptions = ref([])
// 分钟选项
const minuteOptions = ref([])

// 生成日期选项（未来90天）
const generateDateOptions = () => {
  const options = []
  const now = new Date()

  for (let i = 0; i < 90; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    let label = ''
    if (i === 0) {
      label = `${month}月${day}日今天`
    } else {
      label = `${month}月${day}日`
    }

    options.push({
      year,
      month,
      day,
      label
    })
  }
  // 倒叙
  options.reverse()

  return options
}

// 生成小时选项
const generateHourOptions = () => {
  const options = []
  for (let i = 0; i < 24; i++) {
    options.push(i.toString().padStart(2, '0'))
  }
  return options
}

// 生成分钟选项
const generateMinuteOptions = () => {
  const options = []
  for (let i = 0; i < 60; i++) {
    options.push(i.toString().padStart(2, '0'))
  }
  return options
}

// 获取选项数量
const getMaxIndex = (type) => {
  if (type === 'date') return dateOptions.value.length - 1
  if (type === 'hour') return hourOptions.value.length - 1
  return minuteOptions.value.length - 1
}

// 根据偏移量计算选中索引
const getIndexFromOffset = (offset) => {
  return Math.round(-offset / itemHeight) + centerIndex
}

// 根据索引计算偏移量
const getOffsetFromIndex = (index) => {
  return -(index - centerIndex) * itemHeight
}

// 触摸开始
const handleTouchStart = (event, type) => {
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  touchStartY.value[type] = clientY
  touchCurrentOffset.value[type] = type === 'date' ? dateOffset.value : type === 'hour' ? hourOffset.value : minuteOffset.value
  isDragging.value[type] = true
}

// 触摸移动
const handleTouchMove = (event, type) => {
  if (!isDragging.value[type]) return
  event.preventDefault()

  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  const deltaY = clientY - touchStartY.value[type]
  let newOffset = touchCurrentOffset.value[type] + deltaY

  // 限制滚动范围
  const maxIndex = getMaxIndex(type)
  const minOffset = getOffsetFromIndex(maxIndex)
  const maxOffset = getOffsetFromIndex(0)
  newOffset = Math.max(minOffset, Math.min(maxOffset, newOffset))

  if (type === 'date') {
    dateOffset.value = newOffset
  } else if (type === 'hour') {
    hourOffset.value = newOffset
  } else {
    minuteOffset.value = newOffset
  }
}

// 触摸结束
const handleTouchEnd = (type) => {
  if (!isDragging.value[type]) return
  isDragging.value[type] = false

  // 获取当前偏移量
  const currentOffset = type === 'date' ? dateOffset.value : type === 'hour' ? hourOffset.value : minuteOffset.value

  // 计算当前选中的索引
  let index = getIndexFromOffset(currentOffset)

  // 限制索引范围
  const maxIndex = getMaxIndex(type)
  index = Math.max(0, Math.min(maxIndex, index))

  // 更新选中索引和偏移量
  const newOffset = getOffsetFromIndex(index)

  if (type === 'date') {
    selectedDateIndex.value = index
    dateOffset.value = newOffset
    // 更新日期值
    const selectedDate = dateOptions.value[index]
    selectedYear.value = selectedDate.year
    selectedMonth.value = selectedDate.month
    selectedDay.value = selectedDate.day
  } else if (type === 'hour') {
    selectedHourIndex.value = index
    hourOffset.value = newOffset
    selectedHour.value = parseInt(hourOptions.value[index])
  } else {
    selectedMinuteIndex.value = index
    minuteOffset.value = newOffset
    selectedMinute.value = parseInt(minuteOptions.value[index])
  }
}

// 鼠标事件处理
const handleMouseDown = (event, type) => {
  handleTouchStart(event, type)
}

const handleMouseMoveGlobal = (event) => {
  if (isDragging.value.date) {
    handleTouchMove(event, 'date')
  } else if (isDragging.value.hour) {
    handleTouchMove(event, 'hour')
  } else if (isDragging.value.minute) {
    handleTouchMove(event, 'minute')
  }
}

const handleMouseUpGlobal = () => {
  if (isDragging.value.date) {
    handleTouchEnd('date')
  } else if (isDragging.value.hour) {
    handleTouchEnd('hour')
  } else if (isDragging.value.minute) {
    handleTouchEnd('minute')
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
  emit('update:show', false)
}

// 弹窗完全关闭时的回调
const onPopupClosed = () => {
  // 可以在这里重置状态或清理数据
  visible.value = false
  emit('update:show', false)
  console.log('时间弹窗完全关闭')
}

// 确定
const handleConfirm = () => {
  const result = {
    year: selectedYear.value,
    month: selectedMonth.value,
    day: selectedDay.value,
    hour: selectedHour.value,
    minute: selectedMinute.value,
    date: new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value, selectedHour.value, selectedMinute.value)
  }
  visible.value = false
  emit('update:show', false)
  emit('confirm', result)
  showToast(`已选择 ${selectedMonth.value}月${selectedDay.value}日 ${selectedHour.value.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`)
}

// 初始化
onMounted(() => {


  dateOptions.value = generateDateOptions()
  hourOptions.value = generateHourOptions()
  minuteOptions.value = generateMinuteOptions()

  // 设置默认选中的日期索引（找到今天）
  const now = new Date()
  const todayStr = now.toDateString()
  let todayIndex = -1
  dateOptions.value.forEach((item, index) => {
    const itemDate = new Date(item.year, item.month - 1, item.day)
    if (itemDate.toDateString() === todayStr) {
      todayIndex = index
    }
  })

  // 如果今天不在可选范围内，选择第一个可选日期
  selectedDateIndex.value = todayIndex >= 0 ? todayIndex : 0
  selectedHourIndex.value = now.getHours()
  selectedMinuteIndex.value = now.getMinutes()

  // 设置日期值
  const selectedDate = dateOptions.value[selectedDateIndex.value]
  selectedYear.value = selectedDate.year
  selectedMonth.value = selectedDate.month
  selectedDay.value = selectedDate.day
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()

  // 设置初始偏移量，让选中项显示在中间的选中框位置
  dateOffset.value = getOffsetFromIndex(selectedDateIndex.value)
  hourOffset.value = getOffsetFromIndex(selectedHourIndex.value)
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
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #fff;

  .picker-cancel,
  .picker-confirm {
    font-size: 16px;
    width: 60px;
    text-align: center;
  }

  .picker-cancel {
    color: #999;
  }

  .picker-confirm {
    color: #3b82f6;
    font-weight: 500;
  }

  .picker-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}

.wheel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
  padding: 20px 0;
  background: #f8f8f8;
  position: relative;
}

.wheel-wrapper {
  width: 100px;
  height: 220px;
  overflow: hidden;
  position: relative;
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
  font-size: 14px;
  color: #999;
  transition: all 0.2s ease;
}

.wheel-item.active {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

/* 日期滚轮项 - 字体更小 */
.wheel-item.date-item {
  font-size: 14px;
}

.wheel-item.date-item.active {
  font-size: 16px;
}

.wheel-separator {
  font-size: 22px;
  font-weight: 500;
  color: #333;
  padding: 0 8px;
}

.picker-mask {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  height: calc(100% - 60px);
  background: linear-gradient(to bottom, rgba(248, 248, 248, 0.95), transparent 20%, transparent 80%, rgba(248, 248, 248, 0.95));
  pointer-events: none;
  z-index: 10;
}

.picker-highlight {
  position: absolute;
  top: calc(60px + 88px);
  left: 0;
  right: 0;
  height: 44px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  pointer-events: none;
  z-index: 10;
}
</style>
