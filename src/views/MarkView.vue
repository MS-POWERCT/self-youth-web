<template>
  <div class="mark-view">
    <div class="text-center mb-2 font-bold text-lg">
      <br />
      <IconifyIcon icon="noto:kiss-mark" width="16" class="mr-2" />
      标记吧
    </div>
    <div class="category-section mt-16">
      <div v-for="category in categoryList" :key="category.id"
        class="category-card flex flex-col items-center justify-center mt-16 radius-20"
        :class="{ active: activeCategory === category.id }" :style="{ background: getCategoryGradient(category.id) }"
        @click="handleCategoryClick(category.id)">
        <IconifyIcon :icon="category.icon" width="32" class="mb-2" />
        <div class="category-name text-white text-16 font-bold">{{ category.name }}</div>
      </div>
    </div>

    <div class="module-list">
      <div v-for="module in moduleList" :key="module.id"
        class="module-card flex items-center bg-white radius-12 p-12 mb-12" @click="navigateToItem(module)">
        <van-image class="radius-8" radius="8" width="72" height="96" lazy-load loading-icon="photo-o"
          :src="module.cover_url || getDefaultCover(module.id)" />
        <div class="ml-12 flex-1">
          <div class="font-bold  text-16 text-ellipsis">{{ module.name }}</div>
          <div class="flex items-center gap-3 mt-16">
            <div class="px-6 py-2 radius-8 bg-gray100">
              <span class=" text-12">{{ module.participant || 0 }} 人参与</span>
            </div>
            <div class="px-6 py-2 radius-8 bg-gray100">
              <span class=" text-12">{{ module.pv || 0 }} 次访问</span>
            </div>
          </div>
        </div>
        <!-- <IconifyIcon icon="mingcute:arrow-right-fill" class="mr-2" width="24" height="24" /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Image as VanImage } from 'vant'
import { useRouter } from 'vue-router'
import { useMarkStore } from '../stores/mark'
import { getDefaultCover } from '@/utils/common'

const router = useRouter()
const markStore = useMarkStore()

const categoryList = ref([])
const moduleList = ref([])
const savedMark = localStorage.getItem('mark-active-tab')
const activeCategory = ref(savedMark ? parseInt(savedMark) : 1)

const getCategoryGradient = (id) => {
  const gradients = {
    1: 'linear-gradient(180deg, #33cccc 0%, #00cccc 30%, #88a2fb 100%)',
    2: 'linear-gradient(180deg, #fb5c84 0%, #fa6199 30%, #fda872 100%)',
    3: 'linear-gradient(180deg, #19d0aa 0%, #66cc99 30%, #3ed3d2 100%)',
    4: 'linear-gradient(180deg, #e091bf 0%, #f9d4ea 30%, #FFF0F5 100%)',
    5: 'linear-gradient(180deg, #ff3399 0%, #ff6699 30%, #ff9999 100%)',
  }
  return gradients[id] || 'linear-gradient(180deg, #8B7355 0%, #C4B4A0 100%)'
}



const navigateToItem = (module) => {
  router.push({
    path: '/mark/item',
    query: {
      id: module.id,
      name: module.name,
      title: module.title || module.name
    }
  })
}

const handleCategoryClick = (categoryId) => {
  activeCategory.value = categoryId
  localStorage.setItem('mark-active-tab', categoryId)
  getModuleList(categoryId)
}

const getCategoryList = async () => {
  try {
    const response = await markStore.fetchCategoryList()
    categoryList.value = response
  } catch (error) {
    console.error('获取标记列表失败:', error)
  }
}

const getModuleList = async (categoryId) => {
  try {
    const response = await markStore.fetchModuleList(categoryId)
    moduleList.value = response
  } catch (error) {
    console.error('获取模块列表失败:', error)
  }
}

onMounted(() => {
  getCategoryList()
  getModuleList(activeCategory.value)
})
</script>

<style lang="scss" scoped>
.mark-view {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 20%, rgba(237, 131, 131, 0.5) 0%, transparent 75%),
    radial-gradient(circle at 80% 20%, rgba(121, 236, 228, 0.5) 0%, transparent 75%);
  background-blend-mode: screen;
}

.category-section {
  display: flex;
  padding: 0 22px 30px;
  gap: 20px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.category-card {
  width: 90px;
  height: 160px;
  transition: transform 0.25s ease;

  &.active {
    transform: scale(1.15);
  }
}

.category-name {
  text-shadow: 0 4px 4px rgba(18, 15, 15, 0.5);
}

.module-list {
  padding: 0 16px 20px;
}

.module-card {
  box-shadow: 0 2px 12px var(--shadow-md-color);
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 6px var(--shadow-md-color);
  }
}
</style>
