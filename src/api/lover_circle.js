// src/api/global.js
import request from '../utils/request'

export const loverCircleApi = {
  create(data) {
    return request({
      url: '/api/loverCircle/create',
      method: 'post',
      data,
    })
  },
  getList(data) {
    return request({
      url: '/api/loverCircle/getList',
      method: 'post',
      data,
    })
  },
  userClick(data) {
    return request({
      url: '/api/loverCircle/userClick',
      method: 'post',
      data,
    })
  },
  delData(data) {
    return request({
      url: '/api/loverCircle/delData',
      method: 'post',
      data,
    })
  },

  commentCreate(data) {
    return request({
      url: '/api/loverComment/create',
      method: 'post',
      data,
    })
  },
  commentGetList(data) {
    return request({
      url: '/api/loverComment/getList',
      method: 'post',
      data,
    })
  },
  commentDelData(data) {
    return request({
      url: '/api/loverComment/delData',
      method: 'post',
      data,
    })
  },
}
