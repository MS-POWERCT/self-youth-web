<template>
  <div class="settings-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="设置" left-arrow @click-left="$router.go(-1)" class="nav-bar" />

    <div class="settings-content">
      <!-- 登录管理部分 -->
      <div class="section">
        <div class="section-header">
          <IconifyIcon icon="streamline-stickies-color:shield-check" width="20" class="section-icon" />
          <span class="section-title">账户安全</span>
        </div>

        <div class="section-body">
          <!-- 邮箱 -->
          <div class="setting-item" @click="showEmailPopup = true">
            <div class="item-left">
              <div class="item-icon email-icon">
                <IconifyIcon icon="streamline-stickies-color:mail-duo" width="22" />
              </div>
              <div class="item-info">
                <div class="item-label">邮箱</div>
                <div class="item-hint">{{ user?.email ? '已绑定邮箱' : '绑定邮箱以提升账户安全性' }}</div>
              </div>
            </div>
            <div class="item-right">
              <span v-if="user?.email" class="item-value">{{ user?.email }}</span>
              <span v-else class="item-action">绑定</span>
              <IconifyIcon icon="streamline-stickies-color:arrow-right-2" width="16" class="arrow-icon" />
            </div>
          </div>

          <!-- 密码 -->
          <div class="setting-item" :class="{ 'disabled': !user?.email }" @click="handlePasswordClick">
            <div class="item-left">
              <div class="item-icon password-icon">
                <IconifyIcon icon="streamline-stickies-color:passport" width="22" />
              </div>
              <div class="item-info">
                <div class="item-label">密码</div>
                <div class="item-hint">{{ user?.has_password ? '密码强度：强' : '设置密码保护账户' }}</div>
              </div>
            </div>
            <div class="item-right">
              <span v-if="user?.has_password" class="item-value status-done">已设置</span>
              <span v-else-if="user?.email" class="item-action">设置</span>
              <span v-else class="item-disabled">请先绑定邮箱</span>
              <IconifyIcon v-if="user?.email" icon="streamline-stickies-color:arrow-right-2" width="16"
                class="arrow-icon" />
            </div>
          </div>

          <!-- Web3钱包 -->
          <div class="setting-item" @click="showWeb3Popup = true">
            <div class="item-left">
              <div class="item-icon web3-icon">
                <IconifyIcon icon="streamline-stickies-color:nuclear-2-duo" width="22" />
              </div>
              <div class="item-info">
                <div class="item-label">Web3钱包</div>
                <div class="item-hint">{{ user?.address ? '已绑定钱包地址' : '绑定钱包享受Web3服务' }}</div>
              </div>
            </div>
            <div class="item-right">
              <span v-if="user?.address" class="item-value">{{ formatAddress(user?.address) }}</span>
              <span v-else class="item-action">绑定</span>
              <IconifyIcon icon="streamline-stickies-color:arrow-right-2" width="16" class="arrow-icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设置部分 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">其他设置</span>
        </div>

        <div class="section-body">
          <!-- 测试组件 -->
          <div v-if="globalStore.APP_ENV === 'development'" class="setting-item"
            @click="$router.push('/demo/test-tool')">
            <div class="item-left">
              <div class="item-info">
                <div class="item-label">测试组件</div>
              </div>
            </div>
            <IconifyIcon icon="streamline-stickies-color:arrow-right-2" width="16" class="arrow-icon" />
          </div>

          <!-- 退出登录 -->
          <div class="setting-item logout-item" @click="handleLogout">
            <div class="item-left">
              <div class="item-info">
                <div class="item-label">退出登录</div>
              </div>
            </div>
            <IconifyIcon icon="streamline-stickies-color:arrow-right-2" width="16" class="arrow-icon" />
          </div>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="version-info">
        <span class="version-text">版本 {{ globalStore.APP_VERSION }}</span>
      </div>
    </div>

    <!-- 邮箱绑定弹窗 -->
    <van-popup v-model:show="showEmailPopup" position="center" :style="{ width: '90%', height: '70%' }" round closeable>
      <div class="popup-container">
        <div class="popup-header">
          <div class="popup-icon email-bg">
            <IconifyIcon icon="streamline-stickies-color:mail-duo" width="32" />
          </div>
          <h3 class="popup-title">绑定邮箱</h3>
          <p class="popup-desc">绑定邮箱后可用于找回密码、接收重要通知</p>
        </div>

        <div class="popup-body">
          <van-field v-model="emailForm.email" label="邮箱地址" placeholder="请输入邮箱地址" class="field-item" />
          <van-field v-model="emailForm.code" label="验证码" placeholder="请输入验证码" class="field-item">
            <template #button>
              <span :class="{ 'disabled': emailCountdown > 0 || !emailForm.email }" @click="sendEmailCode"
                class="code-btn">
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '发送' }}
              </span>
            </template>
          </van-field>
        </div>

        <div class="popup-footer">
          <van-button type="primary" block round :loading="emailLoading" @click="handleBindEmail" class="submit-btn">
            确认绑定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 密码设置弹窗 -->
    <van-popup v-model:show="showPasswordPopup" position="center" :style="{ width: '90%', height: '70%' }" round
      closeable>
      <div class="popup-container">
        <div class="popup-header">
          <div class="popup-icon password-bg">
            <IconifyIcon icon="streamline-stickies-color:passport" width="32" />
          </div>
          <h3 class="popup-title">设置密码</h3>
          <p class="popup-desc">{{ user?.email }} 将收到验证码</p>
        </div>

        <div class="popup-body">
          <van-field v-model="passwordForm.code" label="验证码" placeholder="请输入验证码" class="field-item">
            <template #button>
              <span :class="{ 'disabled': passwordCountdown > 0 }" @click="sendPasswordCode" class="code-btn">
                {{ passwordCountdown > 0 ? `${passwordCountdown}s` : '发送' }}
              </span>
            </template>
          </van-field>
          <van-field v-model="passwordForm.password" type="password" label="新密码" placeholder="请输入6位以上密码"
            class="field-item" />
          <van-field v-model="passwordForm.password_confirmation" type="password" label="确认密码" placeholder="请再次输入密码"
            class="field-item" />
        </div>

        <div class="popup-footer">
          <van-button type="primary" block round :loading="passwordLoading" @click="handleSetPassword"
            class="submit-btn">
            确认设置
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- Web3地址绑定弹窗 -->
    <van-popup v-model:show="showWeb3Popup" position="center" :style="{ width: '90%', height: '70%' }" round closeable>
      <div class="popup-container">
        <div class="popup-header">
          <div class="popup-icon web3-bg">
            <IconifyIcon icon="streamline-stickies-color:nuclear-2-duo" width="32" />
          </div>
          <h3 class="popup-title">绑定Web3钱包</h3>
          <p class="popup-desc">连接您的钱包以使用Web3功能</p>
        </div>

        <div class="popup-body web3-body">
          <div v-if="!web3Address" class="connect-section">
            <div class="connect-icon">
              <IconifyIcon icon="streamline-stickies-color:nuclear-2-duo" width="64" />
            </div>
            <p class="connect-text">使用 Web3 钱包进行身份验证</p>
            <p class="connect-hint">连接您的钱包即可完成绑定</p>
            <van-button type="primary" block round :loading="web3Connecting" @click="handleConnectWallet"
              class="connect-btn">
              {{ web3Connecting ? '连接中...' : '连接钱包' }}
            </van-button>
          </div>

          <div v-else class="connected-section">
            <div class="wallet-card">
              <van-tag type="success" size="large" class="wallet-tag">
                {{ web3WalletName }}
              </van-tag>
              <span class="wallet-address">{{ web3Address }}</span>
            </div>
            <van-button type="primary" block round :loading="web3Binding" @click="handleBindWeb3" class="submit-btn">
              {{ web3Binding ? '绑定中...' : '确认绑定' }}
            </van-button>
            <van-button plain type="primary" block round class="change-btn" @click="handleDisconnectWallet">
              更换钱包
            </van-button>
          </div>
        </div>

        <div v-if="web3Error" class="popup-error">
          <div class="error-text">{{ web3Error }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'
import { userApi } from '@/api/user'
import { globalApi } from '@/api/global'
import { connectWallet, getCurrentAccount, signMessage, formatAddress } from '@/utils/web3'

const userStore = useUserStore()
const globalStore = useGlobalStore()
const user = computed(() => userStore.user)

// 弹窗状态
const showEmailPopup = ref(false)
const showPasswordPopup = ref(false)
const showWeb3Popup = ref(false)

// 邮箱绑定
const emailForm = ref({ email: '', code: '' })
const emailCountdown = ref(0)
const emailLoading = ref(false)

async function sendEmailCode() {
  if (!emailForm.value.email) {
    showFailToast('请输入邮箱地址')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.value.email)) {
    showFailToast('请输入正确的邮箱格式')
    return
  }

  try {
    await globalApi.sendCode({ email: emailForm.value.email, category: 'bind_email' })
    showToast({ message: '验证码已发送', position: 'bottom' })
    emailCountdown.value = globalStore.initData.llconfig.EMAIL_CODE_TIME
    const timer = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (error) {
    showFailToast(error || '发送验证码失败')
  }
}

async function handleBindEmail() {
  if (!emailForm.value.email) { showFailToast('请输入邮箱地址'); return }
  if (!emailForm.value.code) { showFailToast('请输入验证码'); return }

  emailLoading.value = true
  try {
    await userApi.bindEmail({ email: emailForm.value.email, code: emailForm.value.code })
    showToast({ message: '邮箱绑定成功', position: 'bottom' })
    await userStore.getUserInfo()
    showEmailPopup.value = false
    emailForm.value = { email: '', code: '' }
  } catch (error) {
    showFailToast(error.message || '邮箱绑定失败')
  } finally {
    emailLoading.value = false
  }
}

// 密码设置点击处理
const handlePasswordClick = () => {
  if (user.value?.email) {
    showPasswordPopup.value = true
  }
}

// 密码设置
const passwordForm = ref({ code: '', password: '', password_confirmation: '' })
const passwordCountdown = ref(0)
const passwordLoading = ref(false)

async function sendPasswordCode() {
  passwordCountdown.value = globalStore.initData.llconfig.EMAIL_CODE_TIME
  try {
    await globalApi.sendCode({ email: user.value.email, category: 'recover' })
    showToast({ message: '验证码已发送', position: 'bottom' })
    const timer = setInterval(() => {
      passwordCountdown.value--
      if (passwordCountdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (error) {
    passwordCountdown.value = 0
    showFailToast(error || '发送验证码失败')
  }
}

async function handleSetPassword() {
  if (!passwordForm.value.code) { showFailToast('请输入验证码'); return }
  if (!passwordForm.value.password) { showFailToast('请输入新密码'); return }
  if (passwordForm.value.password.length < 6) { showFailToast('密码长度不能少于6位'); return }
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) { showFailToast('两次输入的密码不一致'); return }

  passwordLoading.value = true
  try {
    await userApi.setPassword({ ...passwordForm.value })
    showToast({ message: '密码设置成功', position: 'bottom' })
    await userStore.getUserInfo()
    showPasswordPopup.value = false
    passwordForm.value = { code: '', password: '', password_confirmation: '' }
  } catch (error) {
    showFailToast(error.message || '密码设置失败')
  } finally {
    passwordLoading.value = false
  }
}

// Web3地址绑定
const web3Address = ref('')
const web3WalletName = ref('')
const web3Connecting = ref(false)
const web3Binding = ref(false)
const web3Error = ref('')

async function handleConnectWallet() {
  web3Error.value = ''
  web3Connecting.value = true
  try {
    const result = await connectWallet()
    web3Address.value = formatAddress(result.address)
    web3WalletName.value = result.wallet
    showToast({ message: '钱包连接成功', position: 'bottom' })
  } catch (error) {
    web3Error.value = error.message?.includes('用户拒绝') ? '用户取消了连接' : (error.message || '钱包连接失败')
  } finally {
    web3Connecting.value = false
  }
}

async function handleBindWeb3() {
  web3Error.value = ''
  web3Binding.value = true
  try {
    const fullAddress = await getCurrentAccount()
    if (!fullAddress) throw new Error('请先连接钱包')

    await userStore.web3Sign()
    const nonce = userStore.web3_nonce
    const message = `Self Youth Bind\n\nAddress: ${fullAddress}\nNonce: ${nonce}`
    const signature = await signMessage(message)

    await userApi.bindAddress({ address: fullAddress, signature, nonce })
    showToast({ message: '地址绑定成功', position: 'bottom' })
    await userStore.getUserInfo()
    showWeb3Popup.value = false
    web3Address.value = ''
    web3WalletName.value = ''
  } catch (error) {
    web3Error.value = error.message?.includes('用户拒绝') ? '用户取消了签名' : (error.message || '地址绑定失败')
  } finally {
    web3Binding.value = false
  }
}

function handleDisconnectWallet() {
  web3Address.value = ''
  web3WalletName.value = ''
  web3Error.value = ''
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  window.location.href = '/login'
}

onMounted(() => {
  userStore.getUserInfo()
})
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-bar :deep(.van-nav-bar__title) {
  color: #fff;
  font-weight: 600;
}

.nav-bar :deep(.van-icon-arrow-left) {
  color: #fff;
}

.settings-content {
  padding: 20px;
  padding-bottom: 40px;
}

.section {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-icon {
  color: #667eea;
  margin-right: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.section-body {
  padding: 8px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.setting-item:hover {
  background-color: #f8f9fa;
}

.setting-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setting-item.disabled:hover {
  background-color: transparent;
}

.setting-item.logout-item .item-label {
  color: #ff4d4f;
}

.setting-item.logout-item .logout-icon {
  background: rgba(255, 77, 79, 0.1);
}

.setting-item.logout-item .logout-icon :deep(svg) {
  color: #ff4d4f;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
}

.email-icon {
  background: rgba(102, 126, 234, 0.1);
}

.email-icon :deep(svg) {
  color: #667eea;
}

.password-icon {
  background: rgba(114, 114, 114, 0.1);
}

.password-icon :deep(svg) {
  color: #727272;
}

.web3-icon {
  background: rgba(116, 185, 255, 0.1);
}

.web3-icon :deep(svg) {
  color: #74b9ff;
}

.test-icon {
  background: rgba(253, 203, 110, 0.1);
}

.test-icon :deep(svg) {
  color: #fdcb6e;
}

.logout-icon {
  background: rgba(102, 126, 234, 0.1);
}

.item-info {
  flex: 1;
}

.item-label {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
}

.item-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.item-value.status-done {
  color: #52c41a;
}

.item-action {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  margin-right: 8px;
}

.item-disabled {
  font-size: 13px;
  color: #bbb;
}

.arrow-icon {
  color: #ccc;
}

.version-info {
  text-align: center;
  padding: 30px 0;
}

.version-text {
  font-size: 12px;
  color: #ccc;
}

/* 弹窗样式 */
.popup-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  text-align: center;
  padding: 30px 20px 20px;
}

.popup-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.email-bg {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
}

.email-bg :deep(svg) {
  color: #667eea;
}

.password-bg {
  background: rgba(114, 114, 114, 0.15);
}

.password-bg :deep(svg) {
  color: #727272;
}

.web3-bg {
  background: linear-gradient(135deg, rgba(116, 185, 255, 0.2) 0%, rgba(126, 87, 194, 0.2) 100%);
}

.web3-bg :deep(svg) {
  color: #74b9ff;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.popup-desc {
  font-size: 13px;
  color: #999;
}

.popup-body {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
}

.field-item {
  margin-bottom: 16px;
}

.code-btn {
  color: #667eea;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(102, 126, 234, 0.1);
}

.code-btn.disabled {
  color: #999;
  background: #f5f5f5;
}

.popup-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 44px;
  line-height: 44px;
}

/* Web3弹窗特殊样式 */
.web3-body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.connect-section {
  text-align: center;
}

.connect-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(116, 185, 255, 0.2) 0%, rgba(126, 87, 194, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.connect-icon :deep(svg) {
  color: #74b9ff;
}

.connect-text {
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 8px;
}

.connect-hint {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}

.connect-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 44px;
  line-height: 44px;
}

.connected-section {
  text-align: center;
  width: 100%;
}

.wallet-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.wallet-tag {
  margin-bottom: 12px;
}

.wallet-address {
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.change-btn {
  margin-top: 12px;
}

.popup-error {
  padding: 16px 20px;
  background: rgba(255, 77, 79, 0.1);
}

.error-text {
  font-size: 13px;
  color: #ff4d4f;
  text-align: center;
}
</style>
