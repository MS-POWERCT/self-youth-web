<template>
  <div class="profile-container">

    <!-- <van-nav-bar title="个人中心" left-arrow @click-left="goBack" /> -->
    <div v-if="userStore.token && userStore.user" class="profile-content">
      <van-image
        round
        width="100"
        height="100"
        :src="userStore.user.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
      />


      <!-- <h2 class="username">{{ userStore.user.name || '用户名' }}</h2> -->
      <van-cell-group inset>
        <!-- <van-cell title="邮箱" :value="userStore.user.email || '未设置'" /> -->
        <van-cell
          title="习惯管理"
          is-link
          @click="$router.push('/habits')"
        >
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>


        <!-- 测试组件 -->
         <van-cell
          title="测试组件"
          is-link
          @click="$router.push('/demo/test-tool')"
        >
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 如果userNextLover 有内容 -->
    </div>
    <!-- <van-button
          size="small"
          type="primary"
          @click="handlePrintDeviceInfo"
          :loading="printingDeviceInfo"
        >
          获取设备信息
        </van-button> -->
    <van-button type="danger" block @click="handleLogout" class="logout-btn"> 退出登录 </van-button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

// const printingDeviceInfo = ref(false)
const userStore = useUserStore()
const router = useRouter()
// 处理打印设备信息
// const handlePrintDeviceInfo = async () => {
//   try {
//     printingDeviceInfo.value = true
//     await printDeviceInfo()
//     // showToast('设备信息已打印到控制台')
//   } catch (error) {
//     console.error('获取设备信息失败:', error)
//     // showToast('获取设备信息失败')
//   } finally {
//     printingDeviceInfo.value = false
//   }
// }

onMounted(async () => {
  await userStore.getUserInfo()
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  /* min-height: 100vh; */
  background-color: #f8f8f8;
}

.profile-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.username {
  margin: 15px 0;
  font-size: 1.2rem;
  color: #333;
}

.check-in-btn {
  margin-top: 20px;
}

.logout-btn {
  margin-top: 10px;
}

.login-btn {
  margin-top: 20px;
}

.check-in-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: fadeIn 0.5s;
}

.check-in-animation p {
  margin-top: 10px;
  color: #fff;
  font-size: 18px;
}

.check-in-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-item span {
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
