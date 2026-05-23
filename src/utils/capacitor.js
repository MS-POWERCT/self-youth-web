import { App } from '@capacitor/app'
import { Toast } from 'vant'

/**
 * Capacitor 应用工具类
 */
export const CapacitorService = {
  /**
   * 监听返回按钮事件（Android）
   */
  setupBackButtonListener() {
    // 仅在移动设备上运行
    if (!this.isMobile()) return

    App.addListener('backButton', async () => {
      try {
        const { canGoBack } = await App.canGoBack()
        if (canGoBack) {
          // 如果可以返回上一页，执行返回
          window.history.back()
        } else {
          // 如果已经是首页，显示退出确认
          this.showExitConfirm()
        }
      } catch (error) {
        console.error('Back button error:', error)
      }
    })
  },

  /**
   * 显示退出确认提示
   */
  async showExitConfirm() {
    // 使用 Vant 的 ActionSheet 组件
    const { ActionSheet } = await import('vant')
    
    ActionSheet.show({
      title: '确定要退出应用吗？',
      actions: [
        { name: '取消', style: 'default' },
        { name: '退出应用', style: 'danger' }
      ],
      cancelText: '',
      async onSelect(action) {
        if (action.style === 'danger') {
          // 退出应用
          await CapacitorService.exitApp()
        }
      }
    })
  },

  /**
   * 退出应用
   */
  async exitApp() {
    try {
      await App.exitApp()
    } catch (error) {
      console.error('Exit app error:', error)
    }
  },

  /**
   * 检查是否为移动设备
   */
  isMobile() {
    const userAgent = navigator.userAgent.toLowerCase()
    return /android|iphone|ipad|ipod/.test(userAgent)
  },

  /**
   * 获取应用信息
   */
  async getAppInfo() {
    try {
      const info = await App.getInfo()
      return info
    } catch (error) {
      console.error('Get app info error:', error)
      return null
    }
  },

  /**
   * 获取应用状态
   */
  async getState() {
    try {
      const state = await App.getState()
      return state
    } catch (error) {
      console.error('Get app state error:', error)
      return null
    }
  }
}

export default CapacitorService
