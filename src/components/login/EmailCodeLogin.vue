<template>
  <div class="fields">
    <van-field
      v-model="email"
      type="text"
      label="邮箱"
      placeholder="name@company.com"
      clearable
    />
    <van-field
      v-model="verificationCode"
      type="text"
      label="验证码"
      placeholder="6 位验证码"
      clearable
    >
      <template #button>
        <van-button
          size="small"
          type="primary"
          :disabled="isGettingCode"
          @click.stop.prevent="sendCode"
        >
          {{ codeButtonText }}
        </van-button>
      </template>
    </van-field>

    <van-button
      class="primary-btn"
      block
      round
      type="primary"
      :loading="isSubmitting"
      @click="handleLogin"
    >
      登录
    </van-button>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '../../stores/user'
import { globalApi } from '../../api/global'

const emit = defineEmits(['login-success'])

const email = ref('')
const verificationCode = ref('')
const isGettingCode = ref(false)
const isSubmitting = ref(false)
const codeButtonText = ref('获取验证码')
const countdown = ref(60)
const countdownTimer = ref(null)

const userStore = useUserStore()

const clearCountdownTimer = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

const startCountdown = () => {
  clearCountdownTimer()
  countdown.value = 60
  isGettingCode.value = true
  codeButtonText.value = `${countdown.value}s`

  countdownTimer.value = setInterval(() => {
    countdown.value--
    codeButtonText.value = `${countdown.value}s`
    if (countdown.value <= 0) {
      clearCountdownTimer()
      codeButtonText.value = '获取验证码'
      isGettingCode.value = false
    }
  }, 1000)
}

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || '').trim())

const sendCode = async () => {
  if (isGettingCode.value) return
  if (!isValidEmail(email.value)) {
    showToast('请输入有效邮箱')
    return
  }

  try {
    await globalApi.sendCode({ email: email.value, category: 'login' })
    showToast('验证码已发送')
    startCountdown()
  } catch (error) {
    console.error('sendCode failed', error)
    showToast(error?.message || '发送验证码失败')
    clearCountdownTimer()
    isGettingCode.value = false
    codeButtonText.value = '获取验证码'
  }
}

const clearAuthArtifactsForFreshLogin = () => {
  localStorage.removeItem('user-token')
  localStorage.removeItem('user')
  userStore.token = null
  userStore.user = null
}

const handleLogin = async () => {
  if (isSubmitting.value) return
  if (!isValidEmail(email.value)) {
    showToast('请输入有效邮箱')
    return
  }
  if (!String(verificationCode.value || '').trim()) {
    showToast('请输入验证码')
    return
  }

  try {
    isSubmitting.value = true
    clearAuthArtifactsForFreshLogin()
    await userStore.loginEmail({
      email: email.value,
      code: verificationCode.value,
    })
    showToast('登录成功')
    emit('login-success')
  } catch (error) {
    console.error('email code login failed', error)
    showToast(error?.message || '登录失败')
  } finally {
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => {
  clearCountdownTimer()
})
</script>

<style scoped>
.fields {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primary-btn {
  margin-top: 6px;
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
