import { defineStore } from 'pinia'
import { userApi } from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    allWallet: JSON.parse(localStorage.getItem('allWallet')) || null,
    token: localStorage.getItem('user-token') || null,
    user_sign: null,
    nonce: null,
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
    setNonce(nonce) {
      this.nonce = nonce
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
    logout() {
      this.user = null
      this.token = null
      this.user_sign = null
      localStorage.removeItem('user-token')
    },
    async web3Sign() {
      try {
        const nonceResult = await userApi.web3Sign()
        this.setNonce(nonceResult)
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
  },
})
