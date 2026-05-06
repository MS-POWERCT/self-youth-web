// src/stores/global.js
import { defineStore } from 'pinia'
import { globalApi } from '../api/global'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    initData: null,
    isLoading: false,
  }),
  actions: {
    async fetchInitData() {
      this.isLoading = true
      try {
        const response = await globalApi.getInitData()
        this.initData = response
      } catch (error) {
        console.error('Failed to fetch init data:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
