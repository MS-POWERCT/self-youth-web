<template>
  <div class="mark-view">
    <div class="text-center mb-2 font-bold text-lg">
      <br/>
        <IconifyIcon icon="noto:kiss-mark" width="16" class="mr-2"/>
        标记吧
    </div>
    <div class="category-section">
      <div
        v-for="category in categoryList"
        :key="category.id"
        class="category-card mt-8"
        :class="{ active: activeCategory === category.id }"
        :style="{ background: getCategoryGradient(category.id) }"
        @click="handleCategoryClick(category.id)"
      >
        <IconifyIcon :icon="category.icon" width="32" class="mb-2"/>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>

    <div class="module-list">
      <div
        v-for="module in moduleList"
        :key="module.id"
        class="module-card"
        @click="navigateToItem(module)"
      >
        <van-image
          class="module-cover"
          radius="8"
          width="72"
          height="96"
          lazy-load
          loading-icon="photo-o"
          :src="module.cover_url || getDefaultCover(module.id)"
        />
        <div class="module-info">
          <div class="module-title">{{ module.name }}</div>
          <div class="module-meta">
            <div class="progress">
              <span class="progress-text">{{ module.participant || 0 }} 人参与</span>
            </div>
            <div class="progress">
              <span class="progress-text">{{ module.pv || 0 }} 次访问</span>
            </div>
          </div>
        </div>
        <IconifyIcon icon="mingcute:arrow-right-fill" class="mr-2" width="24" height="24" />
        <!-- <IconifyIcon icon="uim:arrow-circle-right" class="cell-icon" width="24" height="24" /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Image as VanImage } from 'vant'
import { useRouter } from 'vue-router'
import { useMarkStore } from '../stores/mark'

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
    4: 'linear-gradient(180deg, #FFE4B5 0%, #FFF8DC 30%, #FFF0F5 100%)',
    5: 'linear-gradient(180deg, #ff3399 0%, #ff6699 30%, #ff9999 100%)',
  }
  return gradients[id] || 'linear-gradient(180deg, #8B7355 0%, #C4B4A0 100%)'
}

const getDefaultCover = (id) => {
  return `https://picsum.photos/seed/${id}/72/96`
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
    radial-gradient(circle at 20% 20%, rgba(255,107,107,0.5) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(121, 236, 228, 0.5) 0%, transparent 50%);
  background-blend-mode: screen;
}

.category-section {
  display: flex;
  padding: 0px 22px 30px 22px;
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
  flex-shrink: 0;
  width: 90px;
  height: 160px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;

  &.active {
    transform: scale(1.15);
  }
}

.category-name {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 4px 4px rgba(18, 15, 15, 0.5);
}

.module-list {
  padding: 0 16px 20px;
}

.module-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  }
}

.module-cover {
  flex-shrink: 0;
  border-radius: 8px;
}

.module-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-author {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.module-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.rating {
  display: flex;
  align-items: center;
}

.star {
  width: 14px;
  height: 14px;
  color: #ffc107;
  margin-right: 1px;
}

.rating-text {
  font-size: 12px;
  color: #ff9800;
  margin-left: 4px;
}

.progress {
  background: #f0f0f0;
  padding: 0px 6px;
  border-radius: 8px;
}

.progress-text {
  font-size: 11px;
  color: #666;
}
</style>
