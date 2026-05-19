// src/api/habit.js
import request from '../utils/request'

export const markApi = {
  // 获取标记列表
  getCategoryList() {
    return request({
      url: '/api/mark/getCategoryList',
      method: 'get',
    })
  },

  // /api/mark/getMoudlueList?category_id=1
  getModuleList(categoryId) {
    return request({
      url: `/api/mark/getModuleList?category_id=${categoryId}`,
      method: 'get',
    })
  },

  // /api/mark/getItemList?module_id=1
  getItemList(moduleId) {
    return request({
      url: `/api/mark/getItemList?module_id=${moduleId}`,
      method: 'get',
    })
  },
  // 进行标记
  markItem(itemId, markType) {
    return request({
      url: `/api/mark/markItem`,
      method: 'post',
      data: {
        item_id: itemId,
        mark_type: markType,
      }
    })
  },
}
