import { defineStore } from 'pinia'
import { weightApi } from '../api/weight'
import { genderFromUser } from '../utils/weight'

const DISPLAY_UNIT_KEY = 'weight-display-unit'

const defaultBodyProfile = () => ({
  height: '',
  age: '',
  gender: 1,
})

export const useWeightStore = defineStore('weight', {
  state: () => ({
    stats: null,
    chart: null,
    records: [],
    bodyProfile: defaultBodyProfile(),
    displayUnit: 'kg',
    loading: false,
    saving: false,
    page: 0,
    size: 20,
  }),
  actions: {
    syncBodyProfileFromUser(user) {
      if (!user) {
        this.bodyProfile = defaultBodyProfile()
        return
      }

      this.bodyProfile = {
        height: user.height ? String(user.height) : '',
        age: user.age ? String(user.age) : '',
        gender: genderFromUser(user.gender),
      }
    },

    loadDisplayUnit() {
      const saved = localStorage.getItem(DISPLAY_UNIT_KEY)
      if (saved === 'kg' || saved === 'jin') {
        this.displayUnit = saved
      }
    },

    toggleDisplayUnit() {
      this.displayUnit = this.displayUnit === 'kg' ? 'jin' : 'kg'
      localStorage.setItem(DISPLAY_UNIT_KEY, this.displayUnit)
    },

    async fetchStats() {
      const response = await weightApi.stats()
      this.stats = response || null
      return response
    },

    async fetchChart(days = 90) {
      const response = await weightApi.chart(days)
      this.chart = response || null
      return response
    },

    async fetchRecords(page = 0) {
      const response = await weightApi.getList({
        page,
        size: this.size,
      })
      this.records = response?.list || []
      this.page = response?.page ?? page
      return response
    },

    async fetchAll() {
      try {
        this.loading = true
        await Promise.all([this.fetchStats(), this.fetchChart(), this.fetchRecords()])
      } catch (error) {
        console.error('获取体重数据失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRecord(weight, recordedAt, note, unit = 'kg') {
      try {
        this.saving = true
        await weightApi.create({
          weight,
          recorded_at: recordedAt,
          note,
          unit,
        })
        await this.fetchAll()
      } catch (error) {
        console.error('创建体重记录失败', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async editRecord(id, weight, recordedAt, note, unit = 'kg') {
      try {
        this.saving = true
        await weightApi.edit({
          id,
          weight,
          recorded_at: recordedAt,
          note,
          unit,
        })
        await this.fetchAll()
      } catch (error) {
        console.error('编辑体重记录失败', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteRecord(id) {
      try {
        this.saving = true
        await weightApi.delete({ id })
        await this.fetchAll()
      } catch (error) {
        console.error('删除体重记录失败', error)
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
