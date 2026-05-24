<template>
  <div class="login-page">
    <div class="login-bg" aria-hidden="true" />

    <div class="login-shell">
      <section class="brand" aria-label="品牌信息">
        <div class="brand-mark">
          <img class="brand-logo" src="/logo.png" alt="Logo" />
        </div>
        <div class="brand-title">Self Youth</div>
        <div class="brand-subtitle">更轻快的登录体验 · 三种方式可选</div>
      </section>

      <section class="card" aria-label="登录表单">
        <header class="card-header">
          <div class="card-kicker">欢迎回来</div>
          <div class="card-title">登录账号</div>
          <div class="card-meta">
            <span class="dot" />
            <span class="mono">{{ apiBaseDisplay }}</span>
          </div>
        </header>

        <div class="mode-row" role="tablist" aria-label="登录方式">
          <button
            type="button"
            class="mode-pill"
            :class="{ active: loginMode === 'email_code' }"
            @click="setLoginMode('email_code')"
          >
            邮箱验证码
          </button>
          <button
            type="button"
            class="mode-pill"
            :class="{ active: loginMode === 'email_password' }"
            @click="setLoginMode('email_password')"
          >
            邮箱+密码
          </button>
          <button
            v-if="web3Support.supported"
            type="button"
            class="mode-pill"
            :class="{ active: loginMode === 'web3' }"
            @click="setLoginMode('web3')"
          >
            Web3
          </button>
        </div>

        <!-- <div v-if="!web3Support.supported && web3Support.reason === 'no_wallet'" class="web3-warning">
          <span class="warning-icon">⚠️</span>
          <span>{{ web3Support.message }}</span>
        </div> -->

        <EmailCodeLogin
          v-if="loginMode === 'email_code'"
          @login-success="handleLoginSuccess"
        />
        <EmailPasswordLogin
          v-else-if="loginMode === 'email_password'"
          @login-success="handleLoginSuccess"
        />
        <Web3Login
          v-else
          @login-success="handleLoginSuccess"
        />

        <div class="visitor-login">
          <button type="button" class="visitor-btn" @click="handleVisitorLogin">
            <span class="visitor-icon">👤</span>
            <span>游客登录</span>
          </button>
          <p class="visitor-hint">无需注册，直接体验</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmailCodeLogin from '../components/login/EmailCodeLogin.vue'
import EmailPasswordLogin from '../components/login/EmailPasswordLogin.vue'
import Web3Login from '../components/login/Web3Login.vue'
import { getVisitorId } from '../utils/visitor'
import { checkWeb3Support } from '../utils/web3'
import { showToast } from 'vant'
import { useUserStore } from '../stores/user'


const LOGIN_MODE_STORAGE_KEY = 'self_youth_login_mode_v1'
const loginMode = ref('email_code')
const web3Support = checkWeb3Support()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['login-success'])


const apiBase = import.meta.env.VITE_API_URL || ''
const apiBaseDisplay = computed(() => (apiBase ? apiBase : '（未配置 VITE_API_URL）'))

const isValidLoginMode = (mode) =>
  mode === 'email_code' || mode === 'email_password' || mode === 'web3'

const readSavedLoginMode = () => {
  try {
    const raw = localStorage.getItem(LOGIN_MODE_STORAGE_KEY)
    if (!raw) return 'email_code'
    return isValidLoginMode(raw) ? raw : 'email_code'
  } catch {
    return 'email_code'
  }
}

const persistLoginMode = (mode) => {
  try {
    localStorage.setItem(LOGIN_MODE_STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}

const setLoginMode = (mode) => {
  loginMode.value = mode
  persistLoginMode(mode)
}

const handleLoginSuccess = () => {
  router.push('/profile')
}

const handleVisitorLogin = async () => {
  const uuid = await getVisitorId()
  try {
    await userStore.loginVisitor({
      uuid: uuid
    })
    showToast('登录成功')
  } catch (error) {
    console.error('visitor login failed', error)
    showToast(error?.message || '登录失败')
  }
  emit('login-success')
  router.push('/profile')
}

onMounted(() => {
  loginMode.value = readSavedLoginMode()
})

</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: #0b1220;
}

.login-bg {
  position: absolute;
  inset: -40vh -40vw;
  background:
    radial-gradient(900px 500px at 20% 10%, rgba(99, 102, 241, 0.35), transparent 60%),
    radial-gradient(800px 520px at 80% 20%, rgba(34, 211, 238, 0.28), transparent 55%),
    radial-gradient(900px 700px at 50% 100%, rgba(244, 114, 182, 0.22), transparent 55%),
    linear-gradient(180deg, #070a12, #0b1220 40%, #0a1024);
  filter: saturate(1.05);
}

.login-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 18px;
  padding: 28px 18px;
  align-items: center;
  max-width: 1040px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
    padding: 18px 14px 26px;
  }
  .brand {
    padding: 10px 6px 0;
    text-align: center;
  }
  .brand-subtitle {
    margin: 0 auto;
  }
}

.brand {
  padding: 10px 10px 10px 6px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.brand-title {
  margin-top: 16px;
  font-size: 40px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.brand-subtitle {
  margin-top: 10px;
  max-width: 46ch;
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
  line-height: 1.6;
}

.card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  padding: 18px;
}

.card-header {
  padding: 6px 6px 10px;
}

.card-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(11, 18, 32, 0.55);
}

.card-title {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.card-meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(11, 18, 32, 0.62);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}

.mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  word-break: break-all;
}

.mode-row {
  display: flex;
  gap: 8px;
  padding: 8px 6px 10px;
}

.mode-pill {
  flex: 1;
  border: 1px solid rgba(11, 18, 32, 0.1);
  background: rgba(255, 255, 255, 0.55);
  color: rgba(11, 18, 32, 0.72);
  border-radius: 999px;
  padding: 10px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    background 120ms ease,
    border-color 120ms ease;
}

.mode-pill:hover {
  transform: translateY(-1px);
}

.mode-pill.active {
  border-color: rgba(99, 102, 241, 0.35);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(34, 211, 238, 0.12));
  color: rgba(11, 18, 32, 0.92);
}

.visitor-login {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(11, 18, 32, 0.08);
  text-align: center;
}

.visitor-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: 1px solid rgba(11, 18, 32, 0.1);
  background: rgba(255, 255, 255, 0.6);
  color: rgba(11, 18, 32, 0.72);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 120ms ease,
    background 120ms ease,
    border-color 120ms ease;
}

.visitor-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.06);
}

.visitor-icon {
  font-size: 16px;
}

.visitor-hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(11, 18, 32, 0.45);
}

.web3-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  margin-top: 12px;
  font-size: 13px;
  color: rgba(11, 18, 32, 0.7);
}

.warning-icon {
  font-size: 16px;
}

</style>
