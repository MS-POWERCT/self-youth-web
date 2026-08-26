<template>
  <div class="value-habits">
    <div class="category-row">
      <div
        v-for="habit in visibleHabits"
        :key="habit.id"
        class="category-card"
        :class="{ active: selectedHabitId === habit.id }"
        @click="selectHabit(habit)"
      >
        <div class="category-icon" :style="{ backgroundColor: getIconBg(habit.id) }">
          <IconifyIcon :icon="habit.habit_icon.icon" width="24" />
        </div>
        <div class="category-name">{{ habit.name }}</div>
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="records-container">
        <div v-if="!loading && isEmpty" class="empty-state">
          <IconifyIcon icon="streamline-stickies-color:rocket-launch-chart" width="48" />
          <p>暂无记录</p>
        </div>

        <div v-else class="records-list">
          <div
            v-for="(record, recordDate, groupIndex) in valueRecords"
            :key="recordDate"
            class="date-group"
          >
            <div class="date-header">{{ formatDate(record.record_date) }}</div>

            <div
              v-for="(item, itemIndex) in record.list"
              :key="item.id"
              class="record-card"
              @click="showRecordForm(item, 'edit')"
            >
              <div
                class="record-icon"
                :style="{ backgroundColor: getIconBg(item.user_habit?.id || item.id) }"
              >
                <IconifyIcon :icon="item.user_habit.habit_icon.icon" width="22" />
              </div>

              <div class="record-info">
                <div class="record-name">{{ item.user_habit.name }}</div>
                <div class="record-time">{{ formatTime(item.record_start_time) }}</div>
              </div>

              <div class="record-value-wrap">
                <div class="record-value">{{ item.value }} min</div>
                <span
                  v-if="groupIndex === 0 && itemIndex === 0"
                  class="recent-badge"
                >
                  {{ getRelativeTime(item.record_start_time) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <van-popup v-model:show="showFormPopup" position="bottom" :style="{ height: '100vh' }" @click-overlay="closePopup">
      <div class="record-form">
        <div class="popup-header">
          <div class="header-left">
            <van-icon name="arrow-left" size="22" @click="closePopup" />
          </div>
          <div class="header-title">
            <IconifyIcon :icon="selectedHabit.icon" width="20" />
            &nbsp;
            <span>{{ selectedHabit.name }}</span>
          </div>
          <div class="header-right">
            <van-icon
              v-if="showFormPopupType == 'edit'"
              name="delete-o"
              size="22"
              @click="handleDelete(formValue.id)"
            />
          </div>
        </div>
        <div class="form-content">
          <br />
          <div>
            <van-field
              v-model="formValue.record_start_time"
              label="开始时间"
              placeholder="请选择开始时间"
              readonly
              @click="showStartTiemPicker = true"
              class="mb-4"
            >
              <template #right-icon>
                <van-icon name="clock-o" />
              </template>
            </van-field>
          </div>
          <br />
          <div>
            <WheelTimePicker v-model="formValue.value" class="mr-12 ml-12" />
          </div>
          <br />
          <div>
            <van-field v-model="formValue.note" label="备注" placeholder="请输入备注" maxlength="100" class="mt-4" />
          </div>
        </div>

        <div class="form-footer" @click="saveRecord" :loading="saving">
          保存
        </div>
      </div>
    </van-popup>

    <WheelDateTimePicker
      v-model:show="showStartTiemPicker"
      :default-date="formValue.record_start_time"
      @confirm="handlePickerConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { useHabitStore } from '../../stores/habit'
import { getCurrentTime, formatDate, formatTime, getRelativeTime } from '@/utils/common'

import WheelDateTimePicker from '../../components/tools/WheelDateTimePicker.vue'
import WheelTimePicker from '../tools/WheelValuePicker.vue'

const habitStore = useHabitStore()
const loading = ref(false)
const refreshing = ref(false)
const selectedHabitId = ref(null)

const iconBgColors = ['#d4f0e8', '#fff3c4', '#dce8f5', '#e8dff5', '#fce4ec']

const showFormPopup = ref(false)
const showFormPopupType = ref('')
const selectedHabit = ref({})
const saving = ref(false)
const showStartTiemPicker = ref(false)

const formValue = ref({
  habit_id: '',
  value: 0,
  note: '',
  record_start_time: getCurrentTime('datetime_cn'),
  note_image: '',
})

const habits = computed(() => habitStore.habits)
const valueRecords = computed(() => habitStore.valueRecords)

const visibleHabits = computed(() => habits.value.filter(habit => habit.is_show))

const isEmpty = computed(() => {
  const records = valueRecords.value
  if (!records || (Array.isArray(records) && records.length === 0)) return true
  if (typeof records === 'object') {
    return Object.keys(records).length === 0
  }
  return true
})

const getIconBg = (id) => iconBgColors[(id || 0) % iconBgColors.length]

const handlePickerConfirm = (result) => {
  const { date } = result
  formValue.value.record_start_time = getCurrentTime('datetime_cn', date)
}

const loadHabits = async () => {
  try {
    loading.value = true
    await habitStore.fetchHabits('2')
    await habitStore.fetchValueRecords()
    if (!selectedHabitId.value && visibleHabits.value.length > 0) {
      selectedHabitId.value = visibleHabits.value[0].id
    }
  } catch (error) {
    console.error('加载习惯列表失败', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  try {
    refreshing.value = true
    await habitStore.fetchHabits('2')
    await habitStore.fetchValueRecords()
  } catch (error) {
    console.error('刷新失败', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

const selectHabit = (habit) => {
  selectedHabitId.value = habit.id
  showRecordForm(habit, 'add')
}

const showRecordForm = (habit, type) => {
  showFormPopup.value = true
  showFormPopupType.value = type
  if (type == 'add') {
    selectedHabit.value = habit
    formValue.value.record_start_time = getCurrentTime('datetime_cn')
  } else {
    selectedHabit.value.icon = habit.user_habit.habit_icon.icon
    selectedHabit.value.name = habit.user_habit.name
    formValue.value.id = habit.id
    formValue.value.record_start_time = getCurrentTime('datetime_cn', new Date(habit.record_start_time))
    formValue.value.note = habit.note
    formValue.value.note_image = habit.note_image
    formValue.value.value = habit.value
  }
}

const closePopup = () => {
  showFormPopup.value = false
  showFormPopupType.value = ''
  formValue.value = {
    habit_id: '',
    value: 0,
    note: '',
    record_start_time: getCurrentTime(),
    note_image: '',
  }
}

const handleDelete = async (id) => {
  try {
    await habitStore.deleteValueRecord(id)
    closePopup()
    showToast('删除成功')
    await onRefresh()
  } catch (error) {
    console.error('删除记录失败', error)
    showToast('删除失败')
  }
}

const saveRecord = async () => {
  if (!formValue.value.value) {
    showToast('请输入数值')
    return
  }

  try {
    saving.value = true

    let record_start_time = formValue.value.record_start_time.replace('年', '-').replace('月', '-').replace('日', '')

    if (showFormPopupType.value == 'add') {
      habitStore.createValueRecord(
        selectedHabit.value.id,
        formValue.value.value,
        record_start_time,
        formValue.value.note,
        formValue.value.note_image
      )
    } else {
      habitStore.editValueRecord(
        formValue.value.id,
        formValue.value.value,
        record_start_time,
        formValue.value.note,
        formValue.value.note_image
      )
    }

    showToast('保存成功')
    showFormPopup.value = false
    await onRefresh()
  } catch (error) {
    console.error('保存记录失败', error)
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadHabits()
})
</script>

<style scoped>
.value-habits {
  display: flex;
  flex-direction: column;
  background-color: #f4f5f7;
  min-height: 100%;
}

.category-row {
  display: flex;
  gap: var(--px-12);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-row::-webkit-scrollbar {
  display: none;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 88px;
  padding: var(--px-12) var(--px-8);
  border-radius: var(--radius-12);
  background-color: var(--white);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.category-card.active {
  border-color: #3d8f82;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-12);
  margin-bottom: var(--px-8);
}

.category-name {
  font-size: var(--rem-8);
  font-weight: var(--number-500);
  color: var(--black300);
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--gray500);
}

.empty-state p {
  margin-top: var(--px-12);
  font-size: var(--rem-9);
}

.records-list {
  padding-bottom: var(--px-16);
}

.date-group {
  margin-bottom: var(--px-16);
}

.date-header {
  font-size: var(--rem-9);
  color: var(--gray500);
  margin-bottom: var(--px-10);
  padding-left: var(--px-4);
}

.record-card {
  display: flex;
  align-items: center;
  gap: var(--px-12);
  padding: var(--px-14) var(--px-16);
  margin-bottom: var(--px-10);
  border-radius: var(--radius-16);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.record-card:last-child {
  margin-bottom: 0;
}

.record-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-12);
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-name {
  font-size: var(--rem-10);
  font-weight: var(--number-500);
  color: var(--black300);
  line-height: 1.4;
}

.record-time {
  margin-top: var(--px-2);
  font-size: var(--rem-8);
  color: var(--gray500);
  line-height: 1.4;
}

.record-value-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--px-4);
  flex-shrink: 0;
}

.record-value {
  font-size: var(--rem-12);
  font-weight: var(--number-700);
  color: #3d8f82;
  line-height: 1.2;
}

.recent-badge {
  padding: 2px var(--px-8);
  border-radius: var(--radius-9999);
  background-color: var(--primary100);
  color: var(--primary);
  font-size: var(--rem-7);
  line-height: 1.4;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.header-title {
  font-weight: 500;
  display: flex;
  align-items: center;
}

.header-left .van-icon,
.header-right .van-icon {
  cursor: pointer;
}

.record-form {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--gray300);
}

.form-content {
  flex: 1;
  overflow-y: auto;
  border-radius: 8px;
  max-height: 70vh;
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 0 2;
}

.form-footer {
  margin-top: auto;
  text-align: center;
  padding: 16px;
  background: var(--white);
  border-radius: 8px;
  font-weight: 700;
}

:deep(.van-field__label) {
  margin-right: 0;
}
</style>
