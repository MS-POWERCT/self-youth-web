import request from '../utils/request'

export const userApi = {
  login(data) {
    data.username = data.email
    data.grant_type = 'password'
    data.client_id = 2
    data.client_secret = 'KKWGGWJ50O8Q5wxVXcw2rjEcJgwC5Ioy9xhaRGmL'
    return request({
      url: '/oauth/token',
      method: 'post',
      data,
    })
  },
  loginEmail(data) {
    return request({
      url: '/api/auth/email/loginEmail',
      method: 'post',
      data,
    })
  },
  loginVisitor(data) {
    return request({
      url: '/api/auth/visitor/loginVisitor',
      method: 'post',
      data,
    })
  },
  // 签名接口
  web3Sign(){
    return request({
      url: '/api/web3/signature',
      method: 'get'
    })
  },
  // 地址登录
  web3Login(data) {
    return request({
      url: '/api/web3/login',
      method: 'post',
      data,
    })
  },

  getUserInfo() {
    return request({
      url: '/api/my/getMyInfo',
      method: 'post',
    })
  },
  getTest() {
    return request({
      url: '/getTest',
      method: 'get',
    })
  },
}
