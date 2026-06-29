<template>
  <div class="farm-new">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left" @click="$router.go(-1)">
        <IconifyIcon icon="iconamoon:arrow-left-2-thin" width="24" />
      </div>
      <div class="header-title">
        <span class="title-text">{{ userName }}</span>
        <span class="title-sub">{{ globalStore.FARM_NAME }}</span>
      </div>
      <div class="header-right">
        <IconifyIcon icon="ic:outline-notifications-none" width="22" />
      </div>
    </div>

    <!-- 状态栏卡片 -->
    <div class="status-card">
      <div class="status-top">
        <div class="level-info">
          <div class="level-badge">
            <span class="level-num">Lv.{{ levelId }}</span>
          </div>
          <div class="level-detail">
            <div class="level-title">{{ levelTitle }}</div>
            <div class="exp-text">{{ exp }} / {{ nextLevelExp }}</div>
          </div>
        </div>
        <div class="wallet-info">
          <div v-for="walletAsset in walletAssets" :key="walletAsset.asset_id" class="wallet-item">
            <IconifyIcon v-if="walletAsset.asset_id === 1" icon="game-icons:gold-coin" width="20" class="coin-icon" />
            <IconifyIcon v-else icon="ph:gem" width="20" class="gem-icon" />
            <span class="wallet-num">{{ walletAsset.balance }}</span>
          </div>
        </div>
      </div>
      <div class="exp-bar-container">
        <div class="exp-bar-bg">
          <div class="exp-bar-fill" :style="{ width: expProgress + '%' }">
            <div class="exp-bar-glow"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告栏 -->
    <div v-if="notice" class="notice-bar">
      <IconifyIcon icon="solar:megaphone-bold-duotone" width="16" class="notice-icon" />
      <span class="notice-text">{{ notice }}</span>
    </div>

    <!-- 配送状态浮动面板 -->
    <div v-if="hasDeliveryingTools.length > 0" class="delivery-panel">
      <div v-for="tool in hasDeliveryingTools" :key="tool.id" class="delivery-card">
        <div class="delivery-icon">
          <IconifyIcon :icon="tool.icon" width="22" />
        </div>
        <div class="delivery-content">
          <div class="delivery-top">
            <span class="delivery-name">{{ tool.name }}</span>
            <span class="delivery-count">{{ tool.delivery_record.num }}件</span>
          </div>
          <div class="delivery-mid">
            <span class="delivery-item">{{ tool.delivery_record.handbook?.name }}</span>
            <span class="delivery-reward">+{{ tool.delivery_record.amount }}{{
              tool.delivery_record.handbook?.selling_asset_name || '灵石' }}</span>
          </div>
          <div class="delivery-bottom">
            <van-count-down v-if="tool.delivery_record.status === 0"
              :time="getDeliveryTime(tool.delivery_record.end_at)" format="mm:ss" class="delivery-time"
              @finish="onDeliveryFinish(tool)" />
            <span v-else class="delivery-done">已完成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 土地区域 -->
    <div class="land-section">
      <div class="section-header">
        <div class="section-title">
          <IconifyIcon icon="mdi:grass" width="20" class="title-icon" />
          <span>我的土地</span>
        </div>
        <div class="section-actions">
          <span class="action-btn" @click="init()">
            <IconifyIcon icon="mdi:refresh" width="14" />
            刷新
          </span>
          <span class="action-btn" @click="clearAll()">
            <IconifyIcon icon="mdi:shovel" width="14" />
            铲除
          </span>
          <span v-if="isChoiceMode" class="action-btn primary" @click="sowAll()">
            <IconifyIcon icon="mdi:sprout" width="14" />
            播种
          </span>
        </div>
      </div>

      <div class="land-grid">
        <div v-for="(land, index) in lands" :key="index"
          :class="['land-card', `land-status-${land.status}`, `land-level-${land.level_id}`]"
          @click="handleLandClick(land, index)">
          <div class="land-num">{{ index + 1 }}</div>
          <div class="land-icon">
            <IconFont v-if="land.status === 1 || land.status === 2" :name="land.handbook.icon" />
            <IconifyIcon v-else-if="land.status === 0" icon="mdi:soil" width="28" />
            <IconifyIcon v-else-if="land.status === 3" icon="mdi:sprout-off" width="28" />
            <IconifyIcon v-else-if="land.status === 9" icon="mdi:lock-outline" width="28" />
          </div>
          <div class="land-info">
            <div class="land-name">{{ getLandDisplayName(land, index) }}</div>
            <div class="land-status-text">{{ landStatusText(land.status) }}</div>
            <van-count-down v-if="land.status === 1" :time="getTime(land.plant_mature_at)" format="HH:mm:ss"
              class="countdown" @finish="onFinish(land.id)" />
          </div>
          <div class="land-badge" v-if="land.status === 2">
            <IconifyIcon icon="mdi:check-circle" width="16" />
          </div>
        </div>
      </div>
    </div>

    <!-- 功能区域 -->
    <div class="function-section">
      <div class="function-tabs">
        <div v-for="tab in tabs" :key="tab.key" :class="['function-tab', { active: currentFunction === tab.key }]"
          @click="switchTab(tab.key)">
          <IconifyIcon :icon="tab.icon" width="18" />
          <span>{{ tab.name }}</span>
        </div>
      </div>

      <div class="function-content">
        <!-- 背包种子 -->
        <div v-if="currentFunction === 'backpack'" class="content-panel">
          <div class="panel-header">
            <span v-if="isChoiceMode" class="selected-tip">
              已选择 <b>{{ selectedHandbookName }}</b>
              <span class="cancel-btn" @click="cancelChoice">取消</span>
            </span>
            <span v-else class="panel-tip">选择种子进行种植</span>
          </div>
          <div v-if="seedList.length > 0" class="item-grid">
            <div v-for="seed in seedList" :key="seed.name"
              :class="['item-card', { active: selectedHandbookId === seed.handbook_id }]"
              @click="doChoice(seed.handbook_id, seed.handbook.name)">
              <div class="item-icon">
                <IconFont :name="seed.handbook.icon" />
              </div>
              <div class="item-name">{{ seed.handbook.name }}</div>
              <div class="item-count">x{{ seed.num }}</div>
            </div>
          </div>
          <div v-else class="empty-state">
            <IconifyIcon icon="mdi:package-variant-closed" width="48" class="empty-icon" />
            <span>背包空空如也</span>
          </div>
        </div>

        <!-- 种子商店 -->
        <div v-if="currentFunction === 'shop'" class="content-panel">
          <div class="panel-header">
            <span class="panel-tip">商店每日有折扣</span>
          </div>
          <div v-if="shops.length > 0" class="item-list">
            <div v-for="item in shops" :key="item.id" class="shop-item">
              <div class="shop-icon">
                <IconFont :name="item.handbook.icon" />
              </div>
              <div class="shop-info">
                <div class="shop-name">{{ item.handbook.name }}</div>
                <div class="shop-price">
                  <IconifyIcon icon="game-icons:gold-coin" width="14" />
                  {{ item.handbook.price }}
                </div>
              </div>
              <button class="buy-btn" @click="buy(item)">
                购买
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <IconifyIcon icon="mdi:store-off" width="48" class="empty-icon" />
            <span>暂无商品</span>
          </div>
        </div>

        <!-- 仓库 -->
        <div v-if="currentFunction === 'fruit'" class="content-panel">
          <div class="panel-header">
            <span class="panel-tip">
              仓库 {{ warehouseUse }} / {{ warehouseSize }}
            </span>
            <span v-if="nextExtendPrice > 0" class="extend-btn" @click="extendWarehouse">
              扩充 +{{ nextExtendSize }}
            </span>
          </div>
          <div v-if="fruitList.length > 0" class="item-grid">
            <div v-for="fruit in fruitList" :key="fruit.name" class="item-card" v-t="fruit">
              <div class="item-icon">
                <IconFont :name="fruit.handbook.icon" />
              </div>
              <div class="item-name">{{ fruit.handbook.name }}</div>
              <div class="item-count">x{{ fruit.num }}</div>
              <div v-if="isHaveDeliveryTool" class="delivery-btn" @click.stop="clickDelivery(fruit)">
                <IconifyIcon icon="mdi:truck-fast-outline" width="14" />
                送货
              </div>
              <!-- 配送工具浮动列表 -->
              <div v-if="showDeliveryPopup && selectedFruit?.handbook_id === fruit.handbook_id" class="delivery-float">
                <div v-for="tool in availableDeliveryTools" :key="tool.id" class="float-item"
                  @click.stop="selectDeliveryTool(tool)">
                  <IconifyIcon :icon="tool.icon" width="18" />
                  <span>{{ tool.name }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <IconifyIcon icon="mdi:warehouse" width="48" class="empty-icon" />
            <span>仓库空空如也</span>
          </div>
        </div>

        <!-- 土地升级 -->
        <div v-if="currentFunction === 'upgrade'" class="content-panel">
          <div class="panel-header">
            <span class="panel-tip">升级土地提高产量</span>
          </div>
          <div v-if="landUpgradeInfo.length > 0" class="upgrade-list">
            <div v-for="upgrade in landUpgradeInfo" :key="upgrade.id" class="upgrade-card">
              <div class="upgrade-icon">
                <IconifyIcon
                  :icon="upgrade.upgrade_type === 'add' ? 'mdi:plus-box-multiple-outline' : 'mdi:arrow-up-bold-circle-outline'"
                  width="28" />
              </div>
              <div class="upgrade-info">
                <div class="upgrade-name">{{ upgrade.name }}</div>
                <div class="upgrade-desc">{{ upgrade.desc }}</div>
              </div>
              <div class="upgrade-action">
                <div class="upgrade-cost">
                  <IconifyIcon icon="game-icons:gold-coin" width="14" />
                  {{ upgrade.price }}
                </div>
                <button class="upgrade-btn" @click="upgradeLand(upgrade)">{{ upgrade.bottom }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 集市 -->
        <div v-if="currentFunction === 'market'" class="content-panel">
          <div class="panel-header">
            <span class="panel-tip">
              刷新倒计时：
              <van-count-down :time="marketRefreshTime" format="HH:mm:ss" class="countdown-inline"
                @finish="onMarketRefreshFinish" />
            </span>
          </div>
          <div v-if="marketList.length > 0" class="market-list">
            <div v-for="item in marketList" :key="item.id" class="market-card">
              <div class="market-header">
                <div class="market-npc">
                  <IconifyIcon icon="mdi:account-circle-outline" width="18" />
                  {{ item.farm_task.npc_name }}
                </div>
                <span :class="['quality-badge', `quality-${item.farm_task.quality_type}`]">
                  {{ item.farm_task.quality_type_name }}
                </span>
              </div>
              <div class="market-name">{{ item.farm_task.name }}</div>
              <div class="market-desc">{{ item.farm_task.description }}</div>
              <div class="market-need">
                <span class="label">需求：</span>
                <span v-for="value in item.farm_task.task_need" :key="value.asset_id" class="need-item">
                  {{ handbooks[value.handbook_id] }} x{{ value.quantity }}
                </span>
              </div>
              <div class="market-reward">
                <span class="label">奖励：</span>
                <span class="reward-item">
                  <IconifyIcon icon="mdi:star-four-points-outline" width="12" />
                  经验+{{ item.farm_task.reward_exp }}
                </span>
                <span class="reward-item">
                  <IconifyIcon icon="game-icons:gold-coin" width="12" />
                  {{ item.farm_task.reward_asset.name }}+{{ item.farm_task.reward_gold }}
                </span>
              </div>
              <div class="market-actions">
                <span class="market-btn" @click="deliverTask(item)">交付</span>
                <span class="market-btn cancel" @click="cancelTask(item)">放弃</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <IconifyIcon icon="mdi:storefront-outline" width="48" class="empty-icon" />
            <span>暂无集市订单</span>
          </div>
        </div>

        <!-- 特殊建筑 -->
        <div v-if="currentFunction === 'building'" class="content-panel">
          <div class="building-card">
            <div class="building-header">
              <div class="building-icon">
                <IconifyIcon icon="streamline-emojis:christmas-tree" width="48" />
              </div>
              <div class="building-info">
                <div class="building-name">世界树</div>
                <div class="building-desc">每日点击获得祝福</div>
              </div>
              <button v-if="worldTree.is_click === 0" class="bless-btn" @click="clickWorldTree">
                获得祝福
              </button>
              <span v-else class="blessed">已祝福</span>
            </div>
            <div class="building-stats">
              <div class="stat-item">
                <div class="stat-label">每次奖励</div>
                <div class="stat-value">
                  <span>
                    <IconifyIcon icon="mdi:star-four-points-outline" width="14" /> +{{ worldTree.exp }}
                  </span>
                  <span>
                    <IconifyIcon icon="game-icons:gold-coin" width="14" /> +{{ worldTree.gold }}
                  </span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">累计奖励</div>
                <div class="stat-value">
                  <span>
                    <IconifyIcon icon="mdi:star-four-points-outline" width="14" /> +{{ worldTree.total_exp }}
                  </span>
                  <span>
                    <IconifyIcon icon="game-icons:gold-coin" width="14" /> +{{ worldTree.total_gold }}
                  </span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">祝福次数</div>
                <div class="stat-value">{{ worldTree.click_count }} 次</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 配送工具 -->
        <div v-if="currentFunction === 'delivery'" class="content-panel">
          <div class="panel-header">
            <span class="panel-tip">购买配送工具自动收益</span>
          </div>
          <div v-if="deliveryTools.length > 0" class="delivery-tool-list">
            <div v-for="tool in deliveryTools" :key="tool.id"
              :class="['tool-card', { owned: tool.is_have === 1, delivering: tool.is_delivery === 1 }]">
              <div class="tool-icon">
                <IconifyIcon :icon="tool.icon" width="36" />
              </div>
              <div class="tool-info">
                <div class="tool-name">
                  {{ tool.name }}
                  <span v-if="tool.is_have === 1" class="owned-tag">已拥有</span>
                </div>
                <div class="tool-stats">
                  <span>容量 {{ tool.capacity }}</span>
                  <span>{{ tool.delivery_time }}分钟</span>
                </div>
              </div>
              <div v-if="tool.is_have === 0" class="tool-buy">
                <div class="tool-price">
                  <IconifyIcon icon="game-icons:gold-coin" width="14" />
                  {{ tool.price }}
                </div>
                <div class="tool-level">Lv.{{ tool.level_id }} 解锁</div>
                <button class="buy-tool-btn" @click="buyDeliveryTool(tool)">购买</button>
              </div>
              <div v-else-if="tool.is_delivery === 1" class="tool-delivering">
                <IconifyIcon icon="mdi:truck-fast" width="20" class="delivering-icon" />
                <span>配送中</span>
              </div>
              <div v-else class="tool-idle">
                <IconifyIcon icon="mdi:check-circle" width="20" />
                <span>空闲</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="msg in messages" :key="msg.id"
          :class="['toast-item', `toast-${msg.type}`, { 'toast-leaving': !msg.visible }]">
          <IconifyIcon v-if="msg.type === 'success'" icon="mdi:check-circle" width="16" />
          <IconifyIcon v-else-if="msg.type === 'error'" icon="mdi:alert-circle" width="16" />
          <IconifyIcon v-else-if="msg.type === 'warning'" icon="mdi:alert" width="16" />
          <IconifyIcon v-else icon="mdi:information" width="16" />
          <span>{{ msg.text }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGlobalStore } from '../stores/global'
import { useFarmStore } from '../stores/farm'

const globalStore = useGlobalStore()
const farmStore = useFarmStore()

// 通知栏
const notice = ref('【公告】欢迎来到修仙农场，每日签到世界树可获得经验和灵石，集市任务奖励丰厚哦')

// 标签配置
const tabs = [
  { key: 'backpack', name: '背包', icon: 'mdi:bag-personal-outline' },
  { key: 'shop', name: '商店', icon: 'mdi:store-outline' },
  { key: 'fruit', name: '仓库', icon: 'mdi:warehouse' },
  { key: 'upgrade', name: '升级', icon: 'mdi:trending-up' },
  { key: 'market', name: '集市', icon: 'mdi:storefront-outline' },
  { key: 'building', name: '建筑', icon: 'mdi:storefront-outline' },
  { key: 'delivery', name: '配送', icon: 'mdi:truck-outline' },
]

// 功能标签持久化
const STORAGE_KEY = 'farm_new_active_tab'
const currentFunction = ref('backpack')

const switchTab = (tab) => {
  currentFunction.value = tab
}

const loadSavedTab = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && tabs.map(t => t.key).includes(saved)) {
    currentFunction.value = saved
  }
}

const saveCurrentTab = () => {
  localStorage.setItem(STORAGE_KEY, currentFunction.value)
}

watch(currentFunction, () => {
  saveCurrentTab()
})

// 消息队列系统
const messages = ref([])
let messageId = 0

// 送货模式状态
const showDeliveryPopup = ref(false)
const selectedFruit = ref(null)

const clickDelivery = (fruit) => {
  if (showDeliveryPopup.value && selectedFruit.value?.handbook_id === fruit.handbook_id) {
    showDeliveryPopup.value = false
    selectedFruit.value = null
  } else {
    selectedFruit.value = fruit
    showDeliveryPopup.value = true
  }
}

const availableDeliveryTools = computed(() => {
  return deliveryTools.value.filter(tool => tool.is_have === 1 && tool.is_delivery !== 1)
})

const selectDeliveryTool = async (tool) => {
  if (!selectedFruit.value) return

  try {
    await farmStore.useDeliveryTool(tool.id, selectedFruit.value.handbook_id)
    showToast({ message: `开始配送${selectedFruit.value.handbook.name}！`, type: 'success' })
    showDeliveryPopup.value = false
    selectedFruit.value = null
    await farmStore.getDeliveryToolList()
    await farmStore.fetchWarehouseList('fruit')
  } catch (error) {
    showToast({ message: error || '配送失败', type: 'error' })
  }
}

const selectedLandId = ref(null)
const isChoiceMode = ref(false)
const selectedHandbookId = ref(null)
const selectedHandbookName = ref(null)

// 集市刷新时间
const getMarketRefreshTime = () => {
  const now = new Date()
  const refreshHours = [12, 24]
  let minDiff = Infinity

  for (const hour of refreshHours) {
    const target = new Date()
    if (hour === 24) {
      target.setDate(target.getDate() + 1)
      target.setHours(0, 0, 0, 0)
    } else {
      target.setHours(hour, 0, 0, 0)
    }
    const diff = target.getTime() - now.getTime()
    if (diff > 0 && diff < minDiff) {
      minDiff = diff
    }
  }

  return minDiff > 0 ? minDiff : 0
}

const marketRefreshTime = ref(getMarketRefreshTime())

const onMarketRefreshFinish = async () => {
  await farmStore.fetchMarketList()
  marketRefreshTime.value = getMarketRefreshTime()
}

// 时间计算
const getTime = (time) => {
  const now = new Date()
  const targetTime = new Date(time)
  return Math.floor(targetTime.getTime() - now.getTime())
}

const getDeliveryTime = (time) => {
  const now = new Date()
  const targetTime = new Date(time)
  const diff = Math.floor(targetTime.getTime() - now.getTime())
  return diff > 0 ? diff : 0
}

// 配送完成处理
const completedDeliveries = new Set()

const settleDelivery = async (tool) => {
  const recordId = tool.delivery_record?.id

  if (completedDeliveries.has(recordId)) {
    return
  }
  completedDeliveries.add(recordId)

  updateAsset(tool.delivery_record.handbook?.selling_asset_id, tool.delivery_record.amount, 'add')
  await farmStore.updateDeliveryRecord(tool.delivery_record.id)
  showToast({ message: `配送${tool.delivery_record.handbook?.name}*${tool.delivery_record.num}完成！`, type: 'success' })
}

const onDeliveryFinish = async (tool) => {
  await settleDelivery(tool)
}

let deliveryCheckTimer = null

const checkTimeoutDeliveries = () => {
  deliveryTools.value.forEach(tool => {
    if (tool.is_delivery === 1 && tool.delivery_record) {
      const remainingTime = getTime(tool.delivery_record.end_at)
      if (remainingTime <= 0 && tool.delivery_record.status === 0) {
        settleDelivery(tool)
      }
    }
  })
}

const startDeliveryCheck = () => {
  if (deliveryCheckTimer) return
  deliveryCheckTimer = setInterval(() => {
    checkTimeoutDeliveries()
  }, 1000)
}

const stopDeliveryCheck = () => {
  if (deliveryCheckTimer) {
    clearInterval(deliveryCheckTimer)
    deliveryCheckTimer = null
  }
}

// 消息提示
const showToast = (msg) => {
  const id = ++messageId
  const message = typeof msg === 'string' ? msg : msg.message || '操作完成'
  const type = typeof msg === 'object' && msg.type ? msg.type : 'info'

  messages.value.push({
    id,
    text: message,
    type,
    visible: true
  })

  setTimeout(() => {
    const index = messages.value.findIndex(m => m.id === id)
    if (index > -1) {
      messages.value[index].visible = false
      setTimeout(() => {
        const idx = messages.value.findIndex(m => m.id === id)
        if (idx > -1) {
          messages.value.splice(idx, 1)
        }
      }, 300)
    }
  }, 2500)
}

// 经验增加
const addExp = async (expValue, actionName = '') => {
  if (expValue <= 0) return
  showToast({ message: `${actionName}经验+${expValue}`, type: 'success' })
  userInfo.value.exp += expValue

  if (userInfo.value.exp >= nextLevelExp.value) {
    showToast({ message: '恭喜你升级了！', type: 'success' })
    await farmStore.fetchFarmInfo()
  }
}

// 资产变动
const updateAsset = async (assetId, amount, action = 'add') => {
  const asset = walletAssets.value.find(a => a.asset_id === assetId)

  if (!asset) {
    console.error(`未找到资产 ID: ${assetId}`)
    return false
  }

  const currentBalance = Number(asset.balance)
  const changeAmount = Number(amount)

  if (action === 'deduct') {
    if (currentBalance < changeAmount) {
      showToast({ message: `${asset.asset.name}不足`, type: 'warning' })
      return false
    }
    asset.balance = currentBalance - changeAmount
    showToast({ message: `${asset.asset.name}-${changeAmount}`, type: 'info' })
  } else {
    asset.balance = currentBalance + changeAmount
    showToast({ message: `${asset.asset.name}+${changeAmount}`, type: 'success' })
  }

  return true
}

// 计算属性
const expProgress = computed(() => (exp.value / nextLevelExp.value * 100) || 0)
const userInfo = computed(() => farmStore.info || {})
const userName = computed(() => userInfo.value.user_name || '')
const levelId = computed(() => userInfo.value.level_id || 1)
const levelTitle = computed(() => userInfo.value.level_title || '')
const exp = computed(() => userInfo.value.exp || 0)
const handbooks = computed(() => userInfo.value.handbooks || [])
const nextLevelExp = computed(() => userInfo.value.next_level_exp || 100)
const walletAssets = computed(() => userInfo.value.wallet_assets || [])
const warehouseSize = computed(() => userInfo.value.warehouse_size || 0)
const warehouseUse = computed(() => userInfo.value.warehouse_use || 0)
const nextExtendPrice = computed(() => userInfo.value.next_extend_price || 0)
const nextExtendSize = computed(() => userInfo.value.next_extend_size || 0)
const lands = computed(() => farmStore.lands || [])
const shops = computed(() => farmStore.shops || [])
const seedList = computed(() => farmStore.seedList || [])
const fruitList = computed(() => farmStore.fruitList || [])
const marketList = computed(() => farmStore.marketList || [])
const landUpgradeInfo = computed(() => farmStore.landUpgradeInfo || [])
const specialInfo = computed(() => farmStore.specialInfo || {})
const worldTree = computed(() => specialInfo.value.world_tree || {})
const deliveryTools = computed(() => farmStore.deliveryToolList || [])
const isHaveDeliveryTool = computed(() => farmStore.isHaveDeliveryTool || false)
const hasDeliveryingTools = computed(() => {
  return deliveryTools.value.filter(tool => tool.is_delivery === 1 && tool.delivery_record)
})

// 世界树
const clickWorldTree = async () => {
  try {
    await farmStore.clickWorldTree()
    await addExp(worldTree.value.exp, '世界树')
    await updateAsset(1, worldTree.value.gold, 'add')
    showToast({ message: '获得世界树的祝福！', type: 'success' })
    await farmStore.getSpecialInfo()
  } catch (error) {
    showToast({ message: error || '点击世界树失败', type: 'error' })
  }
}

// 集市任务
const deliverTask = async (task) => {
  try {
    await farmStore.deliverTask(task.id)
    await addExp(task.farm_task.reward_exp, '任务')
    await updateAsset(task.farm_task.reward_asset_id, task.farm_task.reward_gold, 'add')
    await farmStore.fetchWarehouseList('fruit')
    showToast({ message: '任务完成！', type: 'success' })
  } catch (error) {
    showToast({ message: error || '交付失败', type: 'error' })
  }
}

const cancelTask = async (task) => {
  try {
    await farmStore.cancelTask(task.id)
    showToast({ message: '已放弃任务', type: 'info' })
  } catch (error) {
    showToast({ message: '操作失败' + error, type: 'error' })
  }
}

// 土地相关
const getLandDisplayName = (land) => {
  switch (land.status) {
    case 0:
      return '空地'
    case 1:
      return land.handbook.name
    case 2:
      return land.handbook.name
    case 3:
      return land.handbook.name
    case 9:
      return '未开垦'
    default:
      return ''
  }
}

const landStatusText = (status) => {
  switch (status) {
    case 0:
      return '空闲'
    case 1:
      return '生长中'
    case 2:
      return '可收获'
    case 3:
      return '已枯萎'
    case 9:
      return '待开垦'
    default:
      return ''
  }
}

const handleLandClick = (land) => {
  if (land.status === 0) {
    sow(land.id)
  } else if (land.status === 2) {
    harvest(land)
  } else if (land.status === 1 || land.status === 3) {
    clearland(land.id)
  } else if (land.status === 9) {
    switchTab('upgrade')
  }
}

const onFinish = async (land_id) => {
  await farmStore.LandRefresh(land_id)
}

const sow = (id) => {
  switchTab('backpack')
  if (isChoiceMode.value) {
    selectedLandId.value = id
    doPlant(selectedHandbookId.value)
    return
  }
}

const sowAll = async () => {
  if (!isChoiceMode.value) return

  const seed = seedList.value.find(s => s.handbook_id === selectedHandbookId.value)
  if (!seed) {
    showToast({ message: '该种子已用完', type: 'error' })
    return
  }

  const emptyLands = lands.value.filter(l => l.status === 0)
  const seedCount = seed.num
  const plantCount = Math.min(seedCount, emptyLands.length)

  if (plantCount === 0) {
    showToast({ message: '没有可种植的土地', type: 'warning' })
    return
  }

  for (let i = 0; i < plantCount; i++) {
    selectedLandId.value = emptyLands[i].id
    await doPlant(selectedHandbookId.value)
  }

  showToast({ message: `成功种植${plantCount}块地！`, type: 'success' })
}

const doPlant = async (handbook_id) => {
  if (!selectedLandId.value) {
    showToast({ message: '请先选择土地', type: 'warning' })
    return
  }

  const land = lands.value.find(l => l.id === selectedLandId.value)
  if (!land) {
    showToast({ message: '土地不存在', type: 'error' })
    return
  }

  if (land.status !== 0) {
    showToast({ message: '该土地不是空闲状态', type: 'warning' })
    return
  }

  await farmStore.plant({ handbook_id: handbook_id, land_id: selectedLandId.value })

  const index = seedList.value.findIndex(seed => seed.handbook_id === handbook_id);
  if (index !== -1) {
    const seed = seedList.value[index];
    seed.num--;
    if (seed.num <= 0) {
      seedList.value.splice(index, 1);
      cancelChoice()
    }
  }

  await addExp(userInfo.value.default_exp.plant, '种植')
}

const doChoice = async (handbook_id, handbook_name) => {
  selectedHandbookId.value = handbook_id
  selectedHandbookName.value = handbook_name
  isChoiceMode.value = true
}

const cancelChoice = () => {
  isChoiceMode.value = false
  selectedHandbookId.value = null
  selectedHandbookName.value = null
}

const clearland = async (id) => {
  const land = lands.value.find(l => l.id === id)
  if (land.status == 2) {
    return
  }
  farmStore.landRemove({ land_id: id })
  await addExp(userInfo.value.default_exp.shovel, '铲除土地')
}

const clearAll = async () => {
  const growingLands = lands.value.filter(l => l.status === 1 || l.status === 3)
  if (growingLands.length === 0) {
    showToast({ message: '没有可铲除的土地', type: 'warning' })
    return
  }

  for (let i = 0; i < growingLands.length; i++) {
    clearland(growingLands[i].id)
  }

  showToast({ message: `成功铲除${growingLands.length}块地！`, type: 'success' })
}

const harvest = async (land) => {
  try {
    await farmStore.LandHarvest(land.id)
    await farmStore.fetchWarehouseList('fruit')
    showToast({ message: `收获成功，获得${land.residue_output}个${land.handbook.name}`, type: 'success' })
    await addExp(land.handbook.quarter_exp, `收获${land.handbook.name}`)
  } catch (error) {
    showToast({ message: error || '收获失败', type: 'error' })
  }
}

// 购买
const buy = async (item) => {
  const num = 1
  const spent = num * item.handbook.price
  try {
    const deducted = await updateAsset(item.handbook.asset_id, spent, 'deduct')
    if (!deducted) {
      return
    }

    const result = await farmStore.shopBuy(item, num)
    if (result.success) {
      await farmStore.fetchWarehouseList('seed')
      showToast({ message: `购买${item.handbook.name}成功`, type: 'success' })
    } else {
      await updateAsset(item.handbook.asset_id, spent, 'add')
    }
  } catch (error) {
    await updateAsset(item.handbook.asset_id, spent, 'add')
    showToast({ message: error || '购买失败', type: 'error' })
  }
}

// 土地升级
const upgradeLand = async (upgrade) => {
  try {
    const deducted = await updateAsset(1, upgrade.price, 'deduct')
    if (!deducted) {
      return
    }

    await farmStore.upgradeLand(upgrade.upgrade_type)
    showToast({ message: `土地${upgrade.bottom}成功`, type: 'success' })
    await farmStore.getLandUpgradeInfo()
  } catch (error) {
    await updateAsset(1, upgrade.price, 'add')
    showToast({ message: error || '土地升级/开垦失败', type: 'error' })
  }
}

// 扩充仓库
const extendWarehouse = async () => {
  try {
    const deducted = await updateAsset(1, nextExtendPrice.value, 'deduct')
    if (!deducted) {
      return
    }

    await farmStore.extendWarehouse()
    showToast({ message: `仓库扩充成功，新增${nextExtendSize.value}个位置`, type: 'success' })
    await farmStore.fetchFarmInfo()
    await farmStore.fetchWarehouseList('fruit')
  } catch (error) {
    await updateAsset(1, nextExtendPrice.value, 'add')
    showToast({ message: error || '仓库扩充失败', type: 'error' })
  }
}

// 购买配送工具
const buyDeliveryTool = async (tool) => {
  if (levelId.value < tool.level_id) {
    showToast({ message: `需要达到 Lv.${tool.level_id} 才能购买`, type: 'error' })
    return
  }

  const deducted = await updateAsset(tool.asset_id, tool.price, 'deduct')
  if (!deducted) {
    return
  }

  try {
    await farmStore.buyDeliveryTool(tool.id)
    showToast({ message: `购买${tool.name}成功！`, type: 'success' })
    await farmStore.getDeliveryToolList()
  } catch (error) {
    await updateAsset(tool.asset_id, tool.price, 'add')
    showToast({ message: error || '购买配送工具失败', type: 'error' })
  }
}

// 初始化
const init = async () => {
  await farmStore.fetchFarmInfo()
  await farmStore.fetchLands()
  await farmStore.fetchShops()
  await farmStore.fetchWarehouseList('seed')
  await farmStore.fetchWarehouseList('fruit')
  await farmStore.fetchMarketList()
  await farmStore.getLandUpgradeInfo()
  await farmStore.getSpecialInfo()
  await farmStore.getDeliveryToolList()
  startDeliveryCheck()
}

onMounted(async () => {
  loadSavedTab()
  await init()
})

onUnmounted(() => {
  stopDeliveryCheck()
})
</script>

<style scoped>
.farm-new {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  padding-bottom: 20px;
  font-size: 13px;
}

/* 顶部导航 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  padding-top: calc(16px + env(safe-area-inset-top));
}

.header-left,
.header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-title {
  text-align: center;
}

.title-text {
  display: block;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #00d4ff, #7b2cbf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

/* 状态卡片 */
.status-card {
  margin: 8px 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(20px);
}

.status-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.level-num {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.level-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.exp-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wallet-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.coin-icon {
  color: #ffd700;
}

.gem-icon {
  color: #00d4ff;
}

.wallet-num {
  min-width: 60px;
  text-align: right;
}

/* 经验条 */
.exp-bar-container {
  width: 100%;
}

.exp-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff 0%, #7b2cbf 100%);
  border-radius: 3px;
  position: relative;
  transition: width 0.5s ease;
}

.exp-bar-glow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, transparent 70%);
  filter: blur(4px);
}

/* 公告栏 */
.notice-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 16px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.05) 100%);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.notice-icon {
  color: #ffc107;
  flex-shrink: 0;
}

.notice-text {
  font-size: 12px;
  color: #ffc107;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 配送面板 */
.delivery-panel {
  position: fixed;
  left: 12px;
  top: 200px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.delivery-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 10px 12px;
  backdrop-filter: blur(10px);
  min-width: 130px;
}

.delivery-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.delivery-content {
  flex: 1;
}

.delivery-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
}

.delivery-count {
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
  font-size: 11px;
}

.delivery-mid {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
}

.delivery-reward {
  color: #ffd700;
}

.delivery-bottom {
  margin-top: 4px;
}

.delivery-time {
  font-size: 11px;
  color: #10b981;
}

.delivery-done {
  font-size: 11px;
  color: #10b981;
}

/* 土地区域 */
.land-section {
  margin: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.title-icon {
  color: #10b981;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

/* 土地网格 */
.land-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.land-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.land-card:active {
  transform: scale(0.95);
}

.land-card.land-status-0 {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(139, 69, 19, 0.1) 100%);
  border-color: rgba(139, 69, 19, 0.3);
}

.land-card.land-status-1 {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
  border-color: rgba(34, 197, 94, 0.25);
}

.land-card.land-status-2 {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
  border-color: rgba(251, 191, 36, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

.land-card.land-status-3 {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.05) 100%);
  border-color: rgba(107, 114, 128, 0.25);
  opacity: 0.7;
}

.land-card.land-status-9 {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%);
  border-color: rgba(255, 255, 255, 0.05);
}

.land-card.land-level-2 {
  border-color: rgba(239, 68, 68, 0.4);
}

.land-card.land-level-3 {
  border-color: rgba(255, 215, 0, 0.4);
}

@keyframes pulse-glow {

  0%,
  100% {
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
  }

  50% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  }
}

.land-num {
  position: absolute;
  top: 8px;
  left: 10px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.land-icon {
  font-size: 28px;
  margin-bottom: 8px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.land-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.land-name {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.land-status-text {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.countdown {
  font-size: 10px;
  color: #10b981;
  margin-top: 2px;
}

.land-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  color: #fbbf24;
}

/* 功能区域 */
.function-section {
  margin: 16px;
}

.function-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.function-tab {
  flex: 1;
  min-width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.function-tab.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(123, 44, 191, 0.2) 100%);
  color: #00d4ff;
}

.function-tab:active {
  transform: scale(0.95);
}

/* 内容面板 */
.content-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
  min-height: 200px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.selected-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.selected-tip b {
  color: #00d4ff;
}

.cancel-btn {
  margin-left: 8px;
  color: #ef4444;
  cursor: pointer;
}

.extend-btn {
  font-size: 11px;
  color: #00d4ff;
  cursor: pointer;
}

/* 物品网格 */
.item-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.item-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.item-card:active {
  transform: scale(0.95);
}

.item-card.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(123, 44, 191, 0.2) 100%);
  border-color: rgba(0, 212, 255, 0.5);
}

.item-icon {
  font-size: 24px;
  margin-bottom: 6px;
  height: 28px;
}

.item-name {
  font-size: 11px;
  color: #fff;
  margin-bottom: 2px;
}

.item-count {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.delivery-btn {
  margin-top: 6px;
  font-size: 10px;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

/* 配送浮动列表 */
.delivery-float {
  position: right;
  top: 0;
  right: 100%;
  margin-right: 8px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
  min-width: 80px;
}

.float-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #fff;
  cursor: pointer;
}

.float-item:hover {
  background: rgba(0, 212, 255, 0.2);
}

/* 商店列表 */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.shop-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.shop-price {
  font-size: 12px;
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 4px;
}

.buy-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.buy-btn:active {
  transform: scale(0.95);
}

/* 升级列表 */
.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upgrade-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.upgrade-info {
  flex: 1;
}

.upgrade-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.upgrade-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.upgrade-action {
  text-align: right;
}

.upgrade-cost {
  font-size: 12px;
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 6px;
}

.upgrade-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.upgrade-btn:active {
  transform: scale(0.95);
}

/* 集市列表 */
.market-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.market-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.market-npc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.quality-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.quality-1 {
  background: rgba(107, 114, 128, 0.3);
  color: #9ca3af;
}

.quality-2 {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.quality-3 {
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.market-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.market-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.market-need,
.market-reward {
  font-size: 11px;
  margin-bottom: 4px;
}

.label {
  color: rgba(255, 255, 255, 0.5);
}

.need-item {
  color: #fff;
}

.reward-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;
  color: #fbbf24;
}

.market-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.market-btn {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.market-btn.cancel {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.market-btn:active {
  transform: scale(0.98);
}

.countdown-inline {
  display: inline-block;
  color: #00d4ff;
}

/* 世界树建筑 */
.building-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.building-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.building-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.building-info {
  flex: 1;
}

.building-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.building-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.bless-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.bless-btn:active {
  transform: scale(0.95);
}

.blessed {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.building-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.stat-value {
  font-size: 12px;
  color: #fff;
  display: flex;
  gap: 12px;
}

.stat-value span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 配送工具列表 */
.delivery-tool-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tool-card.owned {
  border-color: rgba(16, 185, 129, 0.3);
}

.tool-card.delivering {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.tool-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.owned-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-radius: 10px;
  font-weight: normal;
}

.tool-stats {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  gap: 12px;
}

.tool-buy {
  text-align: right;
}

.tool-price {
  font-size: 13px;
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 4px;
}

.tool-level {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.buy-tool-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.buy-tool-btn:active {
  transform: scale(0.95);
}

.tool-delivering,
.tool-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.tool-delivering {
  color: #60a5fa;
}

.delivering-icon {
  animation: truck-move 1s ease-in-out infinite;
}

@keyframes truck-move {

  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(3px);
  }
}

.tool-idle {
  color: #10b981;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

.empty-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Toast 消息 */
.toast-container {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 10px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  border-left: 3px solid #6b7280;
}

.toast-item.toast-success {
  border-left-color: #10b981;
}

.toast-item.toast-error {
  border-left-color: #ef4444;
}

.toast-item.toast-warning {
  border-left-color: #f59e0b;
}

.toast-item.toast-info {
  border-left-color: #3b82f6;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
