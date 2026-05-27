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
      url: '/api/mark/getModuleList',
      method: 'get',
      params: {
        category_id: categoryId,
      }
    })
  },

  // /api/mark/getItemList?module_id=1
  getItemList(moduleId) {
    return request({
      url: '/api/mark/getItemList',
      method: 'get',
      params: {
        module_id: moduleId,
      }
    })
  },
  // 进行标记
  markItem(itemId, markType) {
    return request({
      url: '/api/mark/markItem',
      method: 'post',
      data: {
        item_id: itemId,
        mark_type: markType,
      }
    })
  },
}
