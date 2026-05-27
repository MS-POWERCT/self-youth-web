import { defineStore } from 'pinia'
import { markApi } from '../api/mark'

export const useMarkStore = defineStore('mark', {
  state: () => ({
    categoryList: [],
    moduleList: [],
    itemList: [],
    activeCategoryId: 0,
    loading: false
  }),
  actions: {
    async fetchCategoryList() {
      try {
        this.loading = true
        const response = await markApi.getCategoryList()
        this.categoryList = response || []
        return response
      } catch (error) {
        console.error('获取分类列表失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchModuleList(categoryId) {
      try {
        this.loading = true
        const response = await markApi.getModuleList(categoryId)
        this.moduleList = response || []
        this.activeCategoryId = categoryId
        return response
      } catch (error) {
        console.error('获取模块列表失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchItemList(moduleId) {
      try {
        this.loading = true
        const response = await markApi.getItemList(moduleId)
        this.itemList = response || []
        return response
      } catch (error) {
        console.error('获取项目列表失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAllItemsByCategory(categoryId) {
      try {
        this.loading = true
        await this.fetchModuleList(categoryId)

        const allItems = []
        for (const module of this.moduleList) {
          const response = await markApi.getItemList(module.id)
          if (response && Array.isArray(response)) {
            allItems.push(...response.map(item => ({
              ...item,
              module_id: module.id
            })))
          }
        }
        this.itemList = allItems
        return allItems
      } catch (error) {
        console.error('获取分类下所有项目失败', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearModuleList() {
      this.moduleList = []
      this.itemList = []
    },

    clearAll() {
      this.categoryList = []
      this.moduleList = []
      this.itemList = []
      this.activeCategoryId = null
    }
  }
})
