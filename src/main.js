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

// 初始化一些变量
const APP_NAME = import.meta.env.APP_NAME


// 导入 VConsole 插件
// import VConsole from 'vconsole'
// 💡 建议: 仅在开发环境启用 VConsole，生产环境应禁用
// if (import.meta.env.DEV) {
//   new VConsole()
// }
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
  Divider,
  Popup,
  Tag,
  BackTop,
  Col,
  Row,
  DropdownMenu,
  DropdownItem
} from 'vant'

// 1. 引入 Capacitor 核心和平台判断


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
  app.use(Divider)
  app.use(Popup)
  app.use(Tag)
  app.use(BackTop)
  app.use(Col)
  app.use(Row)
  app.use(DropdownMenu)
  app.use(DropdownItem)

  // 获取全局 store
  // 💡 建议: globalStore 在此处获取但未在组件中使用，需确认是否必需
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
