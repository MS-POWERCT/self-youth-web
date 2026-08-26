<template>
  <div class="primary-tab-page weight-page">
    <PrimaryPageHeader :title="TAB_PAGE_LABELS.weight" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="summary-card">
        <div class="summary-main">
          <div class="summary-weight-block">
            <div class="summary-value">
              <span class="weight-num weight-num--lg">{{ summary.current }}</span>
              <span class="unit-inline">{{ unitLabel }}</span>
              <button
                type="button"
                class="unit-toggle"
                aria-label="切换斤/kg"
                @click="toggleDisplayUnit"
              >
                <van-icon name="exchange" size="12" color="rgba(255,255,255,0.92)" />
              </button>
            </div>
          </div>
          <div class="change-delta">
            <div class="change-delta__pill mt-12" :class="`change-delta__pill--${changeTone}`">
              <span
                v-if="changeTone === 'up' || changeTone === 'down'"
                class="change-delta__badge"
                aria-hidden="true"
              >
                <svg v-if="changeTone === 'up'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2L7.5 6.5H2.5L5 2Z" fill="currentColor" />
                </svg>
                <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 8L2.5 3.5H7.5L5 8Z" fill="currentColor" />
                </svg>
              </span>
              <span class="change-delta__value">
                <template v-if="hasStats">
                  <span class="weight-num">{{ summary.totalChangeAbs }}</span>
                  <span class="change-delta__unit">{{ unitLabel }}</span>
                </template>
                <template v-else>--</template>
              </span>
            </div>
          </div>
        </div>
        <div class="summary-stats">
          <div class="summary-stat clickable" @click="goBodyProfile('bmi')">
            <div class="stat-label flex items-center gap-2 justify-center">
              <span>BMI</span>
              <IconifyIcon icon="openmoji:bar-chart" width="16" />
            </div>
            <div class="stat-num">{{ bmiDisplay }}</div>
            <div v-if="!hasBodyProfile" class="stat-hint">点击填写</div>
          </div>
          <div class="summary-stat clickable" @click="goBodyProfile('bodyFat')">
            <div class="stat-label">体脂率</div>
            <div class="stat-num">{{ bodyFatDisplay }}<span v-if="bodyFatDisplay !== '--'" class="stat-unit">%</span></div>
            <div v-if="!hasBodyProfile" class="stat-hint">点击填写</div>
          </div>
          <div class="summary-stat">
            <div class="stat-label">记录数</div>
            <div class="stat-num">{{ weightStore.stats?.record_count ?? 0 }}</div>
          </div>
        </div>
      </div>

      <div class="trend-card">
        <div class="trend-header">
          <span class="trend-title">体重趋势</span>
          <span class="trend-badge">{{ trendDirection.label }}</span>
        </div>
        <WeightTrendChart compact :series="trendData" />
      </div>

      <div class="history-section">
        <div class="history-title">记录历史</div>
        <div v-if="!loading && records.length === 0" class="empty-state">暂无记录</div>
        <div v-else class="history-list">
          <div
            v-for="record in records"
            :key="record.id"
            class="history-item"
            @click="openEditPopup(record.id)"
          >
            <div class="history-dot" :class="record.change <= 0 ? 'down' : 'up'" />
            <div class="history-info">
              <div class="history-weight">
                <span class="weight-num">{{ record.weight }}</span> {{ unitLabel }}
              </div>
              <div class="history-meta">
                {{ record.date }} {{ record.time }}
                <template v-if="record.note"> · {{ record.note }}</template>
              </div>
            </div>
            <div v-if="record.change !== null" class="history-change-wrap">
              <div
                class="history-change-pill"
                :class="record.change > 0 ? 'history-change-pill--up' : 'history-change-pill--down'"
              >
                <span class="history-change-pill__badge" aria-hidden="true">
                  <svg v-if="record.change > 0" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 2L7.5 6.5H2.5L5 2Z" fill="currentColor" />
                  </svg>
                  <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 8L2.5 3.5H7.5L5 8Z" fill="currentColor" />
                  </svg>
                </span>
                <span class="history-change-pill__value">
                  <span class="weight-num">{{ record.changeAbs }}</span>
                  <span class="history-change-pill__unit">{{ unitLabel }}</span>
                </span>
              </div>
              <div v-if="record.relativeTime" class="history-relative">{{ record.relativeTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <button class="fab-btn" type="button" aria-label="添加记录" @click="openAddPopup">
      <van-icon name="plus" color="#fff" size="22" />
    </button>

    <van-popup
      v-model:show="showFormPopup"
      position="bottom"
      round
      :style="{ maxHeight: '88vh' }"
      @closed="showWeightKeyboard = false"
    >
      <div class="weight-form">
        <div class="weight-form-hero">
          <div class="weight-form-hero__head">
            <span class="weight-form-hero__title">
              {{ formMode === 'add' ? '添加体重' : '编辑体重' }}
            </span>
            <span class="weight-form-hero__unit">{{ unitLabel }}</span>
            <van-icon
              v-if="formMode === 'edit'"
              name="delete-o"
              size="18"
              class="weight-form-hero__delete"
              @click="handleDelete"
            />
          </div>

          <div v-if="isFirstWeightEntry" class="weight-form-hero__tip">
            首次记录，已预设 {{ defaultWeight }} {{ unitLabel }}，可直接调整
          </div>

          <div class="weight-form-stepper">
            <button
              type="button"
              class="weight-form-stepper__btn"
              aria-label="减少体重"
              @click="adjustWeight(-0.1)"
            >
              −
            </button>
            <button
              type="button"
              class="weight-form-stepper__value"
              @click="openWeightKeyboard"
            >
              <span class="weight-form-stepper__num">{{ weightDisplay }}</span>
            </button>
            <button
              type="button"
              class="weight-form-stepper__btn"
              aria-label="增加体重"
              @click="adjustWeight(0.1)"
            >
              +
            </button>
          </div>

          <div class="weight-form-steps">
            <button
              v-for="step in weightSteps"
              :key="step.label"
              type="button"
              class="weight-form-steps__chip"
              @click="adjustWeight(step.delta)"
            >
              {{ step.label }}
            </button>
          </div>
        </div>

        <div class="weight-form-body">
          <div v-if="showWeightKeyboard" class="weight-form-direct">
            <van-field
              v-model="form.weight"
              type="number"
              :placeholder="`请输入体重(${unitLabel})`"
              input-align="center"
              class="weight-form-direct__field"
            />
          </div>

          <div class="weight-form-section">
            <div class="weight-form-section__label">记录时间</div>
            <div class="weight-form-time-row" @click="showTimePicker = true">
              {{ form.recordTime || '请选择时间' }}
              <van-icon name="arrow" />
            </div>
          </div>

          <div class="weight-form-section">
            <div class="weight-form-section__label">场景</div>
            <div class="weight-form-tags">
              <button
                v-for="tag in sceneTags"
                :key="tag"
                type="button"
                class="weight-form-tag"
                :class="{ active: selectedScene === tag }"
                @click="selectScene(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <van-button
            type="primary"
            block
            round
            class="weight-form-submit"
            :loading="saving"
            @click="handleSave"
          >
            保存{{ weightDisplay !== '--' ? ` ${weightDisplay} ${unitLabel}` : '' }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <van-number-keyboard
      v-model="form.weight"
      :show="showWeightKeyboard"
      extra-key="."
      close-button-text="完成"
      @blur="showWeightKeyboard = false"
    />

    <WheelDateTimePicker
      v-model:show="showTimePicker"
      :default-date="form.recordTime"
      @confirm="handlePickerConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import WeightTrendChart from '../components/weight/WeightTrendChart.vue'
import WheelDateTimePicker from '../components/tools/WheelDateTimePicker.vue'
import { useWeightStore } from '../stores/weight'
import { useUserStore } from '../stores/user'
import { getCurrentTime, formatDate, formatTime, getRelativeTime } from '@/utils/common'
import { calcBmi, calcBodyFatPercent, toWeightKg, hasCompleteBodyProfile } from '@/utils/weight'
import { TAB_PAGE_LABELS } from '@/constants/tabPages'
import PrimaryPageHeader from '@/components/layout/PrimaryPageHeader.vue'

defineOptions({ name: 'WeightView' })

const router = useRouter()
const weightStore = useWeightStore()
const userStore = useUserStore()
const { displayUnit } = storeToRefs(weightStore)
const loading = computed(() => weightStore.loading)
const saving = computed(() => weightStore.saving)
const refreshing = ref(false)
const showFormPopup = ref(false)
const formMode = ref('add')
const showTimePicker = ref(false)
const showWeightKeyboard = ref(false)
const isFirstWeightEntry = ref(false)
const selectedScene = ref('晨起空腹')

const sceneTags = ['晨起空腹', '餐后', '运动前', '睡前']

const weightSteps = [
  { label: '-1', delta: -1 },
  { label: '-0.5', delta: -0.5 },
  { label: '+0.5', delta: 0.5 },
  { label: '+1', delta: 1 },
]

const form = ref({
  id: null,
  weight: '',
  recordTime: '',
  note: '',
})

const hasStats = computed(() => (weightStore.stats?.record_count ?? 0) > 0)

const hasBodyProfile = computed(() => hasCompleteBodyProfile(weightStore.bodyProfile))

const currentWeightKg = computed(() => {
  const stats = weightStore.stats
  if (!stats?.current_weight) {
    return null
  }
  return toWeightKg(stats.current_weight, stats.unit)
})

const bmiValue = computed(() =>
  calcBmi(currentWeightKg.value, Number(weightStore.bodyProfile.height)),
)

const bmiDisplay = computed(() =>
  bmiValue.value != null ? bmiValue.value.toFixed(1) : '--',
)

const bodyFatDisplay = computed(() => {
  const profile = weightStore.bodyProfile
  const bodyFat = calcBodyFatPercent(bmiValue.value, profile.age, profile.gender)
  return bodyFat != null ? bodyFat.toFixed(1) : '--'
})

const unitLabel = computed(() => (displayUnit.value === 'jin' ? '斤' : 'kg'))

const weightDisplay = computed(() => {
  const weight = Number(form.value.weight)
  if (!form.value.weight || Number.isNaN(weight)) {
    return '--'
  }
  return weight.toFixed(1)
})

const defaultWeight = computed(() => (displayUnit.value === 'jin' ? 120 : 60))

const getPriorWeight = () => {
  const stats = weightStore.stats
  if (stats?.current_weight != null && stats.record_count > 0) {
    const weight = convertWeight(stats.current_weight, stats.unit || 'kg')
    if (weight !== '--') {
      return Number(weight)
    }
  }

  const latest = weightStore.records?.[0]
  if (latest?.weight != null) {
    const weight = convertWeight(latest.weight, latest.unit || 'kg')
    if (weight !== '--') {
      return Number(weight)
    }
  }

  return null
}

const getBaselineWeight = () => {
  return getPriorWeight() ?? defaultWeight.value
}

const normalizeWeightInput = (value) => {
  const weight = Number(value)
  if (Number.isNaN(weight) || weight <= 0) {
    return ''
  }
  return weight.toFixed(1)
}

const adjustWeight = (delta) => {
  let current = Number(form.value.weight)
  if (!form.value.weight || Number.isNaN(current)) {
    current = getBaselineWeight()
  }

  current = Math.max(0.1, current + delta)
  form.value.weight = current.toFixed(1)
}

const openWeightKeyboard = () => {
  form.value.weight = getBaselineWeight().toFixed(1)
  showWeightKeyboard.value = true
}

const selectScene = (tag) => {
  selectedScene.value = tag
  form.value.note = tag
}

const toFormWeight = (item) => {
  const weight = convertWeight(item.weight, item.unit || 'kg', displayUnit.value)
  return weight === '--' ? '' : weight
}

const initFormForAdd = () => {
  const priorWeight = getPriorWeight()
  isFirstWeightEntry.value = priorWeight == null
  selectedScene.value = '晨起空腹'
  const baseline = getBaselineWeight()

  form.value = {
    id: null,
    weight: baseline.toFixed(1),
    recordTime: getCurrentTime('datetime_cn'),
    note: '晨起空腹',
  }

  showWeightKeyboard.value = false
}

const initFormForEdit = (item) => {
  isFirstWeightEntry.value = false
  const note = item.note || ''
  const matchedScene = sceneTags.find((tag) => tag === note)
  selectedScene.value = matchedScene || '晨起空腹'

  form.value = {
    id: item.id,
    weight: toFormWeight(item),
    recordTime: getCurrentTime('datetime_cn', new Date(item.recorded_at)),
    note: note,
  }

  showWeightKeyboard.value = false
}

const convertWeight = (weight, sourceUnit = 'kg', targetUnit = displayUnit.value) => {
  if (weight == null || weight === '--') {
    return '--'
  }

  const numericWeight = Number(weight)
  if (Number.isNaN(numericWeight)) {
    return '--'
  }

  const weightKg = sourceUnit === 'jin' ? numericWeight / 2 : numericWeight
  const converted = targetUnit === 'jin' ? weightKg * 2 : weightKg
  return converted.toFixed(1)
}

const toggleDisplayUnit = () => {
  weightStore.toggleDisplayUnit()
}

const summary = computed(() => {
  const stats = weightStore.stats
  const sourceUnit = stats?.unit || 'kg'
  const totalChange =
    stats?.total_change != null ? convertWeight(stats.total_change, sourceUnit) : '0.0'

  return {
    current: convertWeight(stats?.current_weight, sourceUnit),
    totalChange: Number(totalChange),
    totalChangeAbs: totalChange === '--' ? '--' : Math.abs(Number(totalChange)).toFixed(1),
  }
})

const changeTone = computed(() => {
  if (!hasStats.value) {
    return 'empty'
  }
  if (summary.value.totalChange > 0) {
    return 'up'
  }
  if (summary.value.totalChange < 0) {
    return 'down'
  }
  return 'flat'
})

const formatChartDate = (dateInput) => {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) {
    return dateInput
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const trendData = computed(() =>
  (weightStore.chart?.points || []).map((item) => ({
    date: formatChartDate(item.date || item.recorded_at),
    value: Number(convertWeight(item.weight, item.unit || 'kg')),
  })),
)

const trendDirection = computed(() => {
  const trend = weightStore.chart?.trend
  const label = weightStore.chart?.trend_label

  if (!label || trendData.value.length < 2) {
    return { label: '— 暂无趋势' }
  }
  if (trend === 'down') return { label: `↓ ${label}` }
  if (trend === 'up') return { label: `↑ ${label}` }
  return { label: `— ${label}` }
})

const records = computed(() =>
  (weightStore.records || []).map((item, index) => {
    const change = item.change != null ? convertWeight(item.change, 'kg') : null

    return {
      id: item.id,
      weight: convertWeight(item.weight, item.unit || 'kg'),
      date: formatDate(item.recorded_at),
      time: formatTime(item.recorded_at),
      note: item.note || '',
      change: change != null ? Number(change) : null,
      changeAbs: change != null ? Math.abs(Number(change)).toFixed(1) : null,
      relativeTime: index === 0 ? getRelativeTime(item.recorded_at) : '',
    }
  }),
)

const loadUserBodyProfile = async () => {
  try {
    if (!userStore.user?.height && !userStore.user?.age) {
      await userStore.getUserInfo()
    }
    weightStore.syncBodyProfileFromUser(userStore.user)
  } catch (error) {
    console.error('加载用户身体参数失败', error)
  }
}

const loadData = async () => {
  await weightStore.fetchAll()
}

const onRefresh = async () => {
  try {
    refreshing.value = true
    await loadUserBodyProfile()
    await loadData()
  } catch (error) {
    console.error('刷新体重数据失败', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

const openAddPopup = () => {
  formMode.value = 'add'
  initFormForAdd()
  showFormPopup.value = true
}

const openEditPopup = (recordId) => {
  const item = weightStore.records.find((record) => record.id === recordId)
  if (!item) {
    return
  }

  formMode.value = 'edit'
  initFormForEdit(item)
  showFormPopup.value = true
}

const handlePickerConfirm = ({ date }) => {
  form.value.recordTime = getCurrentTime('datetime_cn', date)
}

const normalizeRecordTime = (recordTime) => {
  if (!recordTime) {
    return getCurrentTime()
  }

  return recordTime.replace('年', '-').replace('月', '-').replace('日', '').trim()
}

const showStatsTip = () => {
  const count = weightStore.stats?.record_count ?? 0
  showToast(count > 0 ? `共 ${count} 条记录` : '暂无统计数据')
}

const goBodyProfile = (focus) => {
  router.push({
    path: '/weight/body-profile',
    query: { focus },
  })
}

const handleSave = async () => {
  const weight = normalizeWeightInput(form.value.weight)
  if (!weight) {
    showToast('请输入体重')
    openWeightKeyboard()
    return
  }

  form.value.weight = weight
  if (!form.value.note && selectedScene.value) {
    form.value.note = selectedScene.value
  }

  const payload = {
    weight: Number(form.value.weight),
    recordedAt: normalizeRecordTime(form.value.recordTime),
    note: form.value.note,
    unit: displayUnit.value,
  }

  try {
    if (formMode.value === 'add') {
      await weightStore.createRecord(
        payload.weight,
        payload.recordedAt,
        payload.note,
        payload.unit,
      )
    } else {
      await weightStore.editRecord(
        form.value.id,
        payload.weight,
        payload.recordedAt,
        payload.note,
        payload.unit,
      )
    }
    showToast('保存成功')
    showFormPopup.value = false
  } catch (error) {
    console.error('保存体重记录失败', error)
  }
}

const handleDelete = async () => {
  if (!form.value.id) {
    return
  }

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定删除这条体重记录吗？',
    })
    await weightStore.deleteRecord(form.value.id)
    showToast('删除成功')
    showFormPopup.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除体重记录失败', error)
    }
  }
}

onMounted(async () => {
  weightStore.loadDisplayUnit()
  await loadUserBodyProfile()
  await loadData()
})

onActivated(async () => {
  await loadUserBodyProfile()
})
</script>

<style scoped>
.stats-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-10);
  background-color: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.summary-card {
  padding: var(--px-12) var(--px-14);
  margin-bottom: var(--px-6);
  border-radius: var(--radius-20);
  background: linear-gradient(145deg, #3d8f82 0%, #2f7a6e 100%);
  color: var(--white);
  box-shadow: 0 6px 18px rgba(61, 143, 130, 0.22);
  overflow: hidden;
}

.summary-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--px-10);
  margin-bottom: var(--px-10);
}

.summary-weight-block {
  min-width: 0;
  flex: 1;
}

.change-delta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.change-delta__label {
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.72);
}

.change-delta__pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px 5px 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfb 100%);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95) inset,
    0 4px 14px rgba(0, 0, 0, 0.1);
}

.change-delta__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
}

.change-delta__value {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding-right: 2px;
  font-size: var(--rem-11);
  font-weight: var(--number-700);
  line-height: 1;
  letter-spacing: -0.02em;
}

.change-delta__value .weight-num {
  min-width: 2.8ch;
}

.change-delta__unit {
  font-size: 10px;
  font-weight: var(--number-500);
  opacity: 0.65;
}

.change-delta__pill--up {
  background: linear-gradient(180deg, #ffffff 0%, #fff6f6 100%);
  border-color: rgba(224, 86, 86, 0.14);
  color: #d94848;
}

.change-delta__pill--up .change-delta__badge {
  background: linear-gradient(145deg, #ffe8e8 0%, #ffd4d4 100%);
  color: #d94848;
  box-shadow: 0 1px 4px rgba(217, 72, 72, 0.18);
}

.change-delta__pill--down {
  background: linear-gradient(180deg, #ffffff 0%, #f2fbf9 100%);
  border-color: rgba(42, 143, 127, 0.14);
  color: #26806f;
}

.change-delta__pill--down .change-delta__badge {
  background: linear-gradient(145deg, #dff5f0 0%, #c5ebe3 100%);
  color: #26806f;
  box-shadow: 0 1px 4px rgba(38, 128, 111, 0.16);
}

.change-delta__pill--flat,
.change-delta__pill--empty {
  padding-left: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f6f8f8 100%);
  border-color: rgba(107, 124, 121, 0.12);
  color: #6b7c79;
}

.summary-label {
  font-size: var(--rem-8);
  opacity: 0.85;
  margin-bottom: var(--px-4);
}

.summary-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--rem-20);
  font-weight: var(--number-700);
  line-height: 1.1;
  min-height: 28px;
}

.weight-num {
  font-variant-numeric: tabular-nums;
  display: inline-block;
  min-width: 5ch;
  text-align: right;
}

.weight-num--lg {
  min-width: 6ch;
}

.unit-inline {
  display: inline-block;
  min-width: 1.6em;
  font-size: var(--rem-10);
  font-weight: var(--number-500);
}

.unit-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  cursor: pointer;
  flex-shrink: 0;
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  padding-top: var(--px-6);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.summary-stat {
  flex: 1;
  text-align: center;
}

.summary-stat.clickable {
  cursor: pointer;
}

.stat-hint {
  margin-top: 1px;
  font-size: var(--rem-7);
  opacity: 0.72;
}

.stat-unit {
  font-size: var(--rem-7);
  margin-left: 1px;
}

.stat-num.up {
  color: #ffd4d4;
}

.stat-num.down {
  color: #d7f3ee;
}

.stat-label {
  font-size: var(--rem-8);
  opacity: 0.8;
  font-weight: var(--number-700);
  margin-bottom: 1px;
}

.stat-num {
  font-size: var(--rem-9);
  font-weight: var(--number-700);
  min-height: 14px;
}

.stat-num .weight-num {
  min-width: 4ch;
}

.trend-card {
  padding: var(--px-8) var(--px-10) var(--px-10);
  margin-bottom: var(--px-6);
  border-radius: var(--radius-12);
  background-color: var(--white);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--px-2);
}

.trend-title {
  font-size: var(--rem-8);
  font-weight: var(--number-700);
  color: var(--black300);
}

.trend-badge {
  padding: 1px var(--px-6);
  border-radius: var(--radius-9999);
  background-color: #e8f4f2;
  color: #3d8f82;
  font-size: var(--rem-7);
  font-weight: var(--number-500);
  white-space: nowrap;
}

.history-section {
  margin-bottom: var(--px-8);
}

.history-title {
  font-size: var(--rem-8);
  color: var(--gray500);
  margin-bottom: var(--px-6);
  padding-left: var(--px-2);
}

.empty-state {
  text-align: center;
  padding: 24px 16px;
  color: var(--gray500);
  font-size: var(--rem-9);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--px-6);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--px-10);
  padding: var(--px-10) var(--px-12);
  border-radius: var(--radius-12);
  background-color: var(--white);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.history-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(61, 143, 130, 0.12);
}

.history-dot.down {
  background-color: #26806f;
  box-shadow: 0 0 0 3px rgba(38, 128, 111, 0.14);
}

.history-dot.up {
  background-color: #d94848;
  box-shadow: 0 0 0 3px rgba(217, 72, 72, 0.14);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-weight {
  font-size: var(--rem-11);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.25;
  min-height: 16px;
}

.history-weight .weight-num {
  min-width: 4ch;
}

.history-meta {
  margin-top: 2px;
  font-size: var(--rem-7);
  color: var(--gray500);
  line-height: 1.35;
}

.history-change-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.history-change-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  border: 1px solid transparent;
}

.history-change-pill__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.history-change-pill__value {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-size: var(--rem-9);
  font-weight: var(--number-700);
  line-height: 1;
  letter-spacing: -0.02em;
}

.history-change-pill__value .weight-num {
  min-width: 2.6ch;
}

.history-change-pill__unit {
  font-size: 10px;
  font-weight: var(--number-500);
  opacity: 0.72;
}

.history-change-pill--up {
  background: linear-gradient(180deg, #fff5f5 0%, #ffecec 100%);
  border-color: rgba(217, 72, 72, 0.16);
  color: #d94848;
}

.history-change-pill--up .history-change-pill__badge {
  background: linear-gradient(145deg, #ffe8e8 0%, #ffd4d4 100%);
  color: #d94848;
  box-shadow: 0 1px 3px rgba(217, 72, 72, 0.2);
}

.history-change-pill--down {
  background: linear-gradient(180deg, #f2fbf9 0%, #e4f5f1 100%);
  border-color: rgba(38, 128, 111, 0.16);
  color: #26806f;
}

.history-change-pill--down .history-change-pill__badge {
  background: linear-gradient(145deg, #dff5f0 0%, #c5ebe3 100%);
  color: #26806f;
  box-shadow: 0 1px 3px rgba(38, 128, 111, 0.18);
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

.weight-form {
  overflow: hidden;
}

.weight-form-hero {
  padding: var(--px-14) var(--px-16) var(--px-16);
  background: linear-gradient(145deg, #3d8f82 0%, #2f7a6e 100%);
  color: var(--white);
}

.weight-form-hero__head {
  display: flex;
  align-items: center;
  gap: var(--px-8);
  margin-bottom: var(--px-10);
}

.weight-form-hero__title {
  flex: 1;
  font-size: var(--rem-11);
  font-weight: var(--number-700);
}

.weight-form-hero__unit {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: var(--white);
  font-size: var(--rem-9);
  font-weight: var(--number-600);
  line-height: 1.4;
}

.weight-form-hero__delete {
  color: #ffd4d4;
  cursor: pointer;
}

.weight-form-hero__tip {
  margin-bottom: var(--px-10);
  padding: var(--px-8) var(--px-10);
  border-radius: var(--radius-10);
  background: rgba(255, 255, 255, 0.12);
  font-size: var(--rem-8);
  line-height: 1.45;
  opacity: 0.95;
}

.weight-form-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--px-14);
}

.weight-form-stepper__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: var(--white);
  font-size: 22px;
  font-weight: var(--number-700);
  line-height: 1;
  cursor: pointer;
}

.weight-form-stepper__value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 120px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--white);
  cursor: pointer;
}

.weight-form-stepper__num {
  font-size: var(--rem-24);
  font-weight: var(--number-700);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.weight-form-steps {
  display: flex;
  gap: var(--px-6);
  margin-top: var(--px-12);
}

.weight-form-steps__chip {
  flex: 1;
  padding: 6px 0;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: var(--white);
  font-size: var(--rem-8);
  font-weight: var(--number-600);
  cursor: pointer;
}

.weight-form-body {
  padding: var(--px-14) var(--px-16) calc(var(--px-16) + env(safe-area-inset-bottom, 0px));
}

.weight-form-direct {
  margin-bottom: var(--px-12);
}

.weight-form-direct__field {
  border-radius: var(--radius-12);
  overflow: hidden;
  background: #f4f5f7;
}

.weight-form-section {
  margin-bottom: var(--px-12);
}

.weight-form-section__label {
  margin-bottom: var(--px-6);
  font-size: var(--rem-8);
  color: var(--gray500);
}

.weight-form-time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--px-10) var(--px-12);
  border-radius: var(--radius-12);
  background: #f4f5f7;
  font-size: var(--rem-9);
  color: var(--black300);
  cursor: pointer;
}

.weight-form-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--px-8);
}

.weight-form-tag {
  padding: 6px 12px;
  border: 1px solid var(--gray200, #ebedf0);
  border-radius: 999px;
  background: var(--white);
  color: var(--black300);
  font-size: var(--rem-8);
  cursor: pointer;
}

.weight-form-tag.active {
  border-color: #3d8f82;
  background: #e8f4f2;
  color: #3d8f82;
  font-weight: var(--number-600);
}

.weight-form-submit {
  margin-top: var(--px-4);
  background: #3d8f82;
  border-color: #3d8f82;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--px-16);
}

.popup-title {
  font-size: var(--rem-12);
  font-weight: var(--number-700);
  color: var(--black300);
}

.delete-btn {
  color: #ee0a24;
  cursor: pointer;
}

.submit-btn {
  margin-top: var(--px-20);
  background: #3d8f82;
  border-color: #3d8f82;
}
</style>
