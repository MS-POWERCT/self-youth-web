<template>
  <div class="value-habits">
    <br/>
    <!-- 记录列表 -->
    <div class="records-container">
      <div class="habit-list">
        <div class="habit-item" v-for="value in habits" :key="value.id" @click="showRecordForm(value, 'add')">
          <div class="habit-icon">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#' + value.icon" />
            </svg>
          </div>
          <div class="habit-name">{{ value.name }}</div>
        </div>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="!loading && valueRecords.length === 0" class="empty-state">
          <van-icon name="chart-trending-o" size="48" color="#c8c9cc" />
          <p>暂无记录</p>
        </div>
        <div v-else class="records-list">
          <div
            v-for="(record, record_date, index) in valueRecords"
            :key="record_date"
            class="record-item"
          >
          <!-- 格式n月n日record.record_date -->

            <div class="record-date">{{ formatDate(record.record_date) }}</div>
              <div class="record-info" v-for="(v, i) in record.list" :key="v.id" @click="showRecordForm(v, 'edit')">
                <!-- <div class="record-habit">{{ getHabitName(record.habit_id) }}</div> -->

                <div class="record-time">{{formatTime(v.record_start_time)}}</div>
                <div class="record-name">
                  <svg class="icon" aria-hidden="true">
                    <use :xlink:href="'#' + v.user_habit.icon" />
                  </svg>
                  {{ v.user_habit.name }}
                </div>
                <div>
                  <div class="record-value">{{ v.value }} min</div>
                  <div class="record-value2 radius-4 pl-2 pr-2 bg-gray-200">
                    <span v-if="index == 0 && i == 0">{{ getRelativeTime(v.record_start_time) }}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <!-- 记录表单弹出窗 -->
    <van-popup
      v-model:show="showFormPopup"
      position="bottom"
      :style="{ height: '100vh' }"
      @click-overlay="closePopup"
    >
      <div class="record-form">
        <div class="popup-header">
          <div class="header-left">
            <van-icon name="arrow-left" size="22" @click="closePopup" />
          </div>
          <div class="header-title">编辑信息</div>
          <div class="header-right">
            <van-icon v-if="showFormPopupType == 'edit'" name="delete-o" size="22" @click="handleDelete(formValue.id)" />
          </div>
        </div>
        <div class="form-content">
          <div class="habit-info-display">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#' + selectedHabit.icon" />
            </svg>
            <span>{{ selectedHabit.name }}</span>
          </div>

          <!-- 表单字段框架 - 您可以在这里添加具体的表单内容 -->
          <div class="form-fields">
            <!-- 示例字段，您可以根据需要修改 -->
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
            <WheelTimePicker
              v-model="formValue.value"
              @change="handleTimeChange"
            />
            <van-field
              v-model="formValue.note"
              label="备注"
              placeholder="请输入备注"
              maxlength="100"
              show-word-limit
              class="mt-4"
            />
          </div>
        </div>

        <div class="form-footer">
          <van-button
            type="primary"
            block
            @click="saveRecord"
            :loading="saving"
          >
          保持
          </van-button>
        </div>
      </div>
    </van-popup>

     <!-- 使用封装的滚轮日期选择器 -->
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
import WheelTimePicker from '../../components/tools/WheelTimePicker.vue'

const habitStore = useHabitStore()
const loading = ref(false)
const refreshing = ref(false)


// 弹出表单相关
const showFormPopup = ref(false)
const showFormPopupType = ref('')
const selectedHabit = ref({})
const saving = ref(false)
const showStartTiemPicker = ref(false)

const formValue = ref({
  habit_id: '',
  value: 0,
  note: '',
  record_start_time: getCurrentTime('datetime_cn'), // 当前时间
  note_image: '',
})
const habits = computed(() => habitStore.habits)
const valueRecords = computed(() => habitStore.valueRecords)


const handlePickerConfirm = (result) => {
  const { year, month, day, hour, minute } = result
  formValue.value.record_start_time = `${year}年${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// 加载习惯列表
const loadHabits = async () => {
  try {
    loading.value = true
    await habitStore.fetchHabits('2')
    // 修复时区问题：使用本地时间格式化日期
    await habitStore.fetchValueRecords()
  } catch (error) {
    console.error('加载习惯列表失败', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 刷新
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

// 显示记录表单
const showRecordForm = (habit, type) => {
  showFormPopup.value = true
  showFormPopupType.value = type
  if(type == 'add'){
    selectedHabit.value = habit
    formValue.value.record_start_time = getCurrentTime('datetime_cn')
  }else{
    selectedHabit.value.icon = habit.user_habit.icon
    selectedHabit.value.name = habit.user_habit.name
    formValue.value.id = habit.id
    formValue.value.record_start_time = getCurrentTime('datetime_cn', new Date(habit.record_start_time))
    formValue.value.note = habit.note
    formValue.value.note_image = habit.note_image
    formValue.value.value = habit.value
  }
}
// 关闭记录表单
const closePopup = () => {
  showFormPopup.value = false
  showFormPopupType.value = ''
  formValue.value = {
    habit_id: '',
    value: 0,
    note: '',
    record_start_time: getCurrentTime(), // 当前时间
    note_image: '',
  }
}
// 删除记录
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

const handleTimeChange = (value) => {
  console.log('时长变化:', value)
}

// 保存记录
const saveRecord = async () => {
  if (!formValue.value.value) {
    showToast('请输入数值')
    return
  }

  try {
    saving.value = true
    // 这里您可以添加具体的保存逻辑

    const record_start_time = formValue.value.record_start_time.replace('年', '-').replace('月', '-').replace('日', '')

    if(showFormPopupType.value == 'add'){
      habitStore.createValueRecord(
        selectedHabit.value.id,
        formValue.value.value,
        record_start_time,
        formValue.value.note,
        formValue.value.note_image
      )
    } else{
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
    // 可以在这里刷新记录列表
    await onRefresh()
  } catch (error) {
    console.error('保存记录失败', error)
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  loadHabits()
})
</script>

<style scoped>
.value-habits {
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 16px 20px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.page-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gray700);
}

.header-date {
  margin: 0;
  font-size: 12px;
  color: var(--gray500);
}

/* 记录列表容器 */
.records-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--gray500);
}

.empty-state p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

/* 习惯列表 */
.habit-list {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.habit-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.habit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  min-width: 80px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  flex-shrink: 0; /* 防止收缩 */
  white-space: nowrap; /* 防止文字换行 */
}

.habit-item:hover {
  background: #e8f4ff;
  transform: translateY(-2px);
}

.habit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.habit-icon svg {
  width: 24px;
  height: 24px;
  color: var(--info-blue);
}

.habit-name {
  font-size: 12px;
  color: var(--gray700);
  text-align: center;
  font-weight: 500;
}

/* 记录列表 */
.records-list {
  padding: 12px 0;
}

.record-item {
  background: var(--white);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;

}

.record-info {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  margin: 8px;
}

.record-habit {
  flex: 1;
  font-size: 14px;
  color: var(--gray700);
  font-weight: 500;
}

.record-value {
  min-width: 60px;
  text-align: center;
}
.record-value2 {
  color: var(--danger-pink);
  min-width: 60px;
  text-align: center;
}
.record-time {
  font-size: 12px;
  color: var(--gray500);
  min-width: 60px;
  text-align: right;
}

/* 记录表单弹出窗样式 */

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray700);
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
  /* 上蓝下浅蓝 */
  background: linear-gradient(180deg, #aacff1 0%, #c2dbe7 100%);
}

.form-content {
  flex: 1;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  max-height: 70vh;
}

.habit-info-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.habit-info-display svg {
  width: 24px;
  height: 24px;
  color: var(--info-blue);
}

.habit-info-display span {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray700);
}

.form-fields {
  margin-bottom: 16px;
}

.form-footer {
  margin-top: auto;
}

</style>
