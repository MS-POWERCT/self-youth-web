<template>
  <van-nav-bar
      title="测试"
      left-arrow
      @click-left="$router.go(-1)"
    />
  <div class="datetime-demo p-20">
    <h2 class="text-20 font-bold mb-20 text-gray700">滚轮日期时间选择器测试</h2>

    <!-- 日期时间选择器测试 -->
    <div class="demo-section bg-white radius-8 p-16 mb-16">
      <div class="demo-title text-16 text-gray500 mb-12">实际使用示例 - 习惯记录</div>
      <div class="demo-content flex items-center justify-between flex-wrap gap-12">
        <div class="date-display text-16 text-gray600">
          <span>选择的日期时间：</span>
          <span class="selected-value text-info-primary font-bold">{{ selectedDateTime }}</span>
        </div>
        <van-button type="primary" @click="showPicker = true">选择日期时间</van-button>
      </div>
    </div>

    <!-- 分钟时长选择器测试 - 内联形式 -->
    <div class="demo-section bg-white radius-8 p-16 mb-16">
      <div class="demo-title text-16 text-gray500 mb-12">分钟时长选择器 - 调研测试（内联形式）</div>
      <div class="time-picker-wrapper mb-16">
        <WheelTimePicker
          v-model="selectedDuration"
          @change="handleTimeChange"
        />
      </div>
      <div class="result-display text-16 text-gray600 text-center">
        <span>当前选择：</span>
        <span class="selected-value text-info-primary font-bold">{{ selectedDuration }} 分钟</span>
      </div>
    </div>

    <!-- 使用封装的滚轮日期选择器 -->
    <WheelDateTimePicker
      v-model:show="showPicker"
      :default-date="new Date()"
      @confirm="handlePickerConfirm"
    />

    <!-- 进度条组件测试 -->
    <div class="demo-section bg-white radius-8 p-16">
      <div class="demo-title text-16 text-gray500 mb-12">进度条组件测试</div>
      <ProgressBar
        :current="18"
        :total="50"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button as VanButton } from 'vant'
import WheelDateTimePicker from '../components/tools/WheelDateTimePicker.vue'
import WheelTimePicker from '../components/tools/WheelValuePicker.vue'
import ProgressBar from '../components/tools/ProgressBar.vue'

const showPicker = ref(false)
const selectedDateTime = ref('未选择')
const selectedDuration = ref(30)

const handlePickerConfirm = (result) => {
  const { year, month, day, hour, minute } = result
  selectedDateTime.value = `${year}年${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

const handleTimeChange = (value) => {
  console.log('时长变化:', value)
}
</script>

<style lang="scss" scoped>
.demo-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
