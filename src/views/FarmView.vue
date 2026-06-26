<template>
  <div class="farm-game">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="back-btn" @click="$router.go(-1)">[返回]</div>
      </div>
      <div>
        <span class="nav-btn active">
          {{ userName }} -
          {{ globalStore.FARM_NAME }}
        </span>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <span class="text-gray500">等级</span>
        <span class="font-bold ml-4">Lv.{{ levelId }}</span>
      </div>
      <div class="status-item">
        <span class="text-gray500">修为</span>
        <span class="font-bold ml-4">{{ levelTitle }}</span>
      </div>
      <div class="status-item">
        <span class="text-gray500">经验</span>
        <span class="font-bold ml-4">{{ exp }}/{{ nextLevelExp }}</span>
      </div>
      <div class="status-item" v-for="walletAsset in walletAssets" :key="walletAsset.asset_id">
        <span class="text-gray500">{{ walletAsset.asset.name }}</span>
        <span class="font-bold ml-4">{{ walletAsset.balance }}</span>
      </div>
    </div>
    <!-- 经验进度条 -->
    <!-- <div class="exp-bar"> -->
    <!-- <div class="exp-fill" :style="{ width: expProgress + '%' }"></div> -->
    <!-- </div> -->



    <!-- 土地区域 -->
    <div class="land-section">
      <div class="section-tabs">
        <span class="tab-btn active">我的土地</span>
        <!-- <span class="tab-btn">我的池塘</span> -->
      </div>

      <!-- 土地列表 -->
      <div class="land-list">
        <div v-for="(land, index) in lands" :key="index" class="land-item">
          <!-- {{ land }} -->
          <span class="land-num">{{ index + 1 }}.</span>
          <span :class="[getLandLevelClass(land.level_id)]">[{{ land.level.short_name }}]</span>
          <span class="land-name">{{ landName(land, index) }}
            <van-count-down v-if="land.status === 1" class="inline-block text-gray500" @finish="onFinish(land.id)"
              :time="getTime(land.plant_mature_at)" format="HH:mm:ss" />
          </span>
          <span class="land-status">[{{ landStatus(land.status) }}]</span>
          <span v-if="land.status === 0" class="land-action" @click="sow(land.id)">播种</span>
          <span v-if="land.status === 1 || land.status === 3" class="land-action" @click="clearland(land.id)">铲除</span>
          <span v-if="land.status === 2" class="land-action" @click="harvest(land.id)">收获</span>
          <span v-if="land.status === 9" class="land-action" @click="switchTab('upgrade')">开垦</span>
        </div>
      </div>
    </div>

    <!-- 操作工具栏 -->
    <div class="tool-bar">
      <span class="tool-btn" @click="init()">刷新</span>
    </div>

    <!-- 功能选择区域 -->
    <div class="function-section">
      <div class="function-tabs">
        <span class="function-tab" :class="{ active: currentFunction === 'backpack' }" @click="switchTab('backpack')">
          背包种子
        </span>
        <span class="function-tab" :class="{ active: currentFunction === 'shop' }" @click="switchTab('shop')">
          种子商店
        </span>
        <span class="function-tab" :class="{ active: currentFunction === 'fruit' }" @click="switchTab('fruit')">
          仓库
        </span>
        <span class="function-tab" :class="{ active: currentFunction === 'upgrade' }" @click="switchTab('upgrade')">
          土地升级
        </span>
        <span class="function-tab" :class="{ active: currentFunction === 'market' }" @click="switchTab('market')">
          集市
        </span>
        <!-- <span class="function-tab" :class="{ active: currentFunction === 'tool' }" @click="switchTab('tool')">
          游戏工具
        </span>
        <span class="function-tab" :class="{ active: currentFunction === 'building' }" @click="switchTab('building')">
          特殊建筑
        </span>
        <span class="function-tab" :class="{ active: currentFunction === 'delivery' }" @click="switchTab('delivery')">
          配送工具
        </span> -->
      </div>
      <!-- 背包种子 -->
      <div v-if="currentFunction === 'backpack'" class="function-list">
        <!-- 种植模式提示 -->
        <div v-if="isPlantingMode" class="text-right">
          <span @click="cancelPlant">[取消]</span>
        </div>
        <div v-if="seedList.length > 0">
          <div v-for="seed in seedList" :key="seed.name" class="function-item">
            <span class="item-name">
              <IconFont :name="seed.handbook.icon" />
              {{ seed.handbook.name }}
              x {{ seed.num }}
            </span>
            <!-- 种植模式下显示种植按钮 -->
            <span v-if="isPlantingMode" @click="doPlant(seed.handbook_id)">[种植]</span>
          </div>
        </div>
        <!-- 空状态提示 -->
        <div v-else class="empty-tip">
          背包里什么都没有哦
        </div>
      </div>

      <!-- 商店内容 -->
      <div v-if="currentFunction === 'shop'" class="function-list">
        <div v-if="shops.length > 0">
          <div v-for="item in shops" :key="item.id" class="function-item">
            <span class="item-name" style="width: 70px;">
              <IconFont :name="item.handbook.icon" />
              {{ item.handbook.name }}
            </span>
            <span class="item-price">{{ item.handbook.price }}{{ item.handbook.asset.name }}</span>
            <span class="buy-btn" @click="buy(item)">购买</span>
          </div>
        </div>
        <div v-else class="empty-tip">
          商店暂时没有商品
        </div>
      </div>

      <!-- 仓库 -->
      <div v-if="currentFunction === 'fruit'" class="function-list">
        <div v-if="fruitList.length > 0">
          <div v-for="fruit in fruitList" :key="fruit.name" class="function-item">
            <span class="item-name">
              <IconFont :name="fruit.handbook.icon" />
              {{ fruit.handbook.name }}
              x {{ fruit.num }}
            </span>
          </div>
        </div>
        <div v-else class="empty-tip">
          仓库里什么都没有哦
        </div>
      </div>

      <!-- 土地升级内容 -->
      <div v-if="currentFunction === 'upgrade'" class="function-list">
        <div v-for="upgrade in landUpgradeInfo" :key="upgrade.id" class="upgrade-item">
          <span class="upgrade-name">{{ upgrade.name }}</span>
          <span class="upgrade-desc">{{ upgrade.desc }}</span>
          <span class="upgrade-cost">{{ upgrade.price }}灵石</span>
          <span class="upgrade-btn" @click="upgradeLand(upgrade)">{{ upgrade.bottom }}</span>
        </div>
      </div>

      <!-- 集市内容 -->
      <div v-if="currentFunction === 'market'" class="function-list">

        <!-- 目前解锁的集市订单 code... 这里可以显示当前解锁的集市订单 -->
        <!-- <div class="market-title">目前解锁的集市订单</div> -->
        <div v-if="marketList.length > 0">
          <div v-for="item in marketList" :key="item.id" class="market-item">
            <div>
              <span>[{{ item.farm_task.npc_name }}]</span>&nbsp;
              <span>{{ item.farm_task.name }}</span>
            </div>
            <div>{{ item.farm_task.description }}</div>
            <div>
              <span>需求：</span>
              <span v-for="value in item.farm_task.task_need" :key="value.asset_id">
                {{ handbooks[value.handbook_id] ?? '-' }} x{{ value.quantity }} &nbsp;
              </span>
            </div>
            <div>
              <span>奖励：</span>
              <span>经验 +{{ item.farm_task.reward_exp }}</span>&nbsp;
              <span>{{ item.farm_task.reward_asset.name }} +{{ item.farm_task.reward_gold }}</span>
            </div>
            <div>
              <span @click="deliverTask(item)" class="text-primary100">[交付]</span>&nbsp;
              <span @click="cancelTask(item)" class="text-primary100">[放弃]</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">
          暂无集市订单
        </div>
      </div>

      <!-- 工具内容 -->
      <!-- <div v-if="currentFunction === 'tool'" class="function-list">
        <div class="tool-item">
          <span class="tool-name">快速播种</span>
          <span class="tool-desc">一键播种所有空地</span>
        </div>
        <div class="tool-item">
          <span class="tool-name">一键铲除</span>
          <span class="tool-desc">铲除所有枯萎作物</span>
        </div>
        <div class="tool-item">
          <span class="tool-name">快速收获</span>
          <span class="tool-desc">一键收获所有成熟作物</span>
        </div>
        <div class="tool-item">
          <span class="tool-name">刷新数据</span>
          <span class="tool-desc">重新获取农场数据</span>
        </div>
      </div> -->


      <!-- 特殊建筑内容 -->
      <!-- <div v-if="currentFunction === 'building'" class="function-list">
        <div v-for="building in specialBuildings" :key="building.id" class="building-item">
          <span class="building-name">{{ building.name }}</span>
          <span class="building-desc">{{ building.desc }}</span>
          <span class="building-cost">{{ building.cost }}金币</span>
          <span class="building-btn" @click="buildBuilding(building)">建造</span>
        </div>
      </div> -->

      <!-- 配送工具内容 -->
      <!-- <div v-if="currentFunction === 'delivery'" class="function-list">
        <div v-for="tool in deliveryTools" :key="tool.id" class="delivery-item">
          <span class="delivery-name">{{ tool.name }}</span>
          <span class="delivery-desc">{{ tool.desc }}</span>
          <span class="delivery-cost">{{ tool.cost }}金币</span>
          <span class="delivery-btn" @click="buyDeliveryTool(tool)">购买</span>
        </div>
      </div> -->
    </div>

    <!-- 农场日志区域 -->
    <div class="log-section">
      <div class="log-list">
        <div v-for="log in farmLogs" :key="log.id" class="log-item">
          <span class="log-time">[{{ log.time }}]</span>
          <span>{{ log.detail }}</span>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="footer">
      ━━━━━━━━━━━━━━━━━━<br>
      纯文字农场 ｜ 2026 Self Youth
      ━━━━━━━━━━━━━━━━━━<br>
      测试开发中，数据后面会被清除
    </div>
  </div>

  <!-- 消息队列显示区域 -->
  <div class="message-queue">
    <transition-group name="toast">
      <div v-for="msg in messages" :key="msg.id"
        :class="['toast-item', `toast-${msg.type}`, { 'toast-leaving': !msg.visible }]">
        {{ msg.text }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGlobalStore } from '../stores/global'
import { useFarmStore } from '../stores/farm'

const globalStore = useGlobalStore()
const farmStore = useFarmStore()

// 功能标签持久化
const STORAGE_KEY = 'farm_active_tab'
const currentFunction = ref('backpack')
// 切换标签
const switchTab = (tab) => {
  currentFunction.value = tab
}

// 从 localStorage 恢复保存的标签
const loadSavedTab = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && ['backpack', 'shop', 'fruit', 'tool', 'market', 'upgrade', 'building', 'delivery'].includes(saved)) {
    currentFunction.value = saved
  }
}

// 保存当前标签到 localStorage
const saveCurrentTab = () => {
  localStorage.setItem(STORAGE_KEY, currentFunction.value)
}

// 监听标签变化，自动保存
watch(currentFunction, () => {
  saveCurrentTab()
})

// 消息队列系统
const messages = ref([])
let messageId = 0
// 种植模式状态
const isPlantingMode = ref(false)
const selectedLandId = ref(null)

//土地时间计算
const getTime = (time) => {
  const now = new Date()
  const targetTime = new Date(time)
  return Math.floor(targetTime.getTime() - now.getTime())
}

// 显示提示消息
const showToast = (msg) => {
  const id = ++messageId
  const message = typeof msg === 'string' ? msg : msg.message || '操作完成'
  const type = typeof msg === 'object' && msg.type ? msg.type : 'info'

  messages.value.unshift({
    id,
    text: message,
    type,
    visible: true
  })

  // 3秒后开始淡出
  setTimeout(() => {
    const index = messages.value.findIndex(m => m.id === id)
    if (index > -1) {
      messages.value[index].visible = false
      // 动画结束后移除消息
      setTimeout(() => {
        const idx = messages.value.findIndex(m => m.id === id)
        if (idx > -1) {
          messages.value.splice(idx, 1)
        }
      }, 500)
    }
  }, 3000)
}

// 增加经验并检查升级
const addExp = async (expValue, actionName = '') => {
  if (expValue <= 0) return

  // 显示经验增加提示
  showToast({ message: `${actionName}经验+${expValue}`, type: 'success' })

  // 更新用户经验
  userInfo.value.exp += expValue

  // 检查是否需要升级
  if (userInfo.value.exp >= nextLevelExp.value) {
    showToast({ message: '恭喜你升级了！', type: 'success' })
    // 重新获取用户信息
    await farmStore.fetchFarmInfo()
  }
}

// 资产变动函数（增加或扣除）
const updateAsset = async (assetId, amount, action = 'add') => {
  // 查找对应的资产
  const asset = walletAssets.value.find(a => a.asset_id === assetId)

  if (!asset) {
    console.error(`未找到资产 ID: ${assetId}`)
    return false
  }

  // 确保当前余额是数字
  const currentBalance = Number(asset.balance)
  const changeAmount = Number(amount)

  if (action === 'deduct') {
    // 扣除操作：检查余额是否足够
    if (currentBalance < changeAmount) {
      showToast({ message: `${asset.asset.name}不足`, type: 'warning' })
      return false
    }
    // 执行扣除
    asset.balance = currentBalance - changeAmount
    showToast({ message: `${asset.asset.name}-${changeAmount}`, type: 'info' })
  } else {
    // 增加操作
    asset.balance = currentBalance + changeAmount
    showToast({ message: `${asset.asset.name}+${changeAmount}`, type: 'success' })
  }

  return true
}

// 使用 computed 缓存常用值，减少重复访问
// const expProgress = computed(() => (exp.value / nextLevelExp.value * 100) || 0)
const userInfo = computed(() => farmStore.info || {})
const userName = computed(() => userInfo.value.user_name || '')
const levelId = computed(() => userInfo.value.level_id || 1)
const levelTitle = computed(() => userInfo.value.level_title || '')
const exp = computed(() => userInfo.value.exp || 0)
const handbooks = computed(() => userInfo.value.handbooks || [])
const nextLevelExp = computed(() => userInfo.value.next_level_exp || 100)
const walletAssets = computed(() => userInfo.value.wallet_assets || [])
const lands = computed(() => farmStore.lands || [])
const shops = computed(() => farmStore.shops || [])
const seedList = computed(() => farmStore.seedList || [])
const fruitList = computed(() => farmStore.fruitList || [])
const marketList = computed(() => farmStore.marketList || [])
const landUpgradeInfo = computed(() => farmStore.landUpgradeInfo || [])



// 交付集市任务
const deliverTask = async (task) => {
  try {
    await farmStore.deliverTask(task.id)

    // 增加经验和金币奖励
    await addExp(task.farm_task.reward_exp, '任务')
    await updateAsset(task.farm_task.reward_asset_id, task.farm_task.reward_gold, 'add')

    // 刷新仓库
    await farmStore.fetchWarehouseList('fruit')

    showToast({ message: '任务完成！', type: 'success' })
  } catch (error) {
    showToast({ message: error || '交付失败', type: 'error' })
  }
}

// 放弃集市任务
const cancelTask = async (task) => {
  try {
    // 执行放弃
    await farmStore.cancelTask(task.id)
    showToast({ message: '已放弃任务', type: 'info' })
  } catch (error) {
    showToast({ message: '操作失败' + error, type: 'error' })
  }
}

// 返回土地名称
const landName = (land, index) => {
  switch (land.status) {
    case 0:
      return '土地' + (index + 1)
    case 1:
      return land.handbook.name + '【' + land.quarter + '/' + land.handbook.quarter + '季】'
    case 2:
      return land.handbook.name + '【产出' + land.residue_output + '/' + land.total_output + '】【' + land.quarter + '/' + land.handbook.quarter + '季】'
    case 3:
      return land.handbook.name + '-枯萎'
    case 9:
      return '土地' + (index + 1)
    default:
      return ''
  }
}

// 返回土地级别对应的CSS类名
const getLandLevelClass = (level_id) => {
  switch (level_id) {
    case 2:
      return 'land-level-red'
    case 3:
      return 'land-level-gold'
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

// 农场日志数据
const farmLogs = ref([
  { id: 1, time: '06:00', detail: '【系统】新的一天开始了' },
])

// 土地升级数据
// const landUpgrades = ref([
//   { id: 1, name: '普通土地', desc: '适合种植普通作物', cost: 0, 'bottom': '开垦' },
//   { id: 2, name: '红土地', desc: '可产量提升20%，可种植高级作物', cost: 500, 'bottom': '升级' },
//   { id: 3, name: '金土地', desc: '可产量提升50%，生长速度加快', cost: 1000, 'bottom': '升级' },
// ])

// 特殊建筑数据
// const specialBuildings = ref([
//   { id: 1, name: '仓库', desc: '增加种子和作物存储上限', cost: 300 },
//   { id: 2, name: '温室', desc: '冬季作物也能正常生长', cost: 800 },
//   { id: 3, name: '灌溉系统', desc: '自动浇水，减少枯萎概率', cost: 600 },
//   { id: 4, name: '加工坊', desc: '将作物加工成高价值产品', cost: 1200 },
// ])

// // 配送工具数据
// const deliveryTools = ref([
//   { id: 1, name: '手推车', desc: '基础配送，速度较慢', cost: 100 },
//   { id: 2, name: '自行车', desc: '配送速度提升50%', cost: 300 },
//   { id: 3, name: '电动车', desc: '配送速度提升100%', cost: 800 },
//   { id: 4, name: '无人机', desc: '自动配送，无需人工', cost: 1500 },
// ])


// 刷新土地数据
const onFinish = async (land_id) => {
  await farmStore.LandRefresh(land_id)
}

// 点击播种
const sow = (id) => {
  // 切换到背包tab
  switchTab('backpack')
  // 进入种植模式
  isPlantingMode.value = true
  selectedLandId.value = id
}
// 执行种植
const doPlant = async (handbook_id) => {
  if (!selectedLandId.value) {
    showToast({ message: '请先选择土地', type: 'warning' })
    return
  }

  // 找到对应的土地
  const land = lands.value.find(l => l.id === selectedLandId.value)
  if (!land) {
    showToast({ message: '土地不存在', type: 'error' })
    return
  }

  // 如果不是空闲土地，不允许种植
  if (land.status !== 0) {
    showToast({ message: '该土地不是空闲状态', type: 'warning' })
    isPlantingMode.value = false
    selectedLandId.value = null
    return
  }

  await farmStore.plant({ handbook_id: handbook_id, land_id: selectedLandId.value })

  // 更新该背包种子-1
  const index = seedList.value.findIndex(seed => seed.handbook_id === handbook_id);
  if (index !== -1) {
    const seed = seedList.value[index];
    seed.num--;
    if (seed.num <= 0) {
      seedList.value.splice(index, 1); // 删除该种子
    }
  }

  // 增加种植经验
  await addExp(userInfo.value.default_exp.plant, '种植')

  // 退出种植模式
  isPlantingMode.value = false
  selectedLandId.value = null
}

// 取消种植
const cancelPlant = () => {
  isPlantingMode.value = false
  selectedLandId.value = null
}

// 点击铲除
const clearland = async (id) => {
  // 判断土地是否生长中状态
  const land = lands.value.find(l => l.id === id)
  if (land.status == 2) {
    return
  }
  // 调用移除土地接口
  farmStore.landRemove({ land_id: id })
  // 增加铲除土地经验
  await addExp(userInfo.value.default_exp.shovel, '铲除土地')
}

// 点击收获
const harvest = async (id) => {
  await farmStore.LandHarvest(id)

  await farmStore.fetchWarehouseList('fruit') // 初始化水果仓库信息
}

// 点击购买
const buy = async (item) => {
  try {
    const num = 1

    // 先扣除金币
    const deducted = await updateAsset(item.handbook.asset_id, num * item.handbook.price, 'deduct')
    if (!deducted) {
      return // 余额不足，已在 updateAsset 中提示
    }

    const result = await farmStore.shopBuy(item, num)
    if (result.success) {
      // 刷新背包数据
      await farmStore.fetchWarehouseList('seed')
    } else {
      // 购买失败，回滚金币
      await updateAsset(item.handbook.asset_id, num * item.handbook.price, 'add')
    }
  } catch (error) {
    // 失败时回滚金币
    await updateAsset(item.handbook.asset_id, item.handbook.price, 'add')
    showToast({ message: error || '购买失败', type: 'error' })
  }
}

// 土地升级
const upgradeLand = async (upgrade) => {
  try {
    // 先扣除金币
    const deducted = await updateAsset(1, upgrade.price, 'deduct')
    if (!deducted) {
      return // 余额不足，已在 updateAsset 中提示
    }

    await farmStore.upgradeLand(upgrade.upgrade_type)
    showToast({ message: `土地${upgrade.bottom}成功`, type: 'success' })

    // 刷新土地升级信息
    await farmStore.getLandUpgradeInfo()
  } catch (error) {
    // 失败时回滚金币
    await updateAsset(1, upgrade.price, 'add')
    showToast({ message: error || '土地升级/开垦失败', type: 'error' })
  }
}

// // 建造特殊建筑
// const buildBuilding = (building) => {
//   showToast({ message: `建造${building.name}需要${building.cost}金币`, type: 'info' })
// }

// // 购买配送工具
// const buyDeliveryTool = (tool) => {
//   showToast({ message: `购买${tool.name}需要${tool.cost}金币`, type: 'info' })
// }
const init = async () => {
  await farmStore.fetchFarmInfo() // 初始化农场信息
  await farmStore.fetchLands() // 初始化土地信息
  await farmStore.fetchShops() // 初始化商店信息
  await farmStore.fetchWarehouseList('seed') // 初始化种子仓库信息
  await farmStore.fetchWarehouseList('fruit') // 初始化水果仓库信息
  await farmStore.fetchMarketList() // 初始化集市列表信息
  await farmStore.getLandUpgradeInfo() // 初始化土地升级/开垦信息
}

onMounted(async () => {
  loadSavedTab() // 恢复保存的标签
  await init()
})
</script>

<style scoped>
.farm-game {
  min-height: 100vh;
  background-color: var(--black100);
  color: var(--white);
  padding: 6px;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 12px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  background: var(--black100);
  margin-bottom: 8px;
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
  padding: 6px;
  background: var(--black100);
  /* border: 1px solid var(--gray500); */
  margin-bottom: 8px;
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

/* 土地 */

.land-section {
  margin-bottom: 8px;
}

.land-level-red {
  color: var(--land-level-red);
}

.land-level-gold {
  color: var(--land-level-gold);
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
  padding: 6px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  border-bottom: none;
}

.backpack-list,
.shop-list {
  border: 1px solid var(--gray500);
  padding: 6px;
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

.item-desc {
  color: var(--gray500);
  font-size: 12px;
  margin-left: 10px;
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

/* 功能选择区域样式 */
.function-section {
  margin-bottom: 8px;
}

.function-tabs {
  display: flex;
  padding: 3px 6px;
  background: var(--black100);
  border: 1px solid var(--gray500);
  border-bottom: none;
  overflow-x: auto;
  white-space: nowrap;
}

.function-tab {
  color: var(--gray500);
  cursor: pointer;
  padding: 6px 12px;
  min-width: 60px;
  text-align: center;
  user-select: none;
  flex-shrink: 0;
}

.function-tab.active {
  color: var(--white);
  font-weight: bold;
}

.function-tab:hover {
  color: var(--primary100);
}

.function-list {
  border: 1px solid var(--gray500);
  padding: 10px;
  height: 200px;
  /* 固定高度，避免切换时页面抖动 */
  overflow-y: auto;
}

.function-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed var(--gray500);
}

/* 空状态提示 */
.empty-tip {
  text-align: center;
  color: var(--gray500);
  padding: 20px 0;
  font-size: 12px;
}


/* 工具项样式 */
.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed var(--gray500);
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-name {
  color: var(--white);
  font-weight: bold;
  min-width: 80px;
}

.tool-desc {
  flex: 1;
  color: var(--gray500);
  font-size: 12px;
  margin-left: 10px;
}

.tool-bar {
  display: flex;
  background: var(--black100);
  border: 1px solid var(--gray500);
  margin-bottom: 8px;
}

.tool-btn {
  color: var(--primary100);
  padding: 5px 10px;
}


/* 土地升级样式 */
.upgrade-item,
.building-item,
.delivery-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed var(--gray500);
  gap: 6px;
}

.upgrade-item:last-child,
.building-item:last-child,
.delivery-item:last-child {
  border-bottom: none;
}

/* 集市订单样式 */
.market-item {
  border: 1px solid var(--gray500);
  padding: 6px;
  margin-bottom: 4px;
}

.upgrade-name,
.building-name,
.delivery-name {
  color: var(--white);
  min-width: 60px;
}

.upgrade-desc,
.building-desc,
.delivery-desc {
  color: var(--gray500);
  font-size: 12px;
  flex: 1;
}

/* 农场日志区域样式 */
.log-section {
  padding: 6px;
  border: 1px solid var(--gray500);
  max-height: 160px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
  border-bottom: 1px solid #2a2a2a;
  font-size: 12px;
}

.log-time {
  min-width: 35px;
  color: var(--gray500);
}

/* 消息队列样式 */
.message-queue {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 80%;
  max-width: 320px;
  pointer-events: none;
}

.toast-item {
  background: rgba(0, 0, 0, 0.85);
  color: var(--white);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-left: 3px solid var(--primary100);
}

.toast-info {
  border-left-color: var(--primary100);
}

.toast-success {
  border-left-color: #5ad8a6;
}

.toast-warning {
  border-left-color: #f6bd16;
}

.toast-error {
  border-left-color: #e8684a;
}

/* 动画效果 */
.toast-enter-active {
  animation: toast-in 0.2s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}


/* 页脚样式 */
.footer {
  text-align: center;
  padding: 6px;
  color: var(--gray500);
  font-size: 12px;
}
</style>
