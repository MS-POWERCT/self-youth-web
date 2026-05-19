<template>
  <div class="habit-edit-page" :class="$attrs.class">
    <van-nav-bar
      :title="activeTab == 1 ? '打卡习惯' : '数值习惯'"
      left-arrow
      @click-left="$router.go(-1)"
    />
    <!-- 习惯列表 -->
    <div class="habits-list">
      <div class="habit-add" @click="showPopup()"> + </div>
      <div
        v-for="habit in editableHabits"
        :key="habit.id"
        class="habit-item"
        :class="{ hidden: !habit.is_show }"
      >
        <div class="habit-info">
           <svg class="icon" aria-hidden="true">
                <use :xlink:href="'#' + habit.icon" />
              </svg>
          <span>{{ habit.name }}</span>
          <van-tag v-if="habit.fixed" type="warning" size="small">系统默认</van-tag>
        </div>
        <div class="habit-actions">
          <van-button
            size="mini"
            type="danger"
            plain
            @click="showPopup(habit)"
          >
            编辑
          </van-button>
          <van-button
            size="mini"
            :type="habit.is_show ? 'default' : 'primary'"
            plain
            @click="toggleHabitVisibility(habit)"
          >
            {{ habit.is_show ? '隐藏' : '显示' }}
          </van-button>
          <van-button
            v-if="!habit.fixed"
            size="mini"
            type="danger"
            plain
            @click="deleteHabit(habit)"
          >
            删除
          </van-button>
        </div>
      </div>
    </div>

  </div>
    <!-- 添加习惯弹出窗 -->
    <van-popup
      v-model:show="showAddPopup"
      position="bottom"
      :style="{ height: '50%' }"
      round
      @click-overlay="closePopup"
    >
      <div class="add-popup">
        <div class="popup-content">
          <van-field
            v-model="addForm.name"
            label="习惯名称"
            placeholder="请输入习惯名称"
            maxlength="20"
            show-word-limit
          />

          <van-field
            v-model="addForm.icon"
            label="图标"
            placeholder="选择图标"
            readonly
            @click="showIconPicker = true"
          >
            <template #right-icon>
              <svg class="icon" aria-hidden="true">
                <use :xlink:href="'#' + addForm.icon" />
              </svg>
            </template>
          </van-field>
        </div>
        <div class="popup-footer">
          <van-button
            type="primary"
            block
            @click="saveAddHabit"
            :loading="adding"
          >
            {{ showAddPopupButtonName }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 图标选择器 -->
    <van-popup
      v-model:show="showIconPicker"
      position="bottom"
      :style="{ height: '50%' }"
    >
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
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="'#' + icon.icon" />
            </svg>
            <span>{{ icon.name }}</span>
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


// 弹窗相关
const showAddPopup = ref(false)
const showAddPopupType = ref('')
const showAddPopupButtonName = ref('')
const showIconPicker = ref(false)
const adding = ref(false)
const addForm = ref({
  name: '',
  icon: 'icon-jianshen',
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
    if(habit){
      addForm.value = {
        name: habit.name,
        icon: habit.icon,
        type: habit.type.toString()
      }
    }
}
const closePopup = async () =>{
   addForm.value = {
      name: '',
      icon: 'star',
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
  addForm.value.icon = icon.icon
  showIconPicker.value = false
}

// 保存添加的习惯
const saveAddHabit = async () => {
  if (!addForm.value.name.trim()) {
    showToast('请输入习惯名称')
    return
  }

  try {
    adding.value = true

    if(showAddPopupType.value == 'add'){
      await habitStore.createHabit(addForm.value.name, addForm.value.type, addForm.value.icon)
    }else{
      await habitStore.editHabit(addForm.value.name, addForm.value.type, addForm.value.icon)
    }

    showToast('添加成功')
    showAddPopup.value = false
    addForm.value = {
      name: '',
      icon: 'star',
      type: activeTab.value
    }
    // 重新加载列表
    await loadHabits()
  } catch (error) {
    console.error('添加习惯失败', error)
    showToast(error || '添加失败')
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
  background: #f7f8fa;
  min-height: 100vh;
}
.habits-list {
  padding: 16px;
}

.habit-add {
  text-align: center;
  padding: 8px;
  margin-bottom: 12px;
  background: white;
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
  background: white;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  transition: all 0.3s ease;
}

.habit-item.hidden {
  background: #f5f5f5;
  opacity: 0.6;
}

.habit-item.hidden .habit-info {
  color: #c8c9cc;
}

.habit-item.hidden .van-icon {
  color: #c8c9cc !important;
}

.habit-item:last-child {
  margin-bottom: 0;
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.habit-info span {
  font-size: 14px;
  color: #323233;
}

.habit-actions {
  display: flex;
  gap: 8px;
}

.habit-actions .van-button {
  min-width: 60px;
  font-size: 12px;
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

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
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
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  color: #323233;
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

.icon-item:hover {
  border-color: #1989fa;
  background: #f0f9ff;
}

.icon-item.active {
  border-color: #1989fa;
  background: #e6f7ff;
}

.icon-item svg {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.icon-item span {
  font-size: 10px;
  color: #646566;
  text-align: center;
}

/* 右侧图标样式 */
.van-field__right-icon svg {
  width: 20px;
  height: 20px;
}
</style>
