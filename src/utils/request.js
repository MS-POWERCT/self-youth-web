// src/utils/request.js

import axios from 'axios'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '../stores/user'
import { deviceType } from './device'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    if(deviceType) {
      config.headers['device_type'] = deviceType
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)
// 响应拦截器
service.interceptors.response.use(
  (response) => {

    const res = response.data
    // 检查res是否为对象
    if (typeof res !== 'object' || res === null) {
      return res
    }

    if ('res_code' in res) {
      if (res.res_code !== 0) {
        showToast(res.res_msg || 'Error')
        return Promise.reject(res.res_msg || 'Error')
      } else {
        return res.data
      }
    } else {
      return res
    }
  },
  (error) => {
    // 如果是401错误，弹出提示框并跳转到登录页面
    if (error.response && error.response.status === 401) {
      showDialog({
        title: '会话已过期',
        message: '请重新登录',
      }).then(() => {
        const userStore = useUserStore()
        userStore.logout()
        window.location.reload()
      })
    } else if (error.response && error.response.status === 429) {
      showToast('请求过于频繁，请稍后再试')
    }else{
      console.error('Response error:', error)
      showToast(error.message || 'Request failed')
      return Promise.reject(error)
    }
  },
)

export default service
