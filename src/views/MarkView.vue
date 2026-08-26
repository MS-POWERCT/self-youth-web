<template>
  <div class="mark-view">
    <header class="mark-header primary-page-header">
      <h1 class="primary-page-title">{{ TAB_PAGE_LABELS.mark }}</h1>
      <!-- <div class="search-row">
        <van-search
          v-model="searchKeyword"
          class="search-input"
          shape="round"
          background="transparent"
          placeholder="搜索标记合集..."
          clearable
        />
        <button type="button" class="add-btn" aria-label="新建合集" @click="handleAddClick">
          <van-icon name="plus" size="20" color="#fff" />
        </button>
      </div> -->
    </header>

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" size="24">加载中...</van-loading>
    </div>

    <template v-else>
      <section class="stats-row" aria-label="数据概览">
        <div class="stat-card">
          <span class="stat-icon" aria-hidden="true">📚</span>
          <div class="stat-value">{{ stats.moduleCount }}</div>
          <div class="stat-label">合集</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon" aria-hidden="true">📌</span>
          <div class="stat-value">{{ stats.markedCount }}</div>
          <div class="stat-label">标记</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon" aria-hidden="true">🏁</span>
          <div class="stat-value">{{ stats.achievedCount }}</div>
          <div class="stat-label">已达成</div>
        </div>
      </section>

      <section class="category-scroll" aria-label="分类导航">
        <button
          v-for="category in categoryList"
          :key="category.id"
          type="button"
          class="category-card"
          :class="{ active: activeCategoryId === category.id }"
          :style="{ background: getCategoryStyle(category.id).bg }"
          @click="setActiveCategory(category.id)"
        >
          <IconifyIcon :icon="category.icon" width="28" />
          <div class="category-name">{{ category.name }}</div>
          <div class="category-count">{{ getCategoryModuleCount(category.id) }} 合集</div>
        </button>
      </section>

      <div class="list-header">
        <span class="list-title">{{ listTitle }}</span>
        <button type="button" class="sort-btn" @click="cycleSortMode">
          排序
          <van-icon name="exchange" size="12" />
        </button>
      </div>

      <div class="module-list">
        <div
          v-for="module in displayModules"
          :key="module.id"
          class="module-card"
          @click="navigateToItem(module)"
        >
          <div class="module-cover">
            <van-image
              class="cover-image"
              radius="12"
              width="100%"
              height="100%"
              fit="cover"
              lazy-load
              loading-icon="photo-o"
              :src="module.img_url || getDefaultCover(module.id)"
            />
            <span class="module-count-badge">{{ module.totalItems }} 项</span>
          </div>
          <div class="module-content">
            <div class="module-name">{{ module.name }}</div>
            <div class="module-desc">{{ module.title || module.name }}</div>
            <div class="module-footer">
              <span class="module-tag">{{ module.categoryName }}</span>
              <div class="module-progress">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: `${module.progress}%` }" />
                </div>
                <span class="progress-text">{{ module.progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <van-empty v-if="displayModules.length === 0" description="暂无匹配合集" />
      </div>
      <br />
      <br />
    </template>

    <br />
    <br />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Image as VanImage, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useMarkStore } from '../stores/mark'
import { markApi } from '../api/mark'
import { getDefaultCover } from '@/utils/common'
import { TAB_PAGE_LABELS } from '@/constants/tabPages'

const router = useRouter()
const markStore = useMarkStore()

const loading = ref(true)
const searchKeyword = ref('')
const categoryList = ref([])
const allModules = ref([])
const activeCategoryId = ref(null)
const sortMode = ref('progress')

const categoryStyles = {
  1: { bg: '#e8f8ef' },
  2: { bg: '#e8f4fd' },
  3: { bg: '#fdeef4' },
  4: { bg: '#fff6e5' },
  5: { bg: '#f3ecff' },
}

const getCategoryStyle = (id) => categoryStyles[id] || { bg: '#f3f4f6' }

const getCategoryModuleCount = (categoryId) =>
  allModules.value.filter((item) => item.categoryId === categoryId).length

const stats = computed(() => {
  const moduleCount = allModules.value.length
  const markedCount = allModules.value.reduce((sum, item) => sum + item.markedCount, 0)
  const achievedCount = allModules.value.filter((item) => item.achieved).length
  return { moduleCount, markedCount, achievedCount }
})

const listTitle = computed(() => {
  const category = categoryList.value.find((item) => item.id === activeCategoryId.value)
  return category ? `${category.name}合集` : '合集'
})

const displayModules = computed(() => {
  let list = allModules.value.filter((item) => item.categoryId === activeCategoryId.value)

  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    list = list.filter(
      (item) =>
        item.name?.toLowerCase().includes(keyword) ||
        item.title?.toLowerCase().includes(keyword)
    )
  }

  if (sortMode.value === 'progress') {
    list.sort((a, b) => b.progress - a.progress || b.totalItems - a.totalItems)
  } else if (sortMode.value === 'name') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))
  } else {
    list.sort((a, b) => b.totalItems - a.totalItems)
  }

  return list
})

const setActiveCategory = (categoryId) => {
  activeCategoryId.value = categoryId
  markStore.setActiveCategoryId(categoryId)
}

const cycleSortMode = () => {
  const modes = ['progress', 'items', 'name']
  const index = modes.indexOf(sortMode.value)
  sortMode.value = modes[(index + 1) % modes.length]
  const labels = { progress: '按进度', items: '按条目数', name: '按名称' }
  showToast(labels[sortMode.value])
}

const handleAddClick = () => {
  showToast('新建合集功能开发中')
}

const navigateToItem = (module) => {
  if (module.id === 48) {
    router.push('/mark/cycling')
    return
  }
  markStore.setActiveCategoryId(module.categoryId)
  router.push({
    path: '/mark/item',
    query: {
      id: module.id,
      name: module.name,
      title: module.title || module.name,
    },
  })
}

const buildModuleStats = async (module, categoryId, categoryName) => {
  try {
    const data = await markApi.getItemList(module.id)
    const list = data?.list || []
    const totalItems = list.length
    const markedCount = list.filter((item) => item.mark_type === 1 || item.mark_type === 2).length
    const doneCount = list.filter((item) => item.mark_type === 1).length
    const progress = totalItems > 0 ? Math.floor((doneCount / totalItems) * 100) : 0

    return {
      ...module,
      categoryId,
      categoryName,
      totalItems,
      markedCount,
      doneCount,
      progress,
      achieved: totalItems > 0 && doneCount === totalItems,
      pv: data?.pv ?? module.pv ?? 0,
      participant: data?.participant ?? module.participant ?? 0,
    }
  } catch (error) {
    console.error(`获取模块 ${module.id} 统计失败:`, error)
    return {
      ...module,
      categoryId,
      categoryName,
      totalItems: 0,
      markedCount: 0,
      doneCount: 0,
      progress: 0,
      achieved: false,
    }
  }
}

const loadOverview = async () => {
  loading.value = true
  try {
    const categories = await markStore.fetchCategoryList()
    categoryList.value = categories || []

    const moduleGroups = await Promise.all(
      categoryList.value.map(async (category) => {
        const modules = await markStore.fetchModuleList(category.id)
        return (modules || []).map((module) => ({
          module,
          categoryId: category.id,
          categoryName: category.name,
        }))
      })
    )

    const flatModules = moduleGroups.flat()
    const enriched = await Promise.all(
      flatModules.map(({ module, categoryId, categoryName }) =>
        buildModuleStats(module, categoryId, categoryName)
      )
    )

    allModules.value = enriched

    const firstCategory = categoryList.value[0]
    if (firstCategory) {
      setActiveCategory(firstCategory.id)
    }
  } catch (error) {
    console.error('加载标记页失败:', error)
    showToast('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOverview()
})
</script>

<style lang="scss" scoped>
.mark-view {
  min-height: 100vh;
  padding: 12px 16px 24px;
  background: #f5f6f8;
}

.mark-header {
  margin-bottom: 2px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 0;

  :deep(.van-search__content) {
    background: #fff;
    border: 1px solid var(--gray300);
  }
}

.add-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 14px;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:active {
    opacity: 0.85;
  }
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.stat-icon {
  font-size: 18px;
  line-height: 1;
}

.stat-value {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 800;
  color: var(--black300);
  line-height: 1.1;
}

.stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--gray500);
}

.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 16px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.category-card {
  flex-shrink: 0;
  width: 88px;
  min-height: 108px;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 12px 8px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &.active {
    border-color: var(--green);
    transform: translateY(-2px);
  }
}

.category-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--black300);
}

.category-count {
  font-size: 10px;
  color: var(--gray500);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--black300);
}

.sort-btn {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--green);
  font-weight: 600;
  cursor: pointer;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.module-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.99);
  }
}

.module-cover {
  position: relative;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 12px;
  overflow: hidden;
  background: #e8f8ef;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.module-count-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 10px;
  font-weight: 700;
  color: var(--black500);
}

.module-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.module-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--black300);
  line-height: 1.3;
}

.module-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--gray500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.module-footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.module-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8f8ef;
  color: #2d8f5f;
  font-size: 10px;
  font-weight: 700;
}

.module-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--gray300);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8fd3b5 0%, #3cb371 100%);
  transition: width 0.3s ease;
}

.progress-text {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--green);
}
</style>
