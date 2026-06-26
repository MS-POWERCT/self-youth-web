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

// 导入 IconFont 组件
import IconFont from './components/IconFont.vue'

// 引入 iconfont.cn Symbol 方式的 JS 文件
// 步骤：
// 1. 在 iconfont.cn 创建项目并添加图标
// 2. 选择 Symbol 方式，生成在线链接
// 3. 将链接粘贴到下方（去掉 https: 前缀，保留 //at.alicdn.com/...）
// 示例：import '//at.alicdn.com/t/font_xxxxx.js'
// 或者下载到本地，放在 public 或 assets 目录中
// import './assets/iconfont/iconfont.js'
// ⚠️ 请在下方添加你的 iconfont Symbol JS 文件引入：


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
  DropdownItem,
  CountDown,
} from 'vant'

// 1. 引入 Capacitor 核心和平台判断


async function initApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  // 注册 Iconify Icon 组件
  app.component('IconifyIcon', Icon)

  // 注册 IconFont 组件（用于 iconfont.cn Symbol 方式）
  app.component('IconFont', IconFont)

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
  app.use(CountDown)



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
