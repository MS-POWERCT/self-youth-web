<template>
  <div class="bg-gray300">

    <br/>
    <br/>
    <br/>
    <!-- <van-nav-bar title="个人中心" left-arrow @click-left="goBack" /> -->
    <div v-if="userStore.token && userStore.user" class="profile-content p-20 flex flex-col items-center">
      <van-image
        round
        width="100"
        height="100"
        :src="userStore.user.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
      />


      <h2 class="username">{{ userStore.user.name || '用户名' }}</h2>
      <van-cell-group inset>
        <!-- <van-cell title="邮箱" :value="userStore.user.email || '未设置'" /> -->
        <!-- <van-cell
          title="习惯管理"
          is-link
          @click="$router.push('/habits')"
        >
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell> -->


        <!-- 测试组件 -->
         <van-cell
          title="测试组件"
          is-link
          @click="$router.push('/demo/test-tool')"
        />
        <!-- 登录管理 -->
        <van-cell
          title="登录管理"
          is-link
          @click="$router.push('/userSettings/account-login')"
        />
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
    <van-button type="danger" block @click="handleLogout" class="logout-btn mt-10"> 退出登录 </van-button>
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
