import { defineStore } from 'pinia'
import { userApi } from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 💡 建议: 初始化时直接读取 localStorage 可能导致 SSR/SSG 问题
    // 💡       建议在 onMounted 或 pinia 插件中初始化
    user: JSON.parse(localStorage.getItem('user')) || null,
    allWallet: JSON.parse(localStorage.getItem('allWallet')) || null,
    token: localStorage.getItem('user-token') || null,
    user_sign: null,
    web3_nonce: localStorage.getItem('web3_nonce') || null
  }),
  actions: {
    setUser(userData) {
      this.user = userData
      localStorage.setItem('user', JSON.stringify(userData))
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('user-token', token)
    },
    setWeb3Nonce(web3Nonce) {
      // 💡 建议: nonce 可能需要区分是原始响应还是 data.nonce，建议统一存储结构
      this.web3_nonce = web3Nonce
      localStorage.setItem('web3_nonce', web3Nonce)
    },
    async login(credentials) {
      try {
        // 获取当前是本地还是线上
        const response = await userApi.login(credentials)
        this.setToken(response.access_token)
        this.getUserInfo()
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },
    async loginEmail(credentials) {
      try {
        const response = await userApi.loginEmail(credentials)
        this.setToken(response.access_token)
        this.getUserInfo()
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },
    async loginVisitor(credentials) {
      try {
        const response = await userApi.loginVisitor(credentials)
        this.setToken(response.access_token)
        this.getUserInfo()
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        const user = await userApi.getUserInfo()
        this.setUser(user)
      } catch (error) {
        console.error('getUserInfo failed', error)
        throw error
      }
    },
    async web3Sign() {
      try {
        const nonceResult = await userApi.web3Sign()
        this.setWeb3Nonce(nonceResult)
      } catch (error) {
        console.error('web3Sign failed', error)
        throw error
      }
    },
    async web3Login(data) {
      try {
        const response =  await userApi.web3Login(data)
        this.setToken(response.access_token)
        this.getUserInfo()
      } catch (error) {
        console.error('web3Login failed', error)
        throw error
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.user_sign = null
      this.web3_nonce = null
      localStorage.removeItem('user-token')
      localStorage.removeItem('user')
      localStorage.removeItem('web3_nonce')
    },
  },
})
