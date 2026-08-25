<template>
  <div class="weight-page">
    <header class="weight-header">
      <h1 class="page-title">体重记录</h1>
      <button class="stats-btn" type="button" aria-label="统计数据" @click="showStatsTip">
        <IconifyIcon icon="fluent-emoji-flat:bar-chart" width="20" />
      </button>
    </header>

    <div class="summary-card">
      <div class="summary-top">
        <div>
          <div class="summary-label">当前体重</div>
          <div class="summary-value">{{ summary.current }}<span class="unit">kg</span></div>
        </div>
        <div class="summary-badge" :class="{ up: summary.totalChange > 0 }">
          {{ summary.totalChange > 0 ? '↑' : '↓' }} 累计 {{ Math.abs(summary.totalChange) }} kg
        </div>
      </div>
      <div class="summary-stats">
        <div class="summary-stat">
          <div class="stat-label">起始</div>
          <div class="stat-num">{{ summary.start }} kg</div>
        </div>
        <div class="summary-stat">
          <div class="stat-label">最低</div>
          <div class="stat-num">{{ summary.lowest }} kg</div>
        </div>
        <div class="summary-stat">
          <div class="stat-label">平均</div>
          <div class="stat-num">{{ summary.average }} kg</div>
        </div>
      </div>
    </div>

    <div class="trend-card">
      <div class="trend-header">
        <span class="trend-title">体重趋势</span>
        <span class="trend-badge">{{ trendDirection.label }}</span>
      </div>
      <WeightTrendChart :data="trendData" />
    </div>

    <div class="history-section">
      <div class="history-title">记录历史</div>
      <div class="history-list">
        <div v-for="record in records" :key="record.id" class="history-item">
          <div class="history-dot" :class="record.change <= 0 ? 'down' : 'up'" />
          <div class="history-info">
            <div class="history-weight">{{ record.weight }} kg</div>
            <div class="history-meta">
              {{ record.date }} {{ record.time }}
              <template v-if="record.note"> · {{ record.note }}</template>
            </div>
          </div>
          <div class="history-change-wrap">
            <div class="history-change" :class="record.change <= 0 ? 'down' : 'up'">
              {{ record.change <= 0 ? '↓' : '↑' }} {{ Math.abs(record.change) }} kg
            </div>
            <div v-if="record.relativeTime" class="history-relative">{{ record.relativeTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <br/>
    <br/>
    <br/>
    <button class="fab-btn" type="button" aria-label="添加记录" @click="showAddPopup = true">
      <van-icon name="plus" color="#fff" size="22" />
    </button>

    <van-popup v-model:show="showAddPopup" position="bottom" round :style="{ height: '55%' }">
      <div class="add-popup">
        <div class="popup-title">添加体重记录</div>
        <van-field v-model="addForm.weight" type="number" label="体重(kg)" placeholder="请输入体重" />
        <van-field
          v-model="addForm.recordTime"
          label="记录时间"
          placeholder="请选择时间"
          readonly
          @click="showToast('时间选择器待接入')"
        />
        <van-field v-model="addForm.note" label="备注" placeholder="如：晨起空腹" maxlength="50" />
        <van-button type="primary" block round class="submit-btn" @click="handleAddRecord">
          保存
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import WeightTrendChart from '../components/weight/WeightTrendChart.vue'

// TODO: 接口接入后改为 store / api 获取
const summary = ref({
  current: 72.5,
  totalChange: -2.5,
  start: 75.0,
  lowest: 72.1,
  average: 73.5,
})

const trendData = ref([
  { date: '7/12', value: 75.2 },
  { date: '7/20', value: 74.8 },
  { date: '7/28', value: 74.1 },
  { date: '8/5', value: 73.6 },
  { date: '8/13', value: 73.2 },
  { date: '8/21', value: 72.5 },
])

const records = ref([
  {
    id: 1,
    weight: 72.5,
    date: '8月25日',
    time: '08:00',
    note: '晨起空腹',
    change: -0.6,
    relativeTime: '3天前',
  },
  {
    id: 2,
    weight: 73.1,
    date: '8月22日',
    time: '08:00',
    note: '',
    change: 0.3,
    relativeTime: '',
  },
  {
    id: 3,
    weight: 72.8,
    date: '8月18日',
    time: '08:00',
    note: '',
    change: -0.5,
    relativeTime: '4天前',
  },
])

const showAddPopup = ref(false)
const addForm = ref({
  weight: '',
  recordTime: '',
  note: '',
})

const trendDirection = computed(() => {
  if (trendData.value.length < 2) {
    return { label: '— 暂无趋势' }
  }
  const first = trendData.value[0].value
  const last = trendData.value[trendData.value.length - 1].value
  if (last < first) return { label: '↓ 下降趋势' }
  if (last > first) return { label: '↑ 上升趋势' }
  return { label: '— 持平' }
})

const showStatsTip = () => {
  showToast('统计页待开发')
}

const handleAddRecord = () => {
  if (!addForm.value.weight) {
    showToast('请输入体重')
    return
  }
  showToast('接口开发中，暂无法保存')
}
</script>

<style scoped>
.weight-page {
  min-height: 100vh;
  background-color: #f4f5f7;
  padding: var(--px-16) var(--px-16) 100px;
}

.weight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--px-16);
}

.page-title {
  font-size: var(--rem-18);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.2;
}

.stats-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-12);
  background-color: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.summary-card {
  padding: var(--px-20) var(--px-16);
  margin-bottom: var(--px-12);
  border-radius: var(--radius-20);
  background: linear-gradient(145deg, #3d8f82 0%, #2f7a6e 100%);
  color: var(--white);
  box-shadow: 0 8px 24px rgba(61, 143, 130, 0.28);
}

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--px-20);
}

.summary-label {
  font-size: var(--rem-9);
  opacity: 0.85;
  margin-bottom: var(--px-6);
}

.summary-value {
  font-size: var(--rem-24);
  font-weight: var(--number-700);
  line-height: 1.1;
}

.unit {
  font-size: var(--rem-12);
  font-weight: var(--number-500);
  margin-left: 4px;
}

.summary-badge {
  padding: 6px var(--px-12);
  border-radius: var(--radius-9999);
  background-color: rgba(255, 255, 255, 0.18);
  font-size: var(--rem-8);
  font-weight: var(--number-500);
  white-space: nowrap;
}

.summary-badge.up {
  background-color: rgba(255, 200, 200, 0.25);
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  padding-top: var(--px-16);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-stat {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: var(--rem-8);
  opacity: 0.8;
  margin-bottom: var(--px-4);
}

.stat-num {
  font-size: var(--rem-10);
  font-weight: var(--number-700);
}

.trend-card {
  padding: var(--px-16);
  margin-bottom: var(--px-16);
  border-radius: var(--radius-16);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--px-12);
}

.trend-title {
  font-size: var(--rem-10);
  font-weight: var(--number-700);
  color: var(--black300);
}

.trend-badge {
  padding: 4px var(--px-10);
  border-radius: var(--radius-9999);
  background-color: #e8f4f2;
  color: #3d8f82;
  font-size: var(--rem-8);
  font-weight: var(--number-500);
}

.history-section {
  margin-bottom: var(--px-16);
}

.history-title {
  font-size: var(--rem-9);
  color: var(--gray500);
  margin-bottom: var(--px-10);
  padding-left: var(--px-4);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--px-10);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--px-12);
  padding: var(--px-14) var(--px-16);
  border-radius: var(--radius-16);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.history-dot.down {
  background-color: #3d8f82;
}

.history-dot.up {
  background-color: #ee0a24;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-weight {
  font-size: var(--rem-12);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.3;
}

.history-meta {
  margin-top: var(--px-4);
  font-size: var(--rem-8);
  color: var(--gray500);
  line-height: 1.4;
}

.history-change-wrap {
  text-align: right;
  flex-shrink: 0;
}

.history-change {
  font-size: var(--rem-9);
  font-weight: var(--number-700);
  line-height: 1.3;
}

.history-change.down {
  color: #3d8f82;
}

.history-change.up {
  color: #ee0a24;
}

.history-relative {
  margin-top: var(--px-2);
  font-size: var(--rem-7);
  color: var(--gray500);
}

.fab-btn {
  position: fixed;
  right: var(--px-20);
  bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #3d8f82 0%, #2f7a6e 100%);
  box-shadow: 0 6px 20px rgba(61, 143, 130, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
}

.add-popup {
  padding: var(--px-20) var(--px-16);
}

.popup-title {
  font-size: var(--rem-12);
  font-weight: var(--number-700);
  color: var(--black300);
  text-align: center;
  margin-bottom: var(--px-16);
}

.submit-btn {
  margin-top: var(--px-20);
  background: #3d8f82;
  border-color: #3d8f82;
}
</style>
