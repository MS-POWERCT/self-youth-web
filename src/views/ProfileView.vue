<template>
  <div class="profile-container">

    <br />
    <br />
    <!-- <van-nav-bar title="个人中心" left-arrow @click-left="goBack" /> -->
    <!-- 水平垂直居中 -->
    <div v-if="userStore.token && userStore.user">
      <van-row class="flex items-center">
        <van-col span="8" class="flex justify-center">
          <van-image class="border-white" round
            :src="userStore.user.avatar || `https://picsum.photos/seed/${userStore.user.id}/64/64`" />
        </van-col>
        <van-col span="12">
          <span class="font-bold text-24">{{ userStore.user.name || '用户名' }}</span>
        </van-col>
        <van-col span="4">
          <div @click="$router.push('/userSettings/statistics')">
            <IconifyIcon icon="streamline-stickies-color:android-setting" width="32" />
          </div>
        </van-col>
      </van-row>
      <div class="statistics">
        <div>
          <div><span class="text-24 font-bold">{{ userStore.user.continuous_days_check || 0 }}</span>&nbsp;天</div>
          <div class="text-gray500">连续打卡</div>
        </div>
        <div>
          <div><span class="text-24 font-bold">{{ userStore.user.continuous_days_value || 0 }}</span>&nbsp;天</div>
          <div class="text-gray500">连续记录</div>
        </div>
        <div>
          <div><span class="text-24 font-bold">{{ userStore.user.mark_user_count || 0 }}</span></div>
          <div class="text-gray500">累计标记</div>
        </div>
      </div>
      <!-- <van-cell-group inset> -->

      <!-- 测试组件 -->
      <!-- <van-cell title="测试组件" is-link @click="$router.push('/demo/test-tool')" /> -->
      <!-- 登录管理 -->
      <!-- <van-cell title="登录管理" is-link @click="$router.push('/userSettings/account-login')" /> -->
      <!-- </van-cell-group> -->

      <!-- 如果userNextLover 有内容 -->
    </div>
    <div class="user-active py-16">
      <div class="user-log">
        <div v-for="item in userLog" :key="item.id" class="user-item py-4 flex justify-between">
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <IconifyIcon :icon="getLogIcon(item.type)" width="12" /> &nbsp;
            {{ item.log }}
          </div>
          <div class="text-12" :class="{ 'text-gray500': !isToday(item.updated_at) }">
            {{ !isToday(item.updated_at) ? '◆ ' : '' }}{{ item.updated_at.substring(10, 16) }}
            &nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </div>
    </div>

    <!-- <van-button type="danger" block @click="handleLogout" class="logout-btn mt-10"> 退出登录 </van-button> -->
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/user'
// import { useRouter } from 'vue-router'


const userStore = useUserStore()
// const router = useRouter()

const userLog = ref([])

// 判断是否是今天
const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// 加载用户操作日志
const loadUserLog = async () => {
  try {
    const log = await userStore.getUserLog()
    userLog.value = log || []
  } catch (error) {
    console.error('加载用户操作日志失败', error)
  }
}



// 获取日志图标
const getLogIcon = (type) => {
  if (type === 'mark') {
    return 'streamline-stickies-color:keyboard-direction'
  } else if (type === 'habit') {
    return 'streamline-stickies-color:validation-1'
  } else {
    return 'streamline-stickies-color:star-duo'
  }
}


onMounted(async () => {
  await userStore.getUserInfo()
  await loadUserLog()
})


</script>
<style scoped>
.profile-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 20%, rgba(237, 131, 131, 0.5) 0%, transparent 75%),
    radial-gradient(circle at 80% 20%, rgba(121, 236, 228, 0.5) 0%, transparent 75%);
  background-blend-mode: screen;
  /* background-color: var(--van-); */
}

.statistics {
  background-color: var(--white);
  margin: 30px 20px;
  border-radius: 16px;
  display: flex;
  justify-content: space-around;
  padding: 20px;

  >div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.user-active {
  background-color: var(--white);
  margin: 30px 20px;
  border-radius: 16px;

}

.user-log {
  height: 220px;
  overflow-y: auto;
}
</style>
