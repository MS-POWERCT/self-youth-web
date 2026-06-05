<template>
  <div class="value-habits">
    <br />
    <!-- 记录列表 -->
    <div class="records-container">
      <div class="habit-list">
        <div class="habit-item bg-gray100" v-for="value in habits" :key="value.id"
          @click="showRecordForm(value, 'add')">
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
          <div v-for="(record, record_date, index) in valueRecords" :key="record_date" class="record-item">
            <!-- 格式n月n日record.record_date -->
            <div>
              <span>{{ formatDate(record.record_date) }}</span>
              <span>
                <IconifyIcon icon="fluent-color:arrow-trending-lines-24" size="16" />
              </span>

            </div>
            <!-- 这里来一条很细的分割线 -->
            <van-divider class="record-divider" />
            <div class="record-info" v-for="(v, i) in record.list" :key="v.id" @click="showRecordForm(v, 'edit')">
              <!-- <div class="record-habit">{{ getHabitName(record.habit_id) }}</div> -->

              <div class="record-time">
                <span>{{ formatTime(v.record_start_time) }}</span>
                <!-- 一个点 -->
              </div>

              <div class="record-name">
                <svg class="icon" aria-hidden="true">
                  <use :xlink:href="'#' + v.user_habit.icon" />
                </svg>
                {{ v.user_habit.name }}
              </div>
              <div class="record-value-container">
                <div>{{ v.value }} min</div>
                <div>
                  <span v-if="index == 0 && i == 0">{{ getRelativeTime(v.record_start_time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <!-- 记录表单弹出窗 -->
    <van-popup v-model:show="showFormPopup" position="bottom" :style="{ height: '100vh' }" @click-overlay="closePopup">
      <div class="record-form">
        <div class="popup-header">
          <div class="header-left">
            <van-icon name="arrow-left" size="22" @click="closePopup" />
          </div>
          <div class="header-title">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#' + selectedHabit.icon" />
            </svg>
            <span>{{ selectedHabit.name }}</span>
          </div>
          <div class="header-right">
            <van-icon v-if="showFormPopupType == 'edit'" name="delete-o" size="22"
              @click="handleDelete(formValue.id)" />
          </div>
        </div>
        <div class="form-content">
          <!-- 表单字段框架 - 您可以在这里添加具体的表单内容 -->
          <!-- 示例字段，您可以根据需要修改 -->
          <br />
          <div>
            <van-field v-model="formValue.record_start_time" label="开始时间" placeholder="请选择开始时间" readonly
              @click="showStartTiemPicker = true" class="mb-4">
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

        <div class="form-footer">
          <van-button type="primary" plain block @click="saveRecord" :loading="saving">
            保存
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 使用封装的滚轮日期选择器 -->
    <WheelDateTimePicker v-model:show="showStartTiemPicker" :default-date="formValue.record_start_time"
      @confirm="handlePickerConfirm" />
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
  const { date } = result
  formValue.value.record_start_time = getCurrentTime('datetime_cn', date)
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
  if (type == 'add') {
    selectedHabit.value = habit
    formValue.value.record_start_time = getCurrentTime('datetime_cn')
  } else {
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

// 保存记录
const saveRecord = async () => {
  if (!formValue.value.value) {
    showToast('请输入数值')
    return
  }

  try {
    saving.value = true
    // 这里您可以添加具体的保存逻辑

    let record_start_time = formValue.value.record_start_time.replace('年', '-').replace('月', '-').replace('日', '')
    // // 分别替换月份和日期
    // record_start_time = record_start_time.replace(/-(\d+)-(\d+)$/, (match, month, day) => {
    //   return `-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    // });

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
  display: flex;
  flex-direction: column;

}

/* 页面头部 */
.page-header {
  padding: 16px 20px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
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
}



/* 习惯列表 */
.habit-list {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.habit-list::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.habit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  min-width: 80px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  /* 防止收缩 */
  white-space: nowrap;
  /* 防止文字换行 */
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
}

.habit-name {
  text-align: center;
  font-weight: 500;
}

/* 记录列表 */
.records-list {
  padding: 12px 0;
}

.record-item {
  /* overflow: hidden; */
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  box-shadow: 0 2px 8px 2px rgba(0, 0, 0, 0.05);

}

.record-info {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border: 1px solid var(--border-light);
  height: 60px;
}

.record-habit {
  flex: 1;
  font-weight: 500;
}



.record-time {
  min-width: 60px;
  text-align: right;
}

.record-value-container {
  width: 40%;

  >div {
    min-width: 80px;
    max-width: 80px;
    text-align: left;
    text-align: center;
  }

  /*第二个div */
  >div:nth-child(2) {
    background: var(--primary100);
    color: var(--primary);
    border-radius: 8px;
  }
}

/* 记录表单弹出窗样式 */

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.header-title {
  font-weight: 500;
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
  /* 垂直居中 */
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 0 2;
}

.habit-info-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.form-footer {
  margin-top: auto;
}

:deep(.van-field__label) {
  margin-right: 0;
}
</style>
