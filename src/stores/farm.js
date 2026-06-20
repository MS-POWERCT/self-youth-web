  import { defineStore } from 'pinia'
  import { farmApi } from '../api/farm'

  export const useFarmStore = defineStore('farm', {
    state: () => ({
      info: null, // 使用 null 初始化，避免类型混乱
      loading: false,
    }),
    actions: {
      async fetchFarmInfo() {
        try {
          this.loading = true
          const response = await farmApi.initFarm()
          this.info = response || null
          return response
        } catch (error) {
          console.error('获取农场信息失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 获取土地信息
      async fetchLands() {
        try {
          this.loading = true
          const response = await farmApi.getLandList() || []
          this.lands = response
          return response
        } catch (error) {
          console.error('获取土地信息失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
    }
  })
