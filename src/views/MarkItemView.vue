<template>
  <div class="mark-detail-view">
    <header class="detail-nav">
      <button type="button" class="nav-back" aria-label="返回" @click="$router.go(-1)">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="nav-title">合集详情</h1>
      <div class="nav-actions">
        <button type="button" class="nav-action-btn" aria-label="分享">
          <van-icon name="link-o" size="18" />
        </button>
        <button type="button" class="nav-action-btn" aria-label="更多">
          <van-icon name="ellipsis" size="18" />
        </button>
      </div>
    </header>

    <section class="summary-card">
      <div class="summary-head">
        <h2 class="summary-title">{{ moduleName }}</h2>
        <p class="summary-meta">{{ summaryMeta }}</p>
      </div>
      <div class="summary-body">
        <div v-if="hasDetailItems" class="detail-hint">
          <van-icon name="info-o" size="14" />
          <span>{{ detailHintText }}</span>
        </div>
        <div class="progress-row">
          <span class="progress-label">完成进度</span>
          <span class="progress-percent">{{ progressPercent }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="summary-stats">
          <span>{{ counts[1] }} {{ moduleTypeList[1] }}</span>
          <span>{{ counts[2] }} {{ moduleTypeList[2] }}</span>
          <span>{{ counts[0] }} {{ moduleTypeList[0] }}</span>
        </div>
      </div>
    </section>

    <div class="detail-content">
      <div class="filter-tabs">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          class="filter-chip"
          :class="{ active: filterStatus === option.value }"
          @click="filterStatus = option.value"
        >
          {{ option.label }} {{ option.count }}
        </button>
      </div>

      <button type="button" class="poster-btn" @click="showPosterPopup = true">
        <span class="poster-icon" aria-hidden="true">🎨</span>
        生成标记海报
      </button>

      <div v-if="moduleTypeAAAAAProvince.length > 1" class="province-filter">
        <button
          v-for="option in moduleTypeAAAAAProvince"
          :key="option.value"
          type="button"
          class="province-tag"
          :class="{ active: dropdownValue === option.value }"
          @click="dropdownValue = option.value"
        >
          {{ option.text }}
          <span class="province-count">
            ({{ option.value === 'all' ? itemList.length : (provinceCounts[option.value] || 0) }})
          </span>
          <van-icon v-if="dropdownValue === option.value" name="success" size="12" />
        </button>
      </div>

      <div class="item-list">
        <article v-for="(item, index) in filteredList" :key="item.id" class="item-card">
          <span class="item-index">{{ index + 1 }}</span>
          <div class="item-cover">
            <van-image
              class="cover-image"
              radius="12"
              width="100%"
              height="100%"
              fit="cover"
              lazy-load
              loading-icon="photo-o"
              :src="item.img_url || getDefaultCover(item.name)"
            />
          </div>
          <div class="item-body">
            <h3
              class="item-name"
              :class="{ 'is-clickable': isDetailItem(item) }"
              @click="handleItemClick(item)"
            >
              {{ item.name }}
            </h3>

            <div class="item-desc-wrap">
              <p v-if="item.star > 0" class="item-desc item-rating">{{ item.star_ }}</p>
              <p v-else-if="item.title" class="item-desc" @click.stop="itemTitleClick(item.title)">
                {{ item.title }}
              </p>
              <div v-if="['AAAAA', 'hiking'].includes(item.type) && item.tags?.tags?.length" class="item-type-tags">
                <span
                  v-for="tag in item.tags.tags"
                  :key="tag"
                  class="item-type-tag"
                  :class="getItemTagClass(tag)"
                >
                  {{ tag }}
                </span>
              </div>
              <p v-if="item.type === 'AAAAA'" class="item-location">
                {{ item.tags.province || '未知位置' }} · {{ item.tags.city || '未知位置' }}
              </p>
            </div>

            <div class="item-actions">
              <template v-if="item.mark_type === 0">
                <button type="button" class="action-btn action-want" @click.stop="markItem(item, 2)">
                  {{ moduleTypeList[2] }}
                </button>
                <button type="button" class="action-btn action-done" @click.stop="markItem(item, 1)">
                  {{ moduleTypeList[1] }}
                </button>
              </template>
              <template v-else>
                <span class="mark-status" :class="item.mark_type === 2 ? 'status-want' : 'status-done'">
                  {{ moduleTypeList[item.mark_type] }}
                  <van-icon
                    name="cross"
                    size="14"
                    @click.stop="markItem(item, 0)"
                  />
                </span>
              </template>
            </div>
          </div>
        </article>

        <van-empty v-if="filteredList.length === 0" description="暂无匹配合集" />
      </div>

      <van-back-top class="mark-back-top" right="42%" bottom="10vh">
        <div class="mark-back-top-inner">
          <IconifyIcon icon="glyphs:arrow-bold" width="22" />
        </div>
      </van-back-top>
    </div>

    <!-- AAAAA类型景区详情弹窗 -->
    <van-popup v-model:show="showDetailPopup" :style="{ height: '75vh', width: '90%' }" round>
      <div v-if="selectedItem" class="detail-popup">
        <div class="popup-content">
          <div class="detail-title">{{ selectedItem.name }}</div>
          <div class="detail-location flex items-center text-14">
            <IconifyIcon icon="streamline-stickies-color:3d-duo" width="16" /> &nbsp;
            <span>{{ selectedItem.tags.province || '未知位置' }}</span>
            <span class="text-12">&nbsp; · &nbsp;</span>
            <span>{{ selectedItem.tags.city || '未知位置' }}</span>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value text-primary">{{ selectedItem.tags.ticket_price || '--' }}</div>
              <div class="stat-label">门票价格</div>
            </div>
            <div class="stat-card">
              <div class="stat-value text-primary">{{ selectedItem.tags.annual_visitors || '--' }} w</div>
              <div class="stat-label">年游客量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value text-primary">{{ selectedItem.tags.area || '--' }}</div>
              <div class="stat-label">景区面积</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">评定批次</div>
              <div class="info-value">{{ selectedItem.tags.batch || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">评定年份</div>
              <div class="info-value">{{ selectedItem.tags.batch_year || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">最佳季节</div>
              <div class="info-value">{{ selectedItem.tags.best_season || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">景区类型</div>
              <div class="info-value">{{ selectedItem.tags.scenic_type || '--' }}</div>
            </div>
          </div>

          <div class="item-type-tags">
            <span v-for="tag in selectedItem?.tags.tags" :key="tag" class="item-type-tag" :class="getItemTagClass(tag)">
              {{ tag }}
            </span>
          </div>

          <!-- 介绍 -->
          <div class="hiking-description">
            <div class="desc-line"></div>
            <div class="desc-text">{{ selectedItem?.tags.description || '暂无详细介绍' }}</div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- hiking类型详情弹窗 -->
    <van-popup v-model:show="showHikingDetailPopup" :style="{ height: '75vh', width: '90%' }" round>
      <div class="hiking-popup">
        <div class="hiking-head">
          <div class="hiking-bg"></div>
          <!-- <van-icon name="close" class="hiking-close" @click="showHikingDetailPopup = false" /> -->
          <div class="hiking-content">
            <div class="hiking-title">{{ selectedItem?.name }}</div>
            <div class="hiking-subtitle">
              <span class="hiking-location">
                <IconifyIcon icon="streamline-stickies-color:3d-duo" width="16" /> &nbsp;
                {{ selectedItem?.tags.province || '未知位置' }}
                ·
                {{ selectedItem?.tags.region || '未知位置' }}
              </span>
              <span class="difficulty-tag">{{ selectedItem?.tags.difficulty || '中等' }}</span>
            </div>
          </div>
        </div>

        <div class="hiking-body">
          <!-- 统计卡片 -->
          <div class="hiking-stats">
            <div class="hiking-stat-card">
              <div class="stat-icon-wrapper">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="stat-value">{{ selectedItem?.tags.distance || '--' }}</div>
              <div class="stat-label">全程距离</div>
            </div>
            <div class="hiking-stat-card">
              <div class="stat-icon-wrapper">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div class="stat-value">{{ selectedItem?.tags.duration || '--' }}</div>
              <div class="stat-label">建议天数</div>
            </div>
            <div class="hiking-stat-card">
              <div class="stat-icon-wrapper">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 21l4-10 4 10M8 10h8" />
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
              </div>
              <div class="stat-value">{{ selectedItem?.tags.altitude || '--' }}米</div>
              <div class="stat-label">海拔范围</div>
            </div>
            <div class="hiking-stat-card">
              <div class="stat-icon-wrapper">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div class="stat-value">{{ selectedItem?.tags.best_season || '--' }}</div>
              <div class="stat-label">最佳季节</div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="hiking-info">
            <div class="hiking-info-item">
              <div class="info-icon-wrapper bg-yellow-light">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div class="info-content">
                <div class="info-label">所在地区</div>
                <div class="info-value">
                  {{ selectedItem?.tags.province || '--' }}
                  ·
                  {{ selectedItem?.tags.region || '--' }}
                </div>
              </div>
            </div>
            <div class="hiking-info-item">
              <div class="info-icon-wrapper bg-pink-light">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div class="info-content">
                <div class="info-label">难度等级</div>
                <div class="info-value text-primary">{{ selectedItem?.tags.difficulty || '--' }}</div>
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div class="item-type-tags">
            <span v-for="tag in selectedItem?.tags.tags" :key="tag" class="item-type-tag" :class="getItemTagClass(tag)">
              {{ tag }}
            </span>
          </div>

          <!-- 介绍 -->
          <div class="hiking-description">
            <div class="desc-line"></div>
            <div class="desc-text">{{ selectedItem?.tags.description || '暂无详细介绍' }}</div>
          </div>
        </div>
      </div>
    </van-popup>


    <!-- 下面弹出 -->
    <van-popup v-model:show="showPosterPopup" position="bottom" :style="{ height: '20vh' }" round>
      <div class="m-16">
        <div class="font-bold text-16">
          选择海报样式
        </div>
        <div>
          <div class="mt-8 py-8   flex items-center justify-center radius-8 bg-primary100">
            <IconifyIcon class="mr-8" icon="streamline-stickies-color:photography" width="20" />
            海报墙
          </div>
          <div class="mt-8 py-8 flex items-center justify-center radius-8 bg-primary100" @click="exportText()">
            <IconifyIcon class="mr-8" icon="streamline-stickies-color:education-degree" width="20" />
            文字卡片
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 导出文字弹窗 -->
    <van-popup v-model:show="showExportTextPopup" position="right" :style="{ height: '100%', width: '100%' }">
      <div class="export-text-container">
        <!-- 标题区域 -->
        <div class="export-header">
          <van-icon name="arrow-left" size="10" @click="showExportTextPopup = false" />
          <span>海报预览</span>
        </div>

        <!-- 内容区域 -->
        <div class="export-content">
          <div class="text-center text-16 font-bold">{{ exportTextContent['name'] }} 海报</div>
          <div class="export-status flex justify-center items-center">
            <span class="m-8 text-10 bg-green100 py-2 px-8 font-bold text-green radius-8">{{
              exportTextContent['yes']
              }}</span>
            <span class="m-8 text-10 bg-yellow-gold100 py-2 px-8 font-bold text-yellow-gold radius-8">{{
              exportTextContent['want']
              }}</span>
            <span class="m-8 text-10 bg-gray300 py-2 px-8 font-bold text-gray radius-8">{{
              exportTextContent['no']
              }}</span>
          </div>
          <div>
            <span v-for="(item, index) in exportTextContent['itemList']" :key="index"
              class="item-tag mr-4 text-8 font-bold radius-8 py-2 px-8" :class="{
                'bg-gray300 text-gray': item.markType === 0,
                'bg-green100 text-green': item.markType === 1,
                'bg-yellow-gold100 text-yellow-gold': item.markType === 2,
                'line-through': item.markType === 1
              }">
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="export-actions">
          <van-button type="default" block @click="saveToAlbum">保存到相册</van-button>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useMarkStore } from '../stores/mark'
import { markApi } from '../api/mark'
import { getDefaultCover } from '@/utils/common'

const markStore = useMarkStore()
const route = useRoute()

const moduleId = ref(0)
const moduleName = ref('')
const moduleTitle = ref('')
const moduleType = ref('')
const moduleTypeList = ref([])

const moduleTypeConfig = ref({
  1: [
    '未看',
    '已看',
    '想看',
  ],
  2: [
    '未看',
    '已看',
    '想看',
  ],
  3: [
    '未去',
    '已去',
    '想去',
  ],
  4: [
    '未完成',
    '已完成',
    '想完成',
  ],
})

const pv = ref(0)
const participant = ref(0)
const itemList = ref([])
const itemListTotal = ref(0)
const DETAIL_ITEM_TYPES = ['AAAAA', 'hiking']

const filterStatus = ref('all')
const showDetailPopup = ref(false)
const showHikingDetailPopup = ref(false)
const selectedItem = ref(null)
const showPosterPopup = ref(false)
const showExportTextPopup = ref(false)
const exportTextContent = ref([])
//


// 下拉筛选
const dropdownValue = ref('all')
const moduleTypeAAAAAProvince = ref([
  { text: '全部', value: 'all' },
])

// 省份统计
const provinceCounts = computed(() => {
  const counts = {}
  itemList.value.forEach(item => {
    if (item.type === 'AAAAA' && item.tags?.province) {
      counts[item.tags.province] = (counts[item.tags.province] || 0) + 1
    }
  })
  return counts
})

const handleItemClick = (item) => {
  if (!isDetailItem(item)) return
  selectedItem.value = item
  if (item.type === 'AAAAA') {
    showDetailPopup.value = true
  } else if (item.type === 'hiking') {
    showHikingDetailPopup.value = true
  }
}

const isDetailItem = (item) => DETAIL_ITEM_TYPES.includes(item.type)

const hasDetailItems = computed(() => itemList.value.some(isDetailItem))

const detailHintText = computed(() => {
  const types = new Set(itemList.value.filter(isDetailItem).map((item) => item.type))
  if (types.size === 1 && types.has('hiking')) return '点击路线名称可查看详细介绍'
  if (types.size === 1 && types.has('AAAAA')) return '点击景区名称可查看详细介绍'
  return '部分条目支持点击查看详情'
})

const getItemTagClass = (tag) => {
  // 自然景观类
  if (tag.includes('雪山') || tag.includes('神山')) return 'tag-purple'
  if (tag.includes('彩林') || tag.includes('花海') || tag.includes('杜鹃')) return 'tag-green'
  if (tag.includes('草原') || tag.includes('草甸')) return 'tag-grass'
  if (tag.includes('沙漠') || tag.includes('大漠')) return 'tag-desert'
  if (tag.includes('峡谷') || tag.includes('冰川') || tag.includes('冰河')) return 'tag-blue'
  if (tag.includes('热带雨林') || tag.includes('原始森林')) return 'tag-forest'
  if (tag.includes('高原湖泊') || tag.includes('湖泊') || tag.includes('海子') || tag.includes('盐湖')) return 'tag-lake'

  // 文化历史类
  if (tag.includes('历史') || tag.includes('长城') || tag.includes('古道') || tag.includes('朝圣')) return 'tag-history'
  if (tag.includes('藏区') || tag.includes('藏传佛教') || tag.includes('游牧')) return 'tag-tibetan'

  // 难度等级类
  if (tag.includes('入门级')) return 'tag-easy'
  if (tag.includes('中等')) return 'tag-medium'
  if (tag.includes('偏难') || tag.includes('高难度')) return 'tag-hard'
  if (tag.includes('极高难度') || tag.includes('极限') || tag.includes('自虐')) return 'tag-extreme'

  // 特色标签
  if (tag.includes('世界级') || tag.includes('史诗级') || tag.includes('蓝色星球')) return 'tag-world'
  if (tag.includes('秘境') || tag.includes('网红')) return 'tag-secret'
  if (tag.includes('云海') || tag.includes('星空') || tag.includes('日出')) return 'tag-sky'

  // 等级类
  if (tag.includes('5A') || tag.includes('5A级')) return 'tag-level-5a'

  // 世界遗产类
  if (tag.includes('世界文化遗产') || tag.includes('世界自然遗产') ||
    tag.includes('世界文化与自然遗产') || tag.includes('世界遗产') ||
    tag.includes('世界地质公园')) return 'tag-heritage'

  // 宗教类
  if (tag.includes('佛教名山') || tag.includes('道教名山') ||
    tag.includes('佛教文化') || tag.includes('藏传佛教') ||
    tag.includes('儒家文化')) return 'tag-religion'

  // 红色旅游
  if (tag.includes('红色旅游')) return 'tag-red'

  // 自然景观类
  if (tag.includes('地质公园') || tag.includes('丹霞地貌') ||
    tag.includes('峡谷风光') || tag.includes('湿地生态') ||
    tag.includes('森林公园') || tag.includes('溶洞') ||
    tag.includes('瀑布') || tag.includes('草原') ||
    tag.includes('沙漠') || tag.includes('雪山') ||
    tag.includes('冰川') || tag.includes('喀斯特') ||
    tag.includes('雅丹地貌')) return 'tag-natural'

  // 水域类
  if (tag.includes('湖泊度假') || tag.includes('海滨度假') ||
    tag.includes('海岛度假') || tag.includes('高山湖泊') ||
    tag.includes('高原湖泊') || tag.includes('跨国瀑布') ||
    tag.includes('城市湖泊')) return 'tag-water'

  // 人文类
  if (tag.includes('古城') || tag.includes('古镇') ||
    tag.includes('古村落') || tag.includes('历史文化街区') ||
    tag.includes('历史文化') || tag.includes('全国重点文保单位') ||
    tag.includes('名人故居')) return 'tag-cultural'

  // 主题类
  if (tag.includes('主题乐园') || tag.includes('影视文化') ||
    tag.includes('温泉度假') || tag.includes('高尔夫度假') ||
    tag.includes('度假村')) return 'tag-theme'


  return 'tag-gray'
}

const counts = computed(() => {
  return {
    all: itemList.value.length,
    0: itemList.value.filter(item => item.mark_type === 0).length,
    1: itemList.value.filter(item => item.mark_type === 1).length,
    2: itemList.value.filter(item => item.mark_type === 2).length
  }
})

const progressPercent = computed(() => {
  if (itemListTotal.value <= 0) return 0
  return Math.floor((counts.value[1] / itemListTotal.value) * 100)
})

const summaryMeta = computed(() => {
  const doneLabel = moduleTypeList.value[1] || '已完成'
  return `${itemListTotal.value} 项 · ${doneLabel} ${counts.value[1]}`
})

const filterOptions = computed(() => [
  { value: 'all', label: '全部', count: counts.value.all },
  { value: 0, label: moduleTypeList.value[0] || '未标记', count: counts.value[0] },
  { value: 2, label: moduleTypeList.value[2] || '想去', count: counts.value[2] },
  { value: 1, label: moduleTypeList.value[1] || '已完成', count: counts.value[1] },
])

const filteredList = computed(() => {
  let result = itemList.value

  if (filterStatus.value !== 'all') {
    result = result.filter((item) => item.mark_type === filterStatus.value)
  }

  // 按省份筛选
  if (dropdownValue.value !== 'all') {
    result = result.filter(item => item.tags?.province === dropdownValue.value)
  }

  return result
})


const itemTitleClick = (title) => {
  showToast(title);
}

const getItemList = async () => {
  try {
    const data = await markStore.fetchItemList(moduleId.value)
    itemList.value = data.list || []
    //  处理title最多14个字符
    itemList.value.forEach(item => {
      if (item.title && item.title.length > 12) {
        item.title_ = item.title.substring(0, 12) + '..'
      } else {
        item.title_ = item.title
      }
      // 如果type=default 则显示默认图标
      if (item.type === 'video') {
        // 处理评分增加豆瓣:
        item.star_ = '豆瓣:' + item.star
      }

      // 解析tags 字符串为数组
      item.tags = JSON.parse(item.tags || '[]')
      moduleType.value = item.type
      // 如果是AAAAA
      if (item.type === 'AAAAA') {
        // 正确写法
        let provinceName = item.tags.province; // 先取出当前项的省份名称
        if (!moduleTypeAAAAAProvince.value.some(province => province.text === provinceName)) {
          moduleTypeAAAAAProvince.value.push({ text: provinceName, value: provinceName })
        }
        item.province = provinceName
      }

    })
    pv.value = data.pv || 0
    participant.value = data.participant || 0
    itemListTotal.value = itemList.value.length
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
}


// 跳转卡片文字
const exportText = () => {

  // 统计信息
  exportTextContent.value = {
    name: moduleName.value,
    title: moduleTitle.value,
    yes: moduleTypeList.value[1] + ' ' + counts.value[1],
    want: moduleTypeList.value[2] + ' ' + counts.value[2],
    no: moduleTypeList.value[0] + ' ' + counts.value[0],
    itemList: []
  }

  filterStatus.value = 'all'
  dropdownValue.value = 'all'

  itemList.value.forEach((item) => {
    exportTextContent.value.itemList.push({
      name: item.name,
      markType: item.mark_type
    })
  })

  showExportTextPopup.value = true
}
// 保存到相册（预留接口）
const saveToAlbum = () => {
  // TODO: 保存到相册功能，需要后端接口支持
  showToast('保存到相册功能开发中')
}


const markItem = async (item, markType) => {
  await markApi.markItem(item.id, markType)
  item.mark_type = markType
}

onMounted(() => {
  moduleId.value = route.query.id || 0
  moduleName.value = route.query.name || '详情'
  moduleTitle.value = route.query.title || '详情'

  // 这里进行加载用户操作的名称，比如moduleid=1和2 ，都是想看。已看，未看，如果是3 就是想去，已去，未去，4 完成，未完成，想完成
  moduleTypeList.value = moduleTypeConfig.value[markStore.activeCategoryId] || []
  getItemList()
})
</script>

<style lang="scss" scoped>
.mark-detail-view {
  min-height: 100vh;
  padding-bottom: 24px;
  background: #f5f6f8;
}

.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
}

.nav-back {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.nav-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--black300);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #f0faf6;
}

.nav-action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #2d8f5f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.summary-card {
  margin: 12px 16px 0;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.summary-head {
  padding: 18px 16px 16px;
  background: linear-gradient(135deg, #2d8f5f 0%, #3cb371 100%);
  color: #fff;
}

.summary-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
}

.summary-meta {
  margin: 8px 0 0;
  font-size: 13px;
  opacity: 0.92;
}

.summary-body {
  padding: 16px;
}

.detail-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #eef8f3;
  color: #2d8f5f;
  font-size: 12px;
  line-height: 1.4;
}

.progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--black300);
}

.progress-percent {
  font-size: 13px;
  font-weight: 800;
  color: #2d8f5f;
}

.progress-track {
  height: 8px;
  border-radius: 999px;
  background: #e8edf0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8fd3b5 0%, #3cb371 100%);
  transition: width 0.3s ease;
}

.summary-stats {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  font-size: 12px;
  color: var(--gray500);
}

.detail-content {
  padding: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-chip {
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray500);
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    border-color: #2d6655;
    background: #2d6655;
    color: #fff;
  }
}

.poster-btn {
  width: 100%;
  margin-bottom: 12px;
  padding: 12px 16px;
  border: 1.5px dashed #3cb371;
  border-radius: 14px;
  background: #fff;
  color: #2d8f5f;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;

  &:active {
    opacity: 0.85;
  }
}

.poster-icon {
  font-size: 16px;
  line-height: 1;
}

.province-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .province-tag {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #e5e7eb;
    color: var(--gray500);

    &.active {
      background: #2d6655;
      color: #fff;
      border-color: #2d6655;

      .province-count {
        color: rgba(255, 255, 255, 0.85);
      }
    }

    .province-count {
      font-size: 11px;
      color: var(--gray500);
    }
  }
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 14px 12px 12px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.item-index {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  font-size: 11px;
  font-weight: 700;
  color: var(--black300);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-cover {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 14px;
  overflow: hidden;
  background: #e8f8ef;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item-name {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--black300);
  line-height: 1.3;

  &.is-clickable {
    cursor: pointer;
  }
}

.item-desc-wrap {
  flex: 1;
  margin-top: 6px;
}

.item-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--gray500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-rating {
  font-weight: 700;
  color: var(--black500);
}

.item-location {
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--gray500);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.action-btn {
  padding: 5px 14px;
  border-radius: 999px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &.action-want {
    background: #fff4e5;
    color: #e6a020;
  }

  &.action-done {
    background: #eef8f3;
    color: #2d8f5f;
  }
}

.mark-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;

  &.status-want {
    background: #fff4e5;
    color: #e6a020;
  }

  &.status-done {
    background: #eef8f3;
    color: #2d8f5f;
  }
}

:deep(.mark-back-top) {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #2d8f5f 0%, #3cb371 100%);
  box-shadow: 0 4px 14px rgba(45, 143, 95, 0.32);
  border: 2px solid rgba(255, 255, 255, 0.92);
  color: #fff;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
  }
}

.mark-back-top-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
}

.item-body .item-type-tags {
  margin-top: 8px;
  margin-bottom: 0;
  gap: 6px;

  .item-type-tag {
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
  }
}

/* AAAAA景区详情弹窗样式 */
.detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--white);
}

.detail-title {
  font-size: var(--rem-11);
  font-weight: 700;
  margin-bottom: 8px;
}

.detail-location {
  margin-bottom: 16px;
}

.stats-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .stat-card {
    flex: 1;
    background: var(--gray100);
    border-radius: 12px;
    padding: 12px;
    text-align: center;

    .stat-value {
      font-size: var(--rem-10);
      font-weight: 700;
    }

    .stat-label {
      font-size: var(--rem-7);
      margin-top: 4px;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;

  .info-item {
    background: var(--gray100);
    border-radius: 12px;
    padding: 12px;

    .info-label {
      font-size: var(--rem-7);
      margin-bottom: 4px;
    }

    .info-value {
      font-size: var(--rem-8);
      font-weight: 600;
    }
  }
}

/* hiking徒步弹窗样式 */
.hiking-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hiking-head {
  position: relative;
  padding: 16px;
  padding-top: 40px;

  .hiking-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%);
  }


  .hiking-content {
    position: relative;
    z-index: 1;
    color: #fff;
  }

  .hiking-title {
    font-size: var(--rem-12);
    font-weight: 700;
    margin-bottom: 8px;
  }

  .hiking-subtitle {
    display: flex;
    align-items: center;
    gap: 12px;

    .hiking-location {
      font-size: var(--rem-8);
      opacity: 0.9;
    }

    .difficulty-tag {
      background: rgba(59, 130, 246, 0.9);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: var(--rem-7);
      font-weight: 600;
    }
  }
}

.hiking-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--white);
}

.hiking-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  .hiking-stat-card {
    background: var(--gray100);
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;

    .stat-icon-wrapper {
      width: 36px;
      height: 36px;
      margin: 0 auto 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .stat-icon {
      width: 20px;
      height: 20px;
    }

    .stat-value {
      font-size: var(--rem-9);
      font-weight: 700;
      color: var(--black);
    }

    .stat-label {
      font-size: var(--rem-6);
      margin-top: 4px;
    }
  }
}

.hiking-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  .hiking-info-item {
    background: var(--gray100);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    .info-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.bg-yellow-light {
        background: rgba(253, 224, 71, 0.2);
        color: #ca8a04;
      }

      &.bg-pink-light {
        background: rgba(236, 72, 153, 0.1);
        color: #db2777;
      }
    }

    .info-icon {
      width: 18px;
      height: 18px;
    }

    .info-content {
      flex: 1;

      .info-label {
        font-size: var(--rem-6);
        margin-bottom: 2px;
      }

      .info-value {
        font-size: var(--rem-8);
        font-weight: 600;
      }
    }
  }
}

.item-type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;

  .item-type-tag {
    padding: 4px 8px;
    border-radius: 16px;
    font-size: var(--rem-7);
    font-weight: 500;

    // 自然景观类
    &.tag-purple {
      background: rgba(168, 85, 247, 0.15);
      color: #9333ea;
    }

    &.tag-green {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    &.tag-grass {
      background: rgba(21, 128, 61, 0.15);
      color: #15803d;
    }

    &.tag-desert {
      background: rgba(217, 119, 6, 0.15);
      color: #d97706;
    }

    &.tag-blue {
      background: rgba(20, 184, 166, 0.15);
      color: #14b8a6;
    }

    &.tag-forest {
      background: rgba(14, 165, 233, 0.15);
      color: #0ea5e9;
    }

    &.tag-lake {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }

    // 文化历史类
    &.tag-history {
      background: rgba(126, 34, 206, 0.15);
      color: #7e22ce;
    }

    &.tag-tibetan {
      background: rgba(236, 72, 153, 0.15);
      color: #ec4899;
    }

    // 难度等级类
    &.tag-easy {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    &.tag-medium {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    &.tag-hard {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    &.tag-extreme {
      background: rgba(17, 24, 39, 0.15);
      color: #111827;
    }

    // 特色标签
    &.tag-world {
      background: rgba(236, 72, 153, 0.15);
      color: #ec4899;
    }

    &.tag-secret {
      background: rgba(147, 51, 234, 0.15);
      color: #9333ea;
    }

    &.tag-sky {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }

    &.tag-gray {
      background: var(--gray100);
      color: var(--gray600);
    }

    // 景区类型标签样式
    &.tag-level-5a {
      background: #dbeafe;
      color: #1e40af;
    }

    &.tag-heritage {
      background: #fef3c7;
      color: #92400e;
    }

    &.tag-religion {
      background: #fce7f3;
      color: #9d174d;
    }

    &.tag-red {
      background: #fee2e2;
      color: #991b1b;
    }

    &.tag-natural {
      background: #d1fae5;
      color: #065f46;
    }

    &.tag-water {
      background: #e0f2fe;
      color: #075985;
    }

    &.tag-cultural {
      background: #fef3c7;
      color: #78350f;
    }

    &.tag-theme {
      background: #ede9fe;
      color: #5b21b6;
    }

    &.tag-other {
      background: #f3f4f6;
      color: #4b5563;
    }
  }
}

.hiking-description {
  background: var(--gray100);
  border-radius: 12px;
  padding: 12px;
  position: relative;

  .desc-line {
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 4px;
    background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
    border-radius: 2px;
  }

  .desc-text {
    font-size: var(--rem-7);
    line-height: 1.6;
    padding-left: 12px;
  }
}

/* 导出文字弹窗样式 */
.export-text-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--white);

  .export-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    font-size: 16px;
    font-weight: bold;
  }

  .export-content {
    flex: 1;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--gray100);
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;

    .item-tag {
      display: inline-block;
      white-space: nowrap;
    }
  }

  .export-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }
}
</style>
