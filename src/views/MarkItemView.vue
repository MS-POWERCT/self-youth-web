<template>
  <div class="mark-detail-view bg-gray300">
    <van-nav-bar
      :title="moduleName"
      left-arrow
      @click-left="$router.go(-1)"
    />
    <div class="bg-white radius-bottom-12 p-8">
      <br/>
      <!-- <div class="text28 font-bold">{{ moduleName }}</div> -->
      <div class="text-16 ml-8">{{ moduleTitle }}</div>
      <ProgressBar
        :current="itemListCurrent"
        :total="itemListTotal"
        label="已看进度"
      />
    </div>
    <div class="p-8">
      <div class="filter-tabs text-12">
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 'all' }"
          @click="filterStatus = 'all'"
        >
          全部 ({{ counts.all }})
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 0 }"
          @click="filterStatus = 0"
        >
          {{ moduleTypeList[2] }} ({{ counts[0] }})
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 1 }"
          @click="filterStatus = 1"
        >
          {{ moduleTypeList[0] }} ({{ counts[1] }})
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 2 }"
          @click="filterStatus = 2"
        >
          {{ moduleTypeList[1] }} ({{ counts[2] }})
        </div>
      </div>

      <div v-for="(item, index) in filteredList" :key="item.id" class="text-gray700 bg-white radius-12 mb-8 p-8 text-16 flex items-center justify-between">
        <div class="flex items-center">
          <van-image
            radius="8"
            width="65"
            lazy-load
            loading-icon="photo-o"
            :src="item.img_url"
          />
          <div class="item-name text-16 ml-8" :class="{ 'small-font': item.title.length > 8 }">
            <div>
              {{ (index + 1) + '.' + item.title }}
              <svg class="icon" aria-hidden="true" @click="handleCopy(item.title)">
                <use xlink:href="#icon-fuzhi" />
              </svg>
            </div>
            <!-- 根据不同类型显示不同 -->
            <div class="item-desc mt-16 text-12">
              <!-- 评分 -->
              <div v-if="item.star > 0" class="font-bold">{{ item.star_ }}</div>
              <div v-if="item.desc" @click="itemDescClick(item.desc)">{{ item.desc_ }}</div>
            </div>
          </div>
        </div>

        <div v-if="item.mark_type == 0" class="mr-2">
          <div class="item-btn text-12 text-white bg-yellow-gold" @click="markItem(item, 1)">{{ moduleTypeList[0] }}</div>
          <div class="item-btn text-12 text-white bg-primary" @click="markItem(item, 2)">{{ moduleTypeList[1] }}</div>
        </div>
        <div v-else class="mr-2 text-12">
          <!-- 可以删除 使用一个不太明显的x图标 -->
          <span v-if="item.mark_type === 1" class="text-bold text-yellow-gold">
            {{ moduleTypeList[0] }}
            <van-icon name="close" class="text-yellow-gold" @click="markItem(item, 0)" size="16"/>
          </span>
          <span v-else class="text-bold text-primary">
            {{ moduleTypeList[1] }}
            <van-icon name="close" class="text-primary" @click="markItem(item, 0)" size="16"/>
          </span>

        </div>
      </div>



      <van-back-top right="42%" bottom="10vh">
        <IconifyIcon icon="glyphs:arrow-bold" width="24" />
      </van-back-top>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NavBar as VanNavBar, showToast } from 'vant'
import { useMarkStore } from '../stores/mark'
import { markApi } from '../api/mark'
import { copyToClipboard } from '@/utils/common'
import ProgressBar from '@/components/tools/ProgressBar.vue'

const markStore = useMarkStore()
const route = useRoute()

const moduleId = ref(0)
const moduleName = ref('')
const moduleTitle = ref('')
const moduleTypeList = ref([])
const moduleTypeConfig = ref({
  1 : [
    '想看',
    '已看',
    '未看',
  ],
  2 : [
    '想看',
    '已看',
    '未看',
  ],
  3 : [
    '想去',
    '已去',
    '未去',
  ],
  4 : [
    '想完成',
    '已完成',
    '未完成',
  ],
})

const pv = ref(0)
const participant = ref(0)
const itemList = ref([])
const itemListCurrent = ref(0)
const itemListTotal = ref(0)
const filterStatus = ref('all')


const counts = computed(() => {
  return {
    all: itemList.value.length,
    0: itemList.value.filter(item => item.mark_type === 0).length,
    1: itemList.value.filter(item => item.mark_type === 1).length,
    2: itemList.value.filter(item => item.mark_type === 2).length
  }
})

const filteredList = computed(() => {
  if (filterStatus.value === 'all') {
    return itemList.value
  }
  return itemList.value.filter(item => item.mark_type === filterStatus.value)
})

// const getRankText = (index, title) => {
//   if (index === 0) return '🥇.' + title
//   if (index === 1) return '🥈.' + title
//   if (index === 2) return '🥉.' + title
//   return index + 1 + '.' + title
// }

const handleCopy = (title) => {
  copyToClipboard(title)
  console.log('复制成功')
}

const itemDescClick = (desc) => {
  showToast(desc);
}

const getItemList = async () => {
  try {
     const data = await markStore.fetchItemList(moduleId.value)
     itemList.value = data.list || []
    //  处理desc最多14个字符
    itemList.value.forEach(item => {
      if (item.desc && item.desc.length > 12) {
        item.desc_ = item.desc.substring(0, 12) + '..'
      }else{
        item.desc_ = item.desc
      }
      // 如果type=default 则显示默认图标
      if (item.type === 'video') {
        // 处理评分增加豆瓣:
        item.star_ = '豆瓣:' + item.star
      }
    })
     pv.value = data.pv || 0
     participant.value = data.participant || 0
    itemListTotal.value = itemList.value.length
    itemListCurrent.value = itemList.value.filter(item => item.mark_type == 2).length
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
}

const markItem = async (item, markType) => {
  await markApi.markItem(item.id, markType)
  item.mark_type = markType
  // 刷新进度条
  itemListCurrent.value = itemList.value.filter(item => item.mark_type == 2).length
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
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  overflow-x: auto;
}

.filter-tab {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: var(--primary);
    color: var(--white);
  }
}


.item-desc{
  display: flex;
  align-items: center;
  gap: 8px;

}

.item-btn {
  border-radius: 4px;
  font-weight: 600;
  padding: 2px 6px;
  margin-top: 6px;
}


.im{
  width: 80px;
  border-radius: 12px;
}

</style>
