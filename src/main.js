// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useGlobalStore } from './stores/global'
// 导入 Vant 样式
import 'vant/lib/index.css'
import './assets/main.css'
import { Icon } from '@iconify/vue'
import { CapacitorService } from './utils/capacitor'

// 导入 VConsole 插件
import VConsole from 'vconsole'
// 初始化 VConsole
new VConsole()
// 导入需要的 Vant 组件
import {
  Icon as VanIcon,
  Form,
  Field,
  CellGroup,
  Cell,
  Button,
  Slider,
  Toast,
  NavBar,
  Empty,
  Image as VanImage,
  Lazyload,
  NumberKeyboard,
  Tabbar,
  TabbarItem,
  PullRefresh,
  Uploader,
  List,
  TextEllipsis,
  ImagePreview,
  Popover,
  ActionSheet,
  Tab,
  Tabs,
  Popup,
  Tag,
  BackTop
} from 'vant'

// 1. 引入 Capacitor 核心和平台判断
import { Capacitor } from '@capacitor/core'

async function initApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  // 注册 Iconify Icon 组件
  app.component('IconifyIcon', Icon)

  // 注册 Vant 组件
  app.use(VanIcon)
  app.use(Form)
  app.use(Field)
  app.use(Slider)
  app.use(Toast)
  app.use(Button)
  app.use(NavBar)
  app.use(VanImage)
  app.use(Lazyload)
  app.use(NumberKeyboard)
  app.use(CellGroup)
  app.use(Cell)
  app.use(Empty)
  app.use(Tabbar)
  app.use(TabbarItem)
  app.use(PullRefresh)
  app.use(Uploader)
  app.use(List)
  app.use(TextEllipsis)
  app.use(ImagePreview)
  app.use(Popover)
  app.use(ActionSheet)
  app.use(Tab)
  app.use(Tabs)
  app.use(Popup)
  app.use(Tag)
  app.use(BackTop)
  // 获取全局 store
  const globalStore = useGlobalStore()

  try {
    // 获取初始化数据
    await globalStore.fetchInitData()
    console.log('Global data fetched successfully')
  } catch (error) {
    console.error('Failed to fetch global data:', error)
    // 你可以在这里添加一些错误处理逻辑，比如显示一个错误提示
    Toast('初始化失败，请刷新页面重试')
  }

  // 挂载应用
  app.mount('#app')

  // 初始化 Capacitor 服务
  CapacitorService.setupBackButtonListener()
}

// 调用初始化函数
initApp().catch((error) => {
  console.error('Failed to initialize app:', error)
})
