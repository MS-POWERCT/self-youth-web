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
