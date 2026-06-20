<template>
  <div class="farm-game">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="back-btn" @click="$router.go(-1)">[返回]</div>
      </div>
      <div class="nav-right">
        <span class="nav-btn active">
          {{ userName }} -
          {{ globalStore.FARM_NAME }}
        </span>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <span class="label">等级:</span>
        <span class="value">{{ levelId }}</span>
      </div>
      <div class="status-item">
        <span class="label">修为:</span>
        <span class="text-yellow-gold">{{ levelTitle }}</span>
      </div>
      <div class="status-item">
        <span class="label">经验:</span>
        <span class="value">{{ exp }}/{{ nextLevelExp }}</span>
      </div>
    </div>
    <!-- 资产拦 -->
    <div class="status-bar">
      <div class="status-item" v-for="walletAsset in walletAssets" :key="walletAsset.asset_id">
        <span class="label">{{ walletAsset.asset.name }}:</span>
        <span class="value">{{ walletAsset.balance }}</span>
      </div>
    </div>
    <!-- 经验进度条 -->
    <div class="exp-bar">
      <div class="exp-fill" :style="{ width: expProgress + '%' }"></div>
    </div>

    <!-- 操作工具栏 -->
    <div class="tool-bar">
      <span class="tool-btn" @click="refresh">刷新</span>
      <span class="tool-btn" @click="reclaim">开垦</span>
      <!-- <span class="tool-btn" @click="clearAll">一键铲除</span>
      <span class="tool-btn" @click="sowAll">播种</span> -->
    </div>

    <!-- 土地区域 -->
    <div class="land-section">
      <div class="section-tabs">
        <span class="tab-btn active">我的土地</span>
        <!-- <span class="tab-btn">我的池塘</span> -->
      </div>

      <!-- 土地列表 -->
      <div class="land-list">
        <div v-for="(land, index) in lands" :key="index" class="land-item">
          <span class="land-num">{{ land.id }}.</span>
          <span>[{{ land.level.short_name }}]</span>
          <span class="land-name">{{ landName(land, index) }}</span>
          <span class="land-status">[{{ landStatus(land.status) }}]</span>
          <span v-if="land.status === 0" class="land-action" @click="sow(land.id)">播种</span>
          <span v-if="land.status === 1" class="land-action" @click="clear(land.id)">铲除</span>
          <span v-if="land.status === 2" class="land-action" @click="harvest(land.id)">收获</span>
          <span v-if="land.status === 9">荒凉</span>
        </div>
      </div>
    </div>

    <!-- 背包 -->
    <div class="backpack-section">
      <div class="section-title">◆ 我的背包 ◆</div>
      <div class="backpack-list">
        <div v-for="seed in seeds" :key="seed.name" class="backpack-item">
          <span class="seed-name">{{ seed.name }}</span>
          <span class="seed-count">数量: {{ seed.count }}</span>
        </div>
      </div>
    </div>

    <!-- 商店 -->
    <div class="shop-section">
      <div class="section-title">◆ 商店 ◆</div>
      <div class="shop-list">
        <div v-for="item in shopItems" :key="item.name" class="shop-item">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-price">{{ item.price }}金币</span>
          <span class="buy-btn" @click="buy(item)">购买</span>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="footer">
      ━━━━━━━━━━━━━━━━━━<br>
      QQ农场风格 | 2011经典版
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useGlobalStore } from '../stores/global'
import { useFarmStore } from '../stores/farm'

const globalStore = useGlobalStore()
const farmStore = useFarmStore()

// 使用 computed 缓存常用值，减少重复访问
const userInfo = computed(() => farmStore.info || {})
const userName = computed(() => userInfo.value.user_name || '')
const levelId = computed(() => userInfo.value.level_id || 1)
const levelTitle = computed(() => userInfo.value.level_title || '')
const exp = computed(() => userInfo.value.exp || 0)
const nextLevelExp = computed(() => userInfo.value.next_level_exp || 100)
const walletAssets = computed(() => userInfo.value.wallet_assets || [])
const expProgress = computed(() => (exp.value / nextLevelExp.value * 100) || 0)

// const lands = ref([
//   { id: 1, type: '红', name: '土地1', status: '枯萎的作物' },
//   { id: 2, type: '红', name: '土地2', status: '空地' },
//   { id: 3, type: '红', name: '土地3', status: '空地' },
//   { id: 4, type: '红', name: '土地4', status: '空地' },
//   { id: 5, type: '红', name: '土地5', status: '空地' },
//   { id: 6, type: '红', name: '土地6', status: '空地' },
//   { id: 7, type: '红', name: '土地7', status: '空地' },
//   { id: 8, type: '红', name: '土地8', status: '空地' },
//   { id: 9, type: '', name: '土地9', status: '空地' },
//   { id: 10, type: '', name: '土地10', status: '空地' },
// ])
const lands = computed(() => farmStore.lands || [])

// 返回土地名称
const landName = (land, index) => {
  switch (land.status) {
    case 0:
      return '土地' + (index + 1)
    case 1:
      return '生长中'
    case 2:
      return '成熟待收获'
    case 3:
      return '枯萎的作物'
    case 9:
      return '土地' + (index + 1)
    default:
      return ''
  }
}
// 返回土地的状态
const landStatus = (status) => {
  switch (status) {
    case 0:
      return '空闲'
    case 1:
      return '生长中'
    case 2:
      return '成熟待收获'
    case 3:
      return '枯萎的作物'
    case 9:
      return '待开垦'
    default:
      return '未知状态'
  }
}



const seeds = ref([
  { name: '小麦种子', count: 0 },
  { name: '玉米种子', count: 0 },
  { name: '番茄种子', count: 0 },
  { name: '西瓜种子', count: 0 },
  { name: '草莓种子', count: 0 },
])

const shopItems = ref([
  { name: '小麦种子', price: 10 },
  { name: '玉米种子', price: 20 },
  { name: '番茄种子', price: 30 },
  { name: '西瓜种子', price: 50 },
  { name: '草莓种子', price: 80 },
])

const refresh = () => {
  showToast('已刷新')
}
// 开垦土地
const reclaim = () => {
  showToast('已扩建所有待开垦土地')
}

// const clearAll = () => {
//   lands.value.forEach(l => {
//     if (l.status === '枯萎的作物') {
//       l.status = '空地'
//     }
//   })
//   showToast('已铲除所有枯萎作物')
// }

// const sowAll = () => {
//   lands.value.forEach(l => {
//     if (l.status === '空地') {
//       l.status = '生长中'
//     }
//   })
//   showToast('已播种所有空地')
// }

// const sow = (id) => {
//   const land = lands.value.find(l => l.id === id)
//   if (land) {
//     land.status = '生长中'
//     showToast(`土地${id}已播种`)
//   }
// }

// const clear = (id) => {
//   const land = lands.value.find(l => l.id === id)
//   if (land) {
//     land.status = '空地'
//     showToast(`土地${id}已铲除`)
//   }
// }

// const harvest = (id) => {
//   const land = lands.value.find(l => l.id === id)
//   if (land) {
//     land.status = '空地'
//     showToast(`收获成功！+10金币 +5经验`)
//   }
// }

const buy = (item) => {
  const seed = seeds.value.find(s => s.name === item.name)
  if (seed) seed.count++
}
onMounted(async () => {
  await farmStore.fetchFarmInfo() // 初始化农场信息
  await farmStore.fetchLands() // 初始化土地信息
})
</script>

<style scoped>
.farm-game {
  min-height: 100vh;
  background-color: var(--black100);
  color: var(--white);
  padding: 10px;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  margin-bottom: 6px;
}

.nav-btn {
  color: var(--gray500);
  cursor: pointer;
  padding: 5px 15px;
}

.nav-btn.active {
  font-weight: bold;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  margin-bottom: 6px;
}

.status-item {
  display: flex;
  gap: 5px;
}

.label {
  color: var(--gray500);
}

.value {
  color: var(--white);
}

.exp-bar {
  height: 10px;
  background: var(--black300);
  border: 1px solid var(--gray500);
  margin-bottom: 6px;
}

.exp-fill {
  height: 100%;
  background: var(--primary100);
  transition: width 0.3s;
}

.tool-bar {
  display: flex;
  gap: 15px;
  padding: 10px 15px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  margin-bottom: 15px;
}

.tool-btn {
  color: var(--primary100);
  cursor: pointer;
}

.tool-btn:hover {
  text-decoration: underline;
}

.land-section {
  margin-bottom: 20px;
}

.section-tabs {
  display: flex;
  gap: 20px;
  padding: 10px 15px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  border-bottom: none;
}

.tab-btn {
  color: var(--gray500);
  cursor: pointer;
}

.tab-btn.active {
  color: var(--white);
  font-weight: bold;
}

.land-list {
  border: 1px solid var(--gray500);
}

.land-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px dashed var(--gray500);
  gap: 8px;
}

.land-item:last-child {
  border-bottom: none;
}

.land-num {
  width: 12px;
  color: var(--gray500);
}

.land-name {
  flex: 1;
  color: var(--white);
}

.land-status {
  color: var(--gray500);
}

.land-action {
  color: var(--primary100);
  cursor: pointer;
}

.land-action:hover {
  text-decoration: underline;
  color: var(--primary100)
}

.section-title {
  color: var(--gray500);
  text-align: center;
  padding: 10px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  border-bottom: none;
}

.backpack-list,
.shop-list {
  border: 1px solid var(--gray500);
  padding: 10px;
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 5px;
}

.backpack-item,
.shop-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--gray500);
}

.backpack-item:last-child,
.shop-item:last-child {
  border-bottom: none;
}

.seed-name,
.item-name {
  color: var(--white);
}

.seed-count,
.item-price {
  color: var(--gray500);
}

.buy-btn {
  color: var(--primary100);
  cursor: pointer;
}

.buy-btn:hover {
  text-decoration: underline;
}

.footer {
  text-align: center;
  padding: 20px;
  color: var(--gray500);
  font-size: 12px;
}
</style>
