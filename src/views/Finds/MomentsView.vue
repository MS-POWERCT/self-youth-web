<template>
  <div class="moments-container">
    <div class="background-image"></div>

    <div class="nav-bar mt-2">
      <Icon icon="carbon:chevron-left" @click="goBack" width="24" class="nav-icon" height="24" />
      <Icon icon="ion:camera" @click="publishMoment" width="24" class="nav-icon" height="24" />
    </div>

    <!-- 用户信息 -->
    <div class="user-info">
      <span class="user-name">{{ userStore.user.name }}</span>
      <img class="user-avatar" :src="userStore.user.avatar" alt="用户头像" />
    </div>

    <!-- 朋友圈内容 -->
    <div class="moments-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-for="(item, index) in momentsList" :key="index" class="moment-item">
            <img :src="item.user.avatar" alt="头像" class="moment-avatar" />
            <div class="moment-content">
              <div class="moment-user">{{ item.user.name }}</div>
              <div class="moment-text">
                <van-text-ellipsis
                  rows="3"
                  :content="item.content"
                  expand-text="全文"
                  collapse-text="收起"
                  class="text-ellipsis"
                />
              </div>
              <div v-if="item.images && item.images.length" class="moment-images">
                <img
                  v-for="(img, imgIndex) in item.images"
                  :key="imgIndex"
                  :src="img"
                  alt="图片"
                  @click="showPreview(item.images, imgIndex)"
                />
              </div>
              <div class="flex justify-between">
                <span>{{ formatTime(item.created_at) }}</span>
                <van-popover
                  placement="left"
                  :show-arrow="false"
                  theme="dark"
                  actions-direction="horizontal"
                >
                  <div class="flex justify-between moment-active">
                    <div v-if="item.is_like" @click="likeMoment(index)">
                      <span>
                        <Icon icon="noto:red-heart" width="22" class="mr-1" />
                      </span>
                      <span> 取消 </span>
                    </div>
                    <div v-else @click="likeMoment(index)">
                      <span>
                        <Icon icon="circum:heart" width="24" class="mr-1" />
                      </span>
                      <span> 点赞 </span>
                    </div>
                    <div @click="commentMoment(index)">
                      <span><Icon icon="circum:chat-2" width="24" class="mr-1" /></span>
                      <span>评论</span>
                    </div>
                  </div>
                  <template #reference>
                    <Icon
                      icon="fa6-solid:ellipsis"
                      width="28"
                      height="18"
                      class="bg-white-233 radius-4 text-default"
                    />
                  </template>
                </van-popover>
              </div>
              <div
                class="mt-4 bg-edeeef radius-4 p-2"
                v-if="item.likes.length > 0 || item.comment.length > 0"
              >
                <div class="flex" v-if="item.likes.length > 0">
                  <Icon icon="circum:heart" width="24" class="mr-2" />
                  <div v-for="(like, likeIndex) in item.likes" :key="likeIndex">
                    <span v-if="likeIndex != 0">，</span>
                    <span class="font-bold">{{ like.name }}</span>
                  </div>
                </div>
                <div>
                  <div v-for="(comm, commentIndex) in item.comment" :key="commentIndex">
                    <div>
                      <span class="moment-user">{{ comm.name }}</span
                      >:
                      <span class="moment-text">{{ comm.content }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <van-image-preview
            v-model:show="showPreviewImage"
            :images="previewImages"
            :start-position="previewStartPosition"
          />
          <van-action-sheet v-model:show="showAction" :closeable="false" :round="false">
            <van-cell-group inset class="m-4">
              <van-field v-model="commentContent" class="bg-white-233" placeholder="发表评论：" />
              <!-- 提交按钮 -->
              <van-button
                type="primary"
                class="mt-4"
                @click="submitComment"
                :loading="loading"
                :disabled="loading"
              >
                提交
              </van-button>
            </van-cell-group>
          </van-action-sheet>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '../../stores/user'
import { loverCircleApi } from '../../api/lover_circle'
import { Icon } from '@iconify/vue'
import { formatTime } from '../../utils/utils'

const userStore = useUserStore()
const router = useRouter()

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const momentsList = ref([])
const currentPage = ref(0)
const pageSize = 10

const showPreviewImage = ref(false)
const previewImages = ref([])
const previewStartPosition = ref(0)

const showAction = ref(false)
const commentContent = ref('')
const IndexAction = ref(0)

const goBack = () => {
  router.back()
}

const publishMoment = () => {
  router.push('/find/publish')
}

const fetchMoments = async () => {
  try {
    const response = await loverCircleApi.getList({ page: currentPage.value, size: pageSize })
    const newMoments = response.map((moment) => ({ ...moment }))
    momentsList.value.push(...newMoments)
    loading.value = false
    if (newMoments.length < pageSize) {
      finished.value = true
    }
    currentPage.value++
  } catch (error) {
    console.error('获取朋友圈列表失败:', error)
    showToast('获取朋友圈列表失败')
    loading.value = false
  }
}

const onRefresh = async () => {
  try {
    currentPage.value = 0
    momentsList.value = []
    finished.value = false
    await fetchMoments()
    showToast('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

const onLoad = async () => {
  await fetchMoments()
}

const showPreview = (images, startPosition) => {
  previewImages.value = images
  previewStartPosition.value = startPosition
  showPreviewImage.value = true
}

const likeMoment = async (index) => {
  momentsList.value[index].is_like = !momentsList.value[index].is_like
  if (momentsList.value[index].is_like) {
    momentsList.value[index].likes.push({
      id: userStore.user.id,
      name: userStore.user.name,
    })
  } else {
    momentsList.value[index].likes = momentsList.value[index].likes.filter((like) => {
      return like.id != userStore.user.id
    })
  }
  await loverCircleApi.userClick({ id: momentsList.value[index].id })
}

const commentMoment = (index) => {
  showAction.value = !showAction.value
  IndexAction.value = index
}

// 提交评论
const submitComment = async () => {
  if (commentContent.value.trim()) {
    momentsList.value[IndexAction.value].comment.push({
      name: userStore.user.name,
      content: commentContent.value,
    })

    // 执行提交评论的逻辑
    await loverCircleApi.commentCreate({
      id: momentsList.value[IndexAction.value].id,
      content: commentContent.value,
    })
    showToast('评论成功')
    commentContent.value = '' // 清空输入框
    showAction.value = false // 关闭弹出框
  } else {
    showToast('评论内容不能为空')
  }
}
</script>

<style scoped>
.moments-container {
  min-height: 100vh;
  background-color: #f7f7f7;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background-image: url('/images/moments-bg.jpg');
  background-size: cover;
  background-position: center;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 10;
  transition: background-color 0.3s;
  font-size: 24px;
  color: #fff;
}

.user-info {
  position: relative;
  padding: 15px;
  margin-top: 240px;
  color: #fff;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: flex-end; /* 整体靠右 */
  gap: 10px; /* 头像和文字的间距 */
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 5px;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
}

.moments-content {
  min-height: calc(100vh - 200px);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  padding: 20px;
}

.moment-item {
  display: flex;
  margin-bottom: 20px;
}

.moment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  margin-right: 10px;
}

.moment-content {
  flex: 1;
}

.moment-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.moment-text {
  margin-bottom: 10px;
}

.moment-images {
  display: flex;
  flex-wrap: wrap;
}

.moment-images img {
  width: 33.33%;
  height: 100px;
  object-fit: cover;
  margin-bottom: 5px;
}

.text-ellipsis {
  display: flex;
  flex-direction: column;
}

.moment-active > div {
  display: flex;
  justify-content: space-between;
  margin: 0.2rem 1.2rem;
  height: 1.6rem;
}

.text-ellipsis .van-text-ellipsis__expand {
  margin-top: 8px; /* 控制 "全文" 与内容之间的间距 */
}
</style>
