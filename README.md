# 自律青年 (Self Youth)

面向个人成长与自律管理的移动端 Web 应用，支持浏览器访问与 Capacitor 打包为 iOS / Android App。

- 线上地址：[https://m.powerct.cn](https://m.powerct.cn)
- 当前版本：`2.0.0`（见 `src/constants/app.js`）

## 功能概览

应用采用底部 Tab 导航，包含四个主模块：

| 模块     | 说明                                                              |
| -------- | ----------------------------------------------------------------- |
| **体重** | 体重记录、BMI 进度、趋势图表、身体档案                            |
| **习惯** | 打卡习惯与数值习惯、GitHub 风格贡献图、习惯编辑与统计             |
| **标记** | 合集分类浏览、条目标记（未看/已看/想看等）、5A 景区与徒步路线详情 |
| **我**   | 个人资料、活动记录、设置、版本信息                                |

其他能力：

- 多种登录方式：邮箱密码、邮箱验证码、Web3 钱包、游客模式
- 账户安全：邮箱绑定、密码设置、Web3 地址绑定
- 发现模块：动态浏览与发布（`/find`）
- 原生壳：Capacitor 8，支持 Android / iOS 打包

## 技术栈

- **框架**：Vue 3 + Vite 6
- **路由 / 状态**：Vue Router 4（Hash 模式）、Pinia
- **UI**：Vant 4、Sass、Iconify
- **网络**：Axios
- **移动端**：Capacitor 8（App、Device 等插件）
- **代码质量**：ESLint、Oxlint、Prettier

## 目录结构

```
src/
├── api/              # 接口封装（user、habit、mark、weight 等）
├── assets/           # 全局样式
├── components/       # 通用与业务组件
├── constants/        # 常量（Tab 配置、App 版本等）
├── router/           # 路由与鉴权守卫
├── stores/           # Pinia 状态
├── utils/            # 工具（请求、设备、Capacitor、Web3 等）
└── views/            # 页面
    ├── UserSettings/ # 设置、活动记录、版本信息
    ├── Finds/        # 发现相关
    └── mark/         # 标记子页面
```

## 环境变量

通过 `.env.development` / `.env.production` 配置：

| 变量               | 说明                                     |
| ------------------ | ---------------------------------------- |
| `VITE_API_URL`     | 后端 API 地址                            |
| `VITE_APP_ENV`     | 运行环境（`development` / `production`） |
| `VITE_APP_NAME`    | 应用名称（默认：自律青年）               |
| `VITE_APP_NAME_EN` | 英文名称（SelfYouth）                    |

开发环境默认 API 可在 `.env.development` 中修改；生产环境指向 `https://api.powerct.cn`。

## 本地开发

### 环境要求

- Node.js 18+
- npm

### 安装与启动

```sh
npm install
npm run dev
```

开发服务器默认监听 `http://0.0.0.0:4567`，局域网内设备可联调。

### 常用命令

```sh
# 生产构建
npm run build

# 本地预览构建结果
npm run preview

# 代码检查与格式化
npm run lint
npm run format
```

## 移动端打包（Capacitor）

应用 ID：`cn.powerct.app`，应用名：自律青年。

```sh
# 构建并同步到原生工程
npm run cap:sync

# 仅同步 Android / iOS
npm run cap:sync:android
npm run cap:sync:ios

# 打开原生 IDE
npm run cap:open:android
npm run cap:open:ios

# Android 打包
npm run package:android:debug
npm run package:android:release
npm run package:android:bundle

# 运行到 Android 设备 / 模拟器
npm run run:android
npm run run:android:device
```

## 版本管理

版本号统一维护在 `src/constants/app.js`：

```js
export const APP_VERSION = '2.0.0'
```

发版时更新该常量即可；设置页「版本信息」会读取此值。打包为原生 App 后，版本页会优先展示 Capacitor 原生版本号。

## 路由说明

- 主 Tab 路由：`/weight`、`/habits`、`/mark`、`/profile`
- 根路径 `/` 会重定向到 `/profile`，以保证底部 Tab 正常显示
- 需登录页面通过路由 `meta.requiresAuth` 与 `localStorage` 中的 `user-token` / `visitor_id` 做鉴权

## 推荐 IDE

[VS Code](https://code.visualstudio.com/) + [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 相关链接

- [Vite 配置参考](https://vite.dev/config/)
- [Vue 3 文档](https://vuejs.org/)
- [Vant 4 文档](https://vant-ui.github.io/vant/)
- [Capacitor 文档](https://capacitorjs.com/docs)
