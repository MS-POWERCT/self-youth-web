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
      v-model="password"
      type="password"
      label="密码"
      placeholder="请输入密码"
      clearable
    />

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
import { ref } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '../../stores/user'

const emit = defineEmits(['login-success'])

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

const userStore = useUserStore()

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || '').trim())

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
  if (!String(password.value || '')) {
    showToast('请输入密码')
    return
  }

  try {
    isSubmitting.value = true
    clearAuthArtifactsForFreshLogin()
    await userStore.login({
      email: email.value,
      password: password.value,
    })
    showToast('登录成功')
    emit('login-success')
  } catch (error) {
    console.error('password login failed', error)
    showToast(error?.message || '登录失败')
  } finally {
    isSubmitting.value = false
  }
}
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
