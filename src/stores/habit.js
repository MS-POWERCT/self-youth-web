import { defineStore } from 'pinia'
import { habitApi } from '../api/habit'

export const useHabitStore = defineStore('habit', {
  state: () => ({
    habits: [],
    editableHabits: [],
    todayChecks: [],
    valueRecords: [],
    statsRecords: [],
    loading: false
  }),
  actions: {
    // 获取习惯列表
    async fetchHabits(type) {
      try {
        this.loading = true
        const response = await habitApi.getList(type)
        this.habits = response || []
        return response
      } catch (error) {
        console.error('获取习惯列表失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    // 获取编辑习惯列表
    async fetchEditableList(type){
      try {
        this.loading = true
        const response = await habitApi.getEditableList(type)
        this.editableHabits = response || []
        return response
      } catch (error) {
        console.error('获取习惯列表失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    // 创建习惯
    async createHabit(name, type, icon) {
      try {
        await habitApi.create(name, type, icon)
        // 重新获取习惯列表
        await this.fetchHabits(type)
      } catch (error) {
        console.error('创建习惯失败', error)
        throw error
      }
    },
    // 编辑习惯
    async editHabit(name, type, icon) {
      try {
        await habitApi.edit(name, type, icon)
        // 重新获取习惯列表
        await this.fetchHabits(type)
      } catch (error) {
        console.error('编辑习惯失败', error)
        throw error
      }
    },
    // 显示/隐藏习惯
    async toggleHabitVisibility(id, isShow) {
      try {
        await habitApi.hide(id, isShow)
        // 更新本地状态
        const habit = this.habits.find(h => h.id === id)
        if (habit) {
          habit.is_show = isShow
        }
      } catch (error) {
        console.error('切换习惯显示状态失败', error)
        throw error
      }
    },

    // 删除习惯
    async deleteHabit(id) {
      try {
        await habitApi.delete(id)
        // 从本地状态中移除
        this.habits = this.habits.filter(h => h.id !== id)
      } catch (error) {
        console.error('删除习惯失败', error)
        throw error
      }
    },

    // 获取今日打卡记录
    async fetchTodayChecks() {
      try {
        const response = await habitApi.getTodayChecks()
        this.todayChecks = response || []
        return response
      } catch (error) {
        console.error('获取今日打卡记录失败', error)
        throw error
      }
    },

    // 切换打卡状态
    async toggleCheck(id) {
      try {
        await habitApi.toggleCheck(id)
        // 重新获取今日打卡记录
        await this.fetchTodayChecks()
      } catch (error) {
        console.error('切换打卡状态失败', error)
        throw error
      }
    },

    // 创建数值记录
    async createValueRecord(habitId, value, recordStartTime, note, noteImage) {
      try {
        await habitApi.createValue(habitId, value, recordStartTime, note, noteImage)
        // 重新获取数值记录列表
        await this.fetchValueRecords()
      } catch (error) {
        console.error('创建数值记录失败', error)
        throw error
      }
    },

    // 编辑数值记录
    async editValueRecord(id, value, recordStartTime, note, noteImage) {
      try {
         // 获取当前日期
        await habitApi.editValue(id, value, recordStartTime, note, noteImage)
        // 更新本地状态
        // const record = this.valueRecords.find(r => r.id === id)
        // if (record) {
        //   record.value = value
        //   record.record_start_time = recordStartTime
        // }
      } catch (error) {
        console.error('编辑数值记录失败', error)
        throw error
      }
    },


    // 删除数值记录
    async deleteValueRecord(id) {
      try {
        await habitApi.deleteValue(id)
        // 从本地状态中移除，由于有双重列表，所以这个就不需要了
        // this.valueRecords = this.valueRecords.filter(r => r.id !== id)
      } catch (error) {
        console.error('删除数值记录失败', error)
        throw error
      }
    },

    // 获取数值记录列表
    async fetchValueRecords(lastDate) {
      try {
        const response = await habitApi.getValueList(lastDate)
        console.log('获取数值记录列表', response)
        this.valueRecords = response || []
        return response
      } catch (error) {
        console.error('获取数值记录列表失败', error)
        throw error
      }
    },
    // getCheckStats
    async checkStatsRecords(){
      try {
        const response = await habitApi.getCheckStats()
        this.statsRecords = response || []
        return response
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  }
})
