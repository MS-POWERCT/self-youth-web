// src/stores/global.js
import { defineStore } from 'pinia'
import { globalApi } from '../api/global'
import { APP_VERSION } from '@/constants/app'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    initData: JSON.parse(localStorage.getItem('initData')) || null,
    isLoading: false,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    API_URL: import.meta.env.VITE_API_URL,
    APP_ENV: import.meta.env.VITE_APP_ENV,
    APP_VERSION,
    FARM_NAME: '修仙农场'
  }),
  actions: {
    async fetchInitData() {
      this.isLoading = true
      try {
        const response = await globalApi.getInitData()
        this.initData = response
        // 永久存储初始化数据
        localStorage.setItem('initData', JSON.stringify(response))
      } catch (error) {
        console.error('Failed to fetch init data:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
