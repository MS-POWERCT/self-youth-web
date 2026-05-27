<template>
  <div class="publish-container bg-gray50">
    <van-nav-bar left-text="取消" @click-left="goBack" class="bg-white">
      <template #right>
        <van-button type="primary" size="small" @click="handleSubmit">发布</van-button>
      </template>
    </van-nav-bar>
    <van-form @submit="handleSubmit" class="p-16">
      <van-field
        v-model="content"
        type="textarea"
        rows="4"
        autosize
        placeholder="分享你的动态..."
        maxlength="500"
        show-word-limit
        class="mb-16"
      />
      <van-uploader
        v-model="images"
        :before-delete="beforeDelete"
        :after-read="afterRead"
        multiple
        :max-count="4"
        class="mt-16"
      />
      {{ files }}
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { loverCircleApi } from '@/api/lover_circle'
import { globalApi } from '@/api/global'

const router = useRouter()
const content = ref('')
const images = ref([])
const files = ref([])

const goBack = () => {
  router.back()
}
const afterRead = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file.file)
    const response = await globalApi.fileUpload(formData)
    files.value.push(response)
  } catch (error) {
    console.error('图片上传失败:', error)
    showToast('图片上传失败')
  }
}

const beforeDelete = (file) => {
  const index = images.value.findIndex((img) => img.file === file.file)
  if (index !== -1) {
    images.value.splice(index, 1)
    files.value.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!content.value.trim() && files.value.length === 0) {
    showToast('请输入内容或上传图片')
    return
  }

  try {
    const formData = new FormData()
    formData.append('content', content.value)
    formData.append('images', files.value)
    // images.value.forEach((image, index) => {
    //   formData.append(`images`, image.file)
    // })

    await loverCircleApi.create(formData)
    showToast('发布成功')
    router.back()
  } catch (error) {
    console.error('发布失败:', error)
    showToast('发布失败')
  }
}
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
}
</style>
