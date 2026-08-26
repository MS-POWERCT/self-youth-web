import request from '../utils/request'

export const weightApi = {
  create(data) {
    return request({
      url: '/api/weightRecord/create',
      method: 'post',
      data,
    })
  },
  getList(data) {
    return request({
      url: '/api/weightRecord/getList',
      method: 'post',
      data,
    })
  },
  getDetail(data) {
    return request({
      url: '/api/weightRecord/getDetail',
      method: 'post',
      data,
    })
  },
  edit(data) {
    return request({
      url: '/api/weightRecord/edit',
      method: 'post',
      data,
    })
  },
  delete(data) {
    return request({
      url: '/api/weightRecord/del',
      method: 'post',
      data,
    })
  },
  stats() {
    return request({
      url: '/api/weightRecord/stats',
      method: 'get',
    })
  },
  chart(days) {
    const params = days ? { days } : {}
    return request({
      url: '/api/weightRecord/chart',
      method: 'get',
      params,
    })
  },
}
