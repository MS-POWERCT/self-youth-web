<template>
  <div class="habit-edit-page bg-gray100" :class="$attrs.class">
    <van-nav-bar :title="activeTab == 1 ? '打卡习惯' : '数值习惯'" left-arrow @click-left="$router.go(-1)" />
    <!-- 习惯列表 -->
    <div class="habits-list p-4">
      <div class="habit-add text-center p-2 mb-12 bg-white radius-8" @click="showPopup()"> + </div>
      <div v-for="habit in editableHabits" :key="habit.id"
        class="habit-item flex items-center justify-between p-4 mb-12 bg-white radius-8"
        :class="{ hidden: !habit.is_show }">
        <div class="habit-info flex items-center gap-3 flex-1">
          <IconifyIcon :icon="habit.habit_icon.icon" width="24" />
          <span class="text-16">{{ habit.name }}</span>
          <van-tag v-if="habit.fixed" type="warning" size="small">系统默认</van-tag>
        </div>
        <div class="habit-actions flex gap-2">
          <van-button size="mini" type="danger" plain @click="showPopup(habit)">
            编辑
          </van-button>
          <van-button size="mini" :type="habit.is_show ? 'default' : 'primary'" plain
            @click="toggleHabitVisibility(habit)">
            {{ habit.is_show ? '隐藏' : '显示' }}
          </van-button>
          <van-button v-if="!habit.fixed" size="mini" type="danger" plain @click="deleteHabit(habit)">
            删除
          </van-button>
        </div>
      </div>
    </div>

  </div>
  <!-- 添加习惯弹出窗 -->
  <van-popup v-model:show="showAddPopup" position="bottom" :style="{ height: '50%' }" round @click-overlay="closePopup">
    <div class="add-popup p-4">
      <div class="popup-content mb-4">
        <van-field v-model="addForm.name" label="习惯名称" :placeholder="isEditMode ? '' : '请输入习惯名称'" show-word-limit
          :disabled="isEditMode" :class="{ 'name-disabled': isEditMode }" />

        <van-field v-model="addForm.icon" label="图标" placeholder="选择图标" readonly @click="showIconPicker = true">
          <template #right-icon>
            <IconifyIcon :icon="addForm.icon" width="24" />
          </template>
        </van-field>
      </div>
      <div class="popup-footer mt-4">
        <van-button type="primary" block @click="saveAddHabit" :loading="adding">
          {{ showAddPopupButtonName }}
        </van-button>
      </div>
    </div>
  </van-popup>

  <!-- 图标选择器 -->
  <van-popup v-model:show="showIconPicker" position="bottom" :style="{ height: '50%' }">
    <div class="icon-picker p-4">
      <div class="picker-title text-16 font-bold text-center mb-4">选择图标</div>
      <div class="icon-grid grid grid-cols-4 gap-3">
        <div v-for="icon in iconList" :key="icon.id"
          class="icon-item flex flex-col items-center justify-center px-2 py-3 radius-8"
          :class="{ active: addForm.icon === icon.icon }" @click="selectIcon(icon)">
          <IconifyIcon class="icon mb-2" :icon="icon.icon" width="24" />
          <span class="text-center">{{ icon.name }}</span>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// 防止属性自动继承到其他根节点
defineOptions({
  inheritAttrs: false
})
import { showToast, showConfirmDialog } from 'vant'
import { useHabitStore } from '../stores/habit'
import { useRoute } from 'vue-router'
import { habitApi } from '../api/habit'

const route = useRoute()
const habitStore = useHabitStore()

const editableHabits = computed(() => habitStore.editableHabits)
const activeTab = computed(() => route.query.tab || '1') // 从路由参数获取activeTab

// 保存编辑id
const editId = ref(0)

// 弹窗相关
const showAddPopup = ref(false)
const showAddPopupType = ref('')
const showAddPopupButtonName = ref('')
const showIconPicker = ref(false)
const adding = ref(false)

// 判断是否为编辑模式
const isEditMode = computed(() => showAddPopupType.value === 'edit')

const addForm = ref({
  name: '',
  icon: '',
  icon_id: 0,
  type: activeTab.value
})


// 可选图标列表
const iconList = ref([])

// 方法
// 弹出按钮
const showPopup = async (habit) => {
  showAddPopup.value = true
  showAddPopupButtonName.value = habit ? '修改' : '添加'
  showAddPopupType.value = habit ? 'edit' : 'add'
  // 保存编辑id
  editId.value = habit ? habit.id || 0 : 0
  if (habit) {
    addForm.value = {
      name: habit.name,
      icon: habit.icon || '',
      type: habit.type.toString()
    }
  }
}
const closePopup = async () => {
  addForm.value = {
    name: '',
    icon: '',
    type: activeTab.value
  }
}

const loadHabits = async () => {
  try {
    await habitStore.fetchEditableList(activeTab.value) // 使用activeTab变量
  } catch (error) {
    console.error('加载习惯列表失败', error)
    showToast('加载失败')
  }
}

// 切换习惯显示/隐藏状态
const toggleHabitVisibility = async (habit) => {
  try {
    await habitStore.toggleHabitVisibility(habit.id, habit.is_show)
    habit.is_show = !habit.is_show
    showToast(habit.is_show ? '显示成功' : '隐藏成功')
  } catch (error) {
    console.error('切换习惯显示状态失败', error)
    showToast('操作失败')
  }
}

// 删除习惯
const deleteHabit = async (habit) => {
  if (habit.fixed) {
    showToast('系统默认习惯不能删除')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除习惯"${habit.name}"吗？`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'danger'
    })

    await habitStore.deleteHabit(habit.id)
    showToast('删除成功')
    // 重新加载列表
    await loadHabits()
  } catch (error) {
    console.error('删除习惯失败', error)
    showToast(error || '删除失败')
  }
}

// 加载图标列表
const loadIconList = async () => {
  try {
    const response = await habitApi.getIconList()
    iconList.value = response || []
  } catch (error) {
    console.error('加载图标列表失败', error)
    showToast('加载图标失败')
  }
}

// 选择图标
const selectIcon = (icon) => {
  addForm.value.icon_id = icon.id
  addForm.value.icon = icon.icon
  showIconPicker.value = false
}

// 保存添加的习惯
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

    showToast('成功')
    showAddPopup.value = false
    addForm.value = {
      name: '',
      icon: 'star',
      type: activeTab.value
    }
    // 重新加载列表
    await loadHabits()
  } catch (error) {
    console.error('操作失败', error)
    showToast(error || '失败')
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
}

.habits-list {
  padding: 16px;
}

.habit-add {
  text-align: center;
  padding: 8px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  transition: all 0.3s ease;
}

.habit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  transition: all 0.3s ease;
}

.habit-item.hidden {
  background: var(--gray300);
  opacity: 0.6;
}


.habit-item:last-child {
  margin-bottom: 0;
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.habit-actions {
  display: flex;
  gap: 8px;
}

.habit-actions .van-button {
  min-width: 60px;
}

/* 添加弹出窗样式 */
.add-popup {
  padding: 16px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}



.popup-content {
  margin-bottom: 16px;
}

.popup-footer {
  margin-top: 16px;
}

/* 图标选择器样式 */
.icon-picker {
  padding: 16px;
}

.picker-title {
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  /* max-height: 400px; */
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}


/* 右侧图标样式 */
.van-field__right-icon svg {
  width: 30px;
  height: 20px;
}

/* 名称禁用时的样式 */
.name-disabled {
  opacity: 0.7;
}

.name-disabled .van-field__control {
  color: #999;
  font-weight: 500;
}
</style>
