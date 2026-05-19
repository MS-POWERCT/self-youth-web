<template>
  <van-nav-bar
      title="测试"
      left-arrow
      @click-left="$router.go(-1)"
    />
  <div class="datetime-demo">
    <h2>滚轮日期时间选择器测试</h2>

    <!-- 日期时间选择器测试 -->
    <div class="demo-section">
      <div class="demo-title">实际使用示例 - 习惯记录</div>
      <div class="demo-content">
        <div class="date-display">
          <span>选择的日期时间：</span>
          <span class="selected-value">{{ selectedDateTime }}</span>
        </div>
        <van-button type="primary" @click="showPicker = true">选择日期时间</van-button>
      </div>
    </div>

    <!-- 分钟时长选择器测试 - 内联形式 -->
    <div class="demo-section">
      <div class="demo-title">分钟时长选择器 - 调研测试（内联形式）</div>
      <div class="time-picker-wrapper">
        <WheelTimePicker
          v-model="selectedDuration"
          @change="handleTimeChange"
        />
      </div>
      <div class="result-display">
        <span>当前选择：</span>
        <span class="selected-value">{{ selectedDuration }} 分钟</span>
      </div>
    </div>

    <!-- 使用封装的滚轮日期选择器 -->
    <WheelDateTimePicker
      v-model:show="showPicker"
      :default-date="new Date()"
      @confirm="handlePickerConfirm"
    />

    <!-- 进度条组件测试 -->
    <div class="demo-section">
      <div class="demo-title">进度条组件测试</div>
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
import WheelTimePicker from '../components/tools/WheelTimePicker.vue'
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
.datetime-demo {
  padding: 20px;

  h2 {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #333;
  }

  .demo-section {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .demo-title {
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
  }

  .demo-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .time-picker-wrapper {
    margin-bottom: 16px;
  }

  .date-display,
  .result-display {
    font-size: 14px;
    color: #666;

    .selected-value {
      color: #3b82f6;
      font-weight: 500;
    }
  }

  .result-display {
    text-align: center;
  }
}
</style>
