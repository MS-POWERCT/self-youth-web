<template>
  <div class="web3">
    <div class="web3-copy">
      使用 Web3 钱包进行身份验证，无需邮箱或密码。
    </div>

    <van-field
      v-model="walletAddress"
      readonly
      label="钱包地址"
      placeholder="点击下方按钮连接钱包"
    />

    <div v-if="walletAddress" class="wallet-info">
      <van-tag type="success" size="medium">
        {{ walletName }}
      </van-tag>
    </div>

    <van-button
      v-if="!walletAddress"
      block
      round
      type="primary"
      class="primary-btn"
      @click="handleConnect"
      :loading="connecting"
    >
      {{ connecting ? '连接中...' : '连接钱包' }}
    </van-button>

    <van-button
      v-else
      block
      round
      type="primary"
      class="primary-btn"
      @click="handleLogin"
      :loading="logging"
    >
      {{ logging ? '登录中...' : '钱包登录' }}
    </van-button>

    <van-button
      block
      round
      plain
      type="primary"
      @click="handleDisconnect"
      v-if="walletAddress"
    >
      断开连接
    </van-button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { connectWallet, getCurrentAccount, signMessage } from '@/utils/web3'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['login-success'])

const walletAddress = ref('')
const walletName = ref('')
const connecting = ref(false)
const logging = ref(false)
const error = ref('')
const userStore = useUserStore()

onMounted(async () => {
  await checkExistingConnection()
})

async function checkExistingConnection() {
  try {
    const account = await getCurrentAccount()
    if (account) {
      walletAddress.value = formatAddress(account)
      walletName.value = '已连接'
    }
  } catch (err) {
    console.log('No existing connection')
    error.value = err.message || '连接失败'
    showToast({ message: error.value, position: 'bottom' })
    return
  }
}

async function handleConnect() {
  error.value = ''
  connecting.value = true

  try {
    const result = await connectWallet()
    walletAddress.value = formatAddress(result.address)
    walletName.value = result.wallet

    showToast({ message: '钱包连接成功', position: 'bottom' })
  } catch (err) {
    error.value = err.message || '连接失败'
    if (err.message?.includes('用户拒绝')) {
      showToast({ message: '用户取消了连接', position: 'bottom' })
    }
  } finally {
    connecting.value = false
  }
}

async function handleLogin() {
  error.value = ''
  logging.value = true

  try {
    const fullAddress = await getCurrentAccount()

    if (!fullAddress) {
      throw new Error('请先连接钱包')
    }

    await userStore.web3Sign()
    const nonce = userStore.nonce

    const message = `Self Youth Login\n\nAddress: ${fullAddress}\nNonce: ${nonce}`

    const signature = await signMessage(message)

    await userStore.web3Login({
      address: fullAddress,
      signature,
      nonce
    })
    showToast({ message: '登录成功', position: 'bottom' })
    emit('login-success')

  } catch (err) {
    error.value = err.message || '登录失败'
    if (err.message?.includes('用户拒绝')) {
      showToast({ message: '用户取消了签名', position: 'bottom' })
    }
  } finally {
    logging.value = false
  }
}

function handleDisconnect() {
  walletAddress.value = ''
  walletName.value = ''
  error.value = ''
  showToast({ message: '已断开连接', position: 'bottom' })
}

function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
</script>

<style scoped>
.web3 {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.web3-copy {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(11, 18, 32, 0.72);
  padding: 6px 6px 2px;
}

.primary-btn {
  margin-top: 6px;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px;
}

.error-message {
  font-size: 13px;
  color: #ee0a24;
  padding: 8px 6px;
  background: rgba(238, 10, 36, 0.08);
  border-radius: 8px;
  text-align: center;
}

:deep(.van-field) {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(11, 18, 32, 0.08);
  background: rgba(255, 255, 255, 0.75);
}

:deep(.van-field__label) {
  width: 64px;
  color: rgba(11, 18, 32, 0.62);
  font-weight: 700;
}
</style>
