<template>
  <div class="habit-edit-page" :class="$attrs.class">
    <van-nav-bar
      :title="activeTab == 1 ? '打卡习惯' : '数值习惯'"
      left-arrow
      @click-left="$router.go(-1)"
      class="edit-nav-bar"
    >
    </van-nav-bar>

    <div class="habits-list">
      <button class="habit-add" type="button" @click="showPopup()">
        <span class="add-icon">+</span>
        <span class="add-text">添加新习惯</span>
      </button>

      <div
        v-for="habit in editableHabits"
        :key="habit.id"
        class="habit-item"
        :class="{ 'is-hidden': !habit.is_show }"
      >
        <div class="habit-main">
          <div class="habit-icon" :style="{ backgroundColor: getIconBg(habit.id) }">
            <IconifyIcon :icon="habit.habit_icon.icon" width="24" />
          </div>
          <div class="habit-info">
            <div class="habit-name-row">
              <span class="habit-name">{{ habit.name }}</span>
              <van-tag v-if="habit.fixed" type="warning" size="small" class="habit-tag">系统</van-tag>
              <van-tag v-if="!habit.is_show" type="default" size="small" class="habit-tag">已隐藏</van-tag>
            </div>
            <div class="habit-meta">{{ habit.is_show ? '主页显示中' : '主页已隐藏' }}</div>
          </div>
        </div>

        <div class="habit-actions">
          <button class="action-btn action-edit" type="button" @click="showPopup(habit)">
            <van-icon name="edit" size="16" />
            <span>编辑</span>
          </button>
          <button
            class="action-btn"
            :class="habit.is_show ? 'action-hide' : 'action-show'"
            type="button"
            @click="toggleHabitVisibility(habit)"
          >
            <van-icon :name="habit.is_show ? 'closed-eye' : 'eye-o'" size="16" />
            <span>{{ habit.is_show ? '隐藏' : '显示' }}</span>
          </button>
          <button
            v-if="!habit.fixed"
            class="action-btn action-delete"
            type="button"
            @click="deleteHabit(habit)"
          >
            <van-icon name="delete-o" size="16" />
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <van-popup v-model:show="showAddPopup" position="bottom" :style="{ height: '50%' }" round @click-overlay="closePopup">
    <div class="add-popup">
      <div class="popup-title">{{ isEditMode ? '编辑习惯' : '添加习惯' }}</div>
      <div class="popup-content">
        <van-field
          v-model="addForm.name"
          label="习惯名称"
          :placeholder="isEditMode ? '' : '请输入习惯名称'"
          show-word-limit
          :disabled="isEditMode"
          :class="{ 'name-disabled': isEditMode }"
        />

        <van-field v-model="addForm.icon" label="图标" placeholder="选择图标" readonly @click="showIconPicker = true">
          <template #right-icon>
            <IconifyIcon :icon="addForm.icon" width="24" />
          </template>
        </van-field>
      </div>
      <div class="popup-footer">
        <van-button type="primary" block round @click="saveAddHabit" :loading="adding">
          {{ showAddPopupButtonName }}
        </van-button>
      </div>
    </div>
  </van-popup>

  <van-popup v-model:show="showIconPicker" position="bottom" :style="{ height: '50%' }" round>
    <div class="icon-picker">
      <div class="picker-title">选择图标</div>
      <div class="icon-grid">
        <div
          v-for="icon in iconList"
          :key="icon.id"
          class="icon-item"
          :class="{ active: addForm.icon === icon.icon }"
          @click="selectIcon(icon)"
        >
          <IconifyIcon class="icon mb-2" :icon="icon.icon" width="24" />
          <span class="icon-name">{{ icon.name }}</span>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

import { showToast, showConfirmDialog } from 'vant'
import { useHabitStore } from '../stores/habit'
import { useRoute } from 'vue-router'
import { habitApi } from '../api/habit'

const route = useRoute()
const habitStore = useHabitStore()

const iconBgColors = ['#fff3c4', '#ffe8d6', '#d4f0e8', '#e8dff5', '#fce4ec']

const editableHabits = computed(() => habitStore.editableHabits)
const activeTab = computed(() => route.query.tab || '1')

const editId = ref(0)
const showAddPopup = ref(false)
const showAddPopupType = ref('')
const showAddPopupButtonName = ref('')
const showIconPicker = ref(false)
const adding = ref(false)

const isEditMode = computed(() => showAddPopupType.value === 'edit')

const addForm = ref({
  name: '',
  icon: '',
  icon_id: 0,
  type: activeTab.value,
})

const iconList = ref([])

const getIconBg = (id) => iconBgColors[(id || 0) % iconBgColors.length]

const showPopup = async (habit) => {
  showAddPopup.value = true
  showAddPopupButtonName.value = habit ? '保存修改' : '确认添加'
  showAddPopupType.value = habit ? 'edit' : 'add'
  editId.value = habit ? habit.id || 0 : 0
  if (habit) {
    addForm.value = {
      name: habit.name,
      icon: habit.habit_icon?.icon || habit.icon || '',
      icon_id: habit.icon_id || 0,
      type: habit.type.toString(),
    }
  } else {
    addForm.value = {
      name: '',
      icon: '',
      icon_id: 0,
      type: activeTab.value,
    }
  }
}

const closePopup = async () => {
  addForm.value = {
    name: '',
    icon: '',
    icon_id: 0,
    type: activeTab.value,
  }
}

const loadHabits = async () => {
  try {
    await habitStore.fetchEditableList(activeTab.value)
  } catch (error) {
    console.error('加载习惯列表失败', error)
    showToast('加载失败')
  }
}

const toggleHabitVisibility = async (habit) => {
  try {
    await habitStore.toggleHabitVisibility(habit.id, habit.is_show)
    habit.is_show = !habit.is_show
    showToast(habit.is_show ? '已显示' : '已隐藏')
  } catch (error) {
    console.error('切换习惯显示状态失败', error)
    showToast('操作失败')
  }
}

const deleteHabit = async (habit) => {
  if (habit.fixed) {
    showToast('系统默认习惯不能删除')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除习惯「${habit.name}」吗？`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24',
    })

    await habitStore.deleteHabit(habit.id)
    showToast('删除成功')
    await loadHabits()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除习惯失败', error)
      showToast('删除失败')
    }
  }
}

const loadIconList = async () => {
  try {
    const response = await habitApi.getIconList()
    iconList.value = response || []
  } catch (error) {
    console.error('加载图标列表失败', error)
    showToast('加载图标失败')
  }
}

const selectIcon = (icon) => {
  addForm.value.icon_id = icon.id
  addForm.value.icon = icon.icon
  showIconPicker.value = false
}

const saveAddHabit = async () => {
  if (!addForm.value.name.trim()) {
    showToast('请输入习惯名称')
    return
  }

  if (!addForm.value.icon) {
    showToast('请选择图标')
    return
  }

  try {
    adding.value = true

    if (showAddPopupType.value == 'add') {
      await habitStore.createHabit(addForm.value.name, addForm.value.type, addForm.value.icon_id)
    } else {
      await habitStore.editHabit(editId.value, addForm.value.name, addForm.value.type, addForm.value.icon_id)
    }

    showToast('保存成功')
    showAddPopup.value = false
    addForm.value = {
      name: '',
      icon: '',
      icon_id: 0,
      type: activeTab.value,
    }
    await loadHabits()
  } catch (error) {
    console.error('操作失败', error)
    showToast(error || '保存失败')
  } finally {
    adding.value = false
  }
}

onMounted(() => {
  loadHabits()
  loadIconList()
})
</script>

<style scoped>
.habit-edit-page {
  min-height: 100vh;
  background-color: #f4f5f7;
}

.edit-nav-bar {
  background-color: #f4f5f7;
}

.edit-nav-bar :deep(.van-nav-bar__content) {
  background-color: #f4f5f7;
}

.nav-stats-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #e8f4f2;
  color: #3d8f82;
  cursor: pointer;
}

.habits-list {
  padding: var(--px-12) var(--px-16) var(--px-24);
}

.habit-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--px-8);
  width: 100%;
  padding: var(--px-16);
  margin-bottom: var(--px-12);
  border: 2px dashed #c8d0d8;
  border-radius: var(--radius-16);
  background-color: var(--white);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.habit-add:active {
  background-color: #fafbfc;
  border-color: #3d8f82;
}

.add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #d4f0e8;
  color: #3d8f82;
  font-size: var(--rem-14);
  font-weight: var(--number-700);
  line-height: 1;
}

.add-text {
  font-size: var(--rem-10);
  font-weight: var(--number-500);
  color: var(--black300);
}

.habit-item {
  padding: var(--px-16);
  margin-bottom: var(--px-12);
  border-radius: var(--radius-16);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: opacity 0.2s ease;
}

.habit-item.is-hidden {
  opacity: 0.72;
}

.habit-main {
  display: flex;
  align-items: center;
  gap: var(--px-12);
  margin-bottom: var(--px-14);
}

.habit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-12);
  flex-shrink: 0;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-name-row {
  display: flex;
  align-items: center;
  gap: var(--px-6);
  flex-wrap: wrap;
}

.habit-name {
  font-size: var(--rem-10);
  font-weight: var(--number-700);
  color: var(--black300);
  line-height: 1.4;
}

.habit-tag {
  flex-shrink: 0;
}

.habit-meta {
  margin-top: var(--px-4);
  font-size: var(--rem-8);
  color: var(--gray500);
}

.habit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--px-8);
  padding-top: var(--px-12);
  border-top: 1px solid var(--gray300);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px var(--px-12);
  border: none;
  border-radius: var(--radius-9999);
  font-size: var(--rem-8);
  font-weight: var(--number-500);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.action-btn:active {
  opacity: 0.7;
}

.action-edit {
  background-color: #e8f4f2;
  color: #3d8f82;
}

.action-hide {
  background-color: #f0f2f5;
  color: var(--black500);
}

.action-show {
  background-color: #e8f0fa;
  color: #4a7fd4;
}

.action-delete {
  background-color: #fff0f0;
  color: #ee0a24;
}

.add-popup {
  padding: var(--px-20) var(--px-16) var(--px-16);
}

.popup-title {
  font-size: var(--rem-12);
  font-weight: var(--number-700);
  color: var(--black300);
  text-align: center;
  margin-bottom: var(--px-16);
}

.popup-content {
  margin-bottom: var(--px-16);
}

.popup-footer :deep(.van-button--primary) {
  background: #3d8f82;
  border-color: #3d8f82;
}

.icon-picker {
  padding: var(--px-16);
}

.picker-title {
  font-size: var(--rem-10);
  font-weight: var(--number-700);
  text-align: center;
  margin-bottom: var(--px-16);
  color: var(--black300);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--px-12);
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--px-12) var(--px-8);
  border: 2px solid transparent;
  border-radius: var(--radius-12);
  background-color: #f4f5f7;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.icon-item.active {
  border-color: #3d8f82;
  background-color: #e8f4f2;
}

.icon-name {
  font-size: var(--rem-7);
  color: var(--gray500);
  text-align: center;
  line-height: 1.3;
}

:deep(.van-field__right-icon svg) {
  width: 24px;
  height: 24px;
}

.name-disabled {
  opacity: 0.7;
}

.name-disabled :deep(.van-field__control) {
  color: var(--gray500);
  font-weight: var(--number-500);
}
</style>
