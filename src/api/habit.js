// src/api/habit.js
import request from '../utils/request'

export const habitApi = {
  // 获取习惯列表
  getList(type) {
    return request({
      url: '/api/habit/getList',
      method: 'post',
      data: {
        type
      }
    })
  },
// 获取编辑习惯列表
  getEditableList(type) {
    return request({
      url: '/api/habit/getEditableList',
      method: 'post',
       data: {
        type
      }
    })
  },
  // 获取可以选择的icon
  getIconList(){
    return request({
      url: '/api/habit/getIconList',
      method: 'get',
    })
  },
  // 新增习惯
  create(name, type, icon) {
    return request({
      url: '/api/habit/create',
      method: 'post',
      data: {
        name,
        type,
        icon
      }
    })
  },
  // 编辑习惯
  edit(name, type, icon) {
    return request({
      url: '/api/habit/edit',
      method: 'post',
      data: {
        name,
        type,
        icon
      }
    })
  },

  // 显示/隐藏习惯
  hide(id, isShow) {
    return request({
      url: '/api/habit/hide',
      method: 'post',
      data: {
        id,
        is_show: !isShow ? 1 : 0
      }
    })
  },

  // 删除习惯
  delete(id) {
    return request({
      url: '/api/habit/delete',
      method: 'post',
      data: {
        id
      }
    })
  },

  // 获取打卡统计数据（最近1年）
  getCheckStats() {
    return request({
      url: '/api/habit/stat',
      method: 'get',
    })
  },

  // 今日打卡/取消打卡
  toggleCheck(id) {
    return request({
      url: '/api/habit/check/toggle',
      method: 'post',
      data: {
        id
      }
    })
  },

  // 获取今日打卡记录
  getTodayChecks() {
    return request({
      url: '/api/habit/check/today',
      method: 'get'
    })
  },


  // 新增数值记录
  createValue(habitId, value, recordStartTime, note, noteImage) {
    return request({
      url: '/api/habit/value/create',
      method: 'post',
      data: {
        habit_id: habitId,
        value,
        record_start_time: recordStartTime,
        note,
        note_image: noteImage
      }
    })
  },

  // 删除数值记录
  deleteValue(id) {
    return request({
      url: '/api/habit/value/del',
      method: 'post',
      data: {
        id
      }
    })
  },

  // 编辑数值记录
  editValue(id, value, recordStartTime) {
    return request({
      url: '/api/habit/value/edit',
      method: 'post',
      data: {
        id,
        value,
        record_start_time: recordStartTime
      }
    })
  },

  // 获取数值记录列表
  getValueList(lastDate) {
    // 如果lastDate为空就不传参数
    const params = lastDate ? { last_date: lastDate } : {}
    return request({
      url: '/api/habit/value/list',
      method: 'get',
      params: params
    })
  },
}
