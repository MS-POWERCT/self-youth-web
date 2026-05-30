<template>
  <div class="account-view bg-gray50 min-h-screen">
    <van-nav-bar title="登录管理" left-arrow @click-left="$router.go(-1)" />

    <!-- {{ globalStore.initData?.llconfig?.EMAIL_CODE_COOLING_TIME }} -->
    <div class="content-container p-12">
      <!-- 邮箱 -->
      <div class="login-item bg-white p-16 mb-12 flex items-center justify-between radius-12" >
        <div>邮箱</div>
        <div class="item-right flex items-center">
          <span v-if="!user?.email" class="text-primary" @click="showEmailPopup = true">绑定邮箱</span>
          <span v-else class="text-gray500">{{ user?.email }}</span>
        </div>
      </div>

      <!-- 密码 -->
      <div class="login-item bg-white p-16 mb-12 flex items-center justify-between radius-12">
        <div>密码</div>
        <div class="item-right flex items-center">
          <span v-if="!user?.has_password" class="text-primary">
            <span v-if="user?.email" @click="showPasswordPopup = true">设置密码</span>
            <span v-else class="text-gray500">（请先绑定邮箱）</span>
          </span>
          <span v-else class="text-gray500">已设置</span>
        </div>
      </div>

      <!-- Web3钱包 -->
      <div class="login-item bg-white p-16 flex items-center justify-between radius-12">
        <div>Web3登录</div>
        <div class="item-right flex items-center">
          <span v-if="!user?.address" class="text-primary" @click="showWeb3Popup = true">绑定地址</span>
          <span v-else class="text-gray500">{{ formatAddress(user?.address) }}</span>
        </div>
      </div>
    </div>

    <!-- 邮箱绑定弹窗 -->
    <van-popup v-model:show="showEmailPopup" position="center" :style="{ width: '90%', height: '70%' }" round closeable>
      <div class="flex flex-col h-full">
        <div class="popup-header p-16 border-b border-gray-200 text-center">
          <h3 class="text-16 font-bold">绑定邮箱</h3>
        </div>

        <div class="popup-body flex-1 overflow-y-auto p-16">
          <van-field
            v-model="emailForm.email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            class="mb-12 radius-8"
          />
          <van-field
            v-model="emailForm.code"
            label="验证码"
            placeholder="请输入验证码"
            class="radius-8"
          >
            <template #button>
              <span
                :disabled="emailCountdown > 0"
                @click="sendEmailCode"
              >
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码' }}
              </span>
            </template>
          </van-field>
        </div>

        <div class="popup-footer p-16 border-t border-gray-200">
          <van-button
            type="primary"
            block
            round
            :loading="emailLoading"
            @click="handleBindEmail"
          >
            确认绑定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 密码设置弹窗 -->
    <van-popup v-model:show="showPasswordPopup" position="center" :style="{ width: '90%', height: '70%' }" round closeable>
      <div class="flex flex-col h-full">
        <div class="popup-header p-16 border-b border-gray-200 text-center">
          <h3 class="text-16 font-bold">设置密码</h3>
        </div>
        <!-- 这里显示用户当前的邮箱 -->
        <div class="text-gray500 text-center">{{ user?.email || '未绑定邮箱, 请先绑定邮箱' }}</div>
        <div class="popup-body flex-1 overflow-y-auto p-16">
          <van-field
            v-model="passwordForm.code"
            label="验证码"
            placeholder="请输入验证码"
            class="mb-12 radius-8"
          >
            <template #button>
              <span
                :disabled="passwordCountdown > 0"
                @click="sendPasswordCode"
              >
                {{ passwordCountdown > 0 ? `${passwordCountdown}s` : '发送验证码' }}
              </span>
            </template>
          </van-field>
          <van-field
            v-model="passwordForm.password"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            class="mb-12 radius-8"
          />
          <van-field
            v-model="passwordForm.password_confirmation"
            type="password"
            label="确认密码"
            placeholder="请再次输入新密码"
            class="radius-8"
          />
        </div>

        <div class="popup-footer p-16 border-t border-gray-200">
          <van-button
            type="primary"
            block
            round
            :loading="passwordLoading"
            @click="handleSetPassword"
          >
            确认设置
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- Web3地址绑定弹窗 -->
    <van-popup v-model:show="showWeb3Popup" position="center" :style="{ width: '90%', height: '70%' }" round closeable>
      <div class="flex flex-col h-full">
        <div class="popup-header p-16 border-b border-gray-200 text-center">
          <h3 class="text-16 font-bold">绑定Web3地址</h3>
        </div>

        <div class="popup-body flex-1 overflow-y-auto p-16">
          <div v-if="!web3Address" class="flex flex-col items-center justify-center py-40">
            <div class="text-gray500 text-center mb-16">
              <p class="mb-8">使用 Web3 钱包进行身份验证</p>
              <p class="text-12">连接您的钱包即可完成绑定</p>
            </div>
            <van-button
              type="primary"
              block
              round
              :loading="web3Connecting"
              @click="handleConnectWallet"
            >
              {{ web3Connecting ? '连接中...' : '连接钱包' }}
            </van-button>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-40">
            <div class="wallet-info flex flex-col items-center mb-16">
              <van-tag type="success" size="large" class="mb-8">
                {{ web3WalletName }}
              </van-tag>
              <span class="text-14 text-gray500">{{ web3Address }}</span>
            </div>
            <van-button
              type="primary"
              block
              round
              :loading="web3Binding"
              @click="handleBindWeb3"
            >
              {{ web3Binding ? '绑定中...' : '确认绑定' }}
            </van-button>
            <van-button
              plain
              type="primary"
              block
              round
              class="mt-12"
              @click="handleDisconnectWallet"
            >
              更换钱包
            </van-button>
          </div>
        </div>

        <div v-if="web3Error" class="popup-footer p-16 border-t border-gray-200">
          <div class="text-danger text-center text-12">{{ web3Error }}</div>
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
const emailForm = ref({
  email: '',
  code: ''
})
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
     await globalApi.sendCode({
      email: emailForm.value.email,
      category: 'bind_email'
    })
    showToast({ message: '验证码已发送', position: 'bottom' })
    emailCountdown.value = globalStore.initData.llconfig.EMAIL_CODE_TIME
    const timer = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    showFailToast(error || '发送验证码失败')
  }
}

async function handleBindEmail() {
  if (!emailForm.value.email) {
    showFailToast('请输入邮箱地址')
    return
  }
  if (!emailForm.value.code) {
    showFailToast('请输入验证码')
    return
  }

  emailLoading.value = true
  try {
    await userApi.bindEmail({
      email: emailForm.value.email,
      code: emailForm.value.code
    })
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

// 密码设置
const passwordForm = ref({
  code: '',
  password: '',
  password_confirmation: ''
})
const passwordCountdown = ref(0)
const passwordLoading = ref(false)

async function sendPasswordCode() {
  passwordCountdown.value = globalStore.initData.llconfig.EMAIL_CODE_TIME
  try {
    await globalApi.sendCode({
      email: user.value.email,
      category: 'recover'
    })
    showToast({ message: '验证码已发送', position: 'bottom' })
    const timer = setInterval(() => {
      passwordCountdown.value--
      if (passwordCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    passwordCountdown.value = 0
    showFailToast(error || '发送验证码失败')
  }
}

async function handleSetPassword() {
  if (!passwordForm.value.code) {
    showFailToast('请输入验证码')
    return
  }
  if (!passwordForm.value.password) {
    showFailToast('请输入新密码')
    return
  }
  if (passwordForm.value.password.length < 6) {
    showFailToast('密码长度不能少于6位')
    return
  }
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    showFailToast('两次输入的密码不一致')
    return
  }

  passwordLoading.value = true
  try {
    await userApi.setPassword({
      code: passwordForm.value.code,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation
    })
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
    web3Error.value = error.message || '钱包连接失败'
    if (error.message?.includes('用户拒绝')) {
      web3Error.value = '用户取消了连接'
    }
  } finally {
    web3Connecting.value = false
  }
}

async function handleBindWeb3() {
  web3Error.value = ''
  web3Binding.value = true

  try {
    const fullAddress = await getCurrentAccount()
    if (!fullAddress) {
      throw new Error('请先连接钱包')
    }

    await userStore.web3Sign()
    const nonce = userStore.web3_nonce

    const message = `Security code : ${nonce}`
    const signature = await signMessage(message)

    await userApi.bindAddress({
      address: fullAddress,
      signature,
      nonce
    })

    showToast({ message: '地址绑定成功', position: 'bottom' })
    await userStore.getUserInfo()
    showWeb3Popup.value = false
    web3Address.value = ''
    web3WalletName.value = ''
  } catch (error) {
    web3Error.value = error.message || '地址绑定失败'
    if (error.message?.includes('用户拒绝')) {
      web3Error.value = '用户取消了签名'
    }
  } finally {
    web3Binding.value = false
  }
}

function handleDisconnectWallet() {
  web3Address.value = ''
  web3WalletName.value = ''
  web3Error.value = ''
}

onMounted(() => {
    userStore.getUserInfo()
})
</script>

<style scoped>
</style>
