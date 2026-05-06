// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useGlobalStore } from './stores/global'

// 导入 Vant 样式
import 'vant/lib/index.css'
import './assets/main.css'

// 导入需要的 Vant 组件
import {
  Form,
  Icon,
  Field,
  CellGroup,
  Cell,
  Button,
  Toast,
  NavBar,
  Empty,
  Image as VanImage,
  Tabbar,
  TabbarItem,
  PullRefresh,
  Uploader,
  List,
  Progress,
  Col,
  Row,
  TextEllipsis,
  ImagePreview,
  Popover,
  ActionSheet,
  CountDown,
  Tab,
  Tabs,
  Stepper,
  Popup,
  TimePicker,
  Picker,
  FloatingBubble,
  RadioGroup, Radio
} from 'vant'

async function initApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  // 注册 Vant 组件
  app.use(Form)
  app.use(Field)
  app.use(Toast)
  app.use(Button)
  app.use(NavBar)
  app.use(VanImage)
  app.use(CellGroup)
  app.use(Cell)
  app.use(Empty)
  app.use(Tabbar)
  app.use(TabbarItem)
  app.use(PullRefresh)
  app.use(Uploader)
  app.use(List)
  app.use(Progress)
  app.use(Col)
  app.use(Row)
  app.use(TextEllipsis)
  app.use(ImagePreview)
  app.use(Popover)
  app.use(ActionSheet)
  app.use(CountDown)
  app.use(Tab)
  app.use(Tabs)
  app.use(Stepper)
  app.use(Popup)
  app.use(TimePicker)
  app.use(Picker)
  app.use(Icon)
  app.use(FloatingBubble)
  app.use(RadioGroup)
  app.use(Radio)
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
}

// 调用初始化函数
initApp().catch((error) => {
  console.error('Failed to initialize app:', error)
})
