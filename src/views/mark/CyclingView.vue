<template>
  <van-nav-bar title="中国骑行路线 TOP20" class="bg-gray300" left-arrow @click-left="$router.go(-1)" />
  <div class="cycling-view">
    <div class="header">
      <h1>🚴 中国骑行路线 <span>TOP20</span></h1>
      <p>用车轮丈量祖国大地，每一条路线都是一段人生风景</p>
      <div class="stats-bar">
        <div class="stat-item">
          <div class="num">{{ itemList.length }}</div>
          <div class="label">精选路线</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ checkedCount }}</div>
          <div class="label">已打卡</div>
        </div>
        <div class="stat-item">
          <div class="num">{{ checkedCount > 0 ? Math.round(checkedCount / itemList.length * 100) : 0 }}%</div>
          <div class="label">完成度</div>
        </div>
      </div>
    </div>

    <div class="progress-wrap">
      <h4>打卡进度</h4>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (checkedCount / itemList.length * 100) + '%' }"></div>
      </div>
      <div class="progress-text">
        <span>已骑行 {{ checkedCount }} 条</span>
        <span>共 {{ itemList.length }} 条</span>
      </div>
    </div>

    <br />
    <div class="filter-bar">
      <button class="filter-btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
      <button class="filter-btn" :class="{ active: filter === '初级' }" @click="filter = '初级'">🟢 初级</button>
      <button class="filter-btn" :class="{ active: filter === '中级' }" @click="filter = '中级'">🟡 中级</button>
      <button class="filter-btn" :class="{ active: filter === '高级' }" @click="filter = '高级'">🔴 高级</button>
      <button class="filter-btn" :class="{ active: filter === 'checked' }" @click="filter = 'checked'">✅ 已打卡</button>
      <button class="filter-btn" :class="{ active: filter === 'unchecked' }" @click="filter = 'unchecked'">⬜
        未打卡</button>
    </div>

    <div v-for="(item, index) in filteredList" :key="item.id" class="route-card"
      :class="{ checked: item.mark_type == 1 }">
      <div class="card-top" @click="toggleDetail(item.id)">
        <div :class="['rank-badge', getRankClass(index)]">{{ index + 1 }}</div>
        <div class="card-info">
          <h3>
            {{ item.name }}
            <span class="en" v-if="item.tags?.en_name">{{ item.tags.en_name }}</span>
            <span class="star" v-if="item.star > 0">
              <span class="score">{{ item.star }}</span>
              <span v-for="i in 5" :key="i" :class="i <= Math.round(item.star / 2) ? 'dot' : 'empty'"></span>
            </span>
            <button class="checkin-btn" :class="{ checked: item.mark_type == 1 }" @click.stop="toggleCheck(item)">
              {{ item.mark_type == 1 ? '✓ 已打卡' : '打卡' }}
            </button>
          </h3>
          <div class="location">📍 {{ item.tags?.location || '未知位置' }}</div>
          <div class="desc">{{ item.title_ || item.title }}</div>
        </div>
      </div>
      <div class="card-tags">
        <span v-if="item.tags?.distance" class="tag tag-distance">📏 {{ item.tags.distance }}</span>
        <span v-if="item.tags?.duration" class="tag tag-duration">⏱ {{ item.tags.duration }}</span>
        <span v-if="item.tags?.difficulty" class="tag tag-difficulty">{{ getDifficultyIcon(item.tags.difficulty) }} {{
          item.tags.difficulty }}</span>
        <span v-if="item.tags?.elevation" class="tag tag-elevation">⛰ {{ item.tags.elevation }}</span>
        <span v-if="item.tags?.best_season" class="tag tag-season">📅 {{ item.tags.best_season }}</span>
        <span v-if="item.tags?.road_type" class="tag tag-road">🛣 {{ item.tags.road_type }}</span>
      </div>
      <div class="detail-panel" :class="{ open: expanded === item.id }">
        <div class="detail-content">
          <div class="detail-grid">
            <div class="detail-item" v-if="item.tags?.distance">
              <div class="dl">路线距离</div>
              <div class="dv">{{ item.tags.distance }}</div>
            </div>
            <div class="detail-item" v-if="item.tags?.duration">
              <div class="dl">建议天数</div>
              <div class="dv">{{ item.tags.duration }}</div>
            </div>
            <div class="detail-item" v-if="item.tags?.elevation">
              <div class="dl">海拔范围</div>
              <div class="dv">{{ item.tags.elevation }}</div>
            </div>
            <div class="detail-item" v-if="item.tags?.road_type">
              <div class="dl">路况类型</div>
              <div class="dv">{{ item.tags.road_type }}</div>
            </div>
          </div>
          <div class="detail-section" v-if="item.tags?.scenery">
            <h4><span class="icon">🏞</span>沿途风景</h4>
            <p>{{ item.tags.scenery }}</p>
          </div>
          <div class="detail-section" v-if="item.tags?.tips">
            <h4><span class="icon">💡</span>骑行贴士</h4>
            <p>{{ item.tags.tips }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-state">
      <div class="icon">🔍</div>
      <p>暂无匹配的路线</p>
    </div>

    <br />
    <br />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useMarkStore } from '../../stores/mark'
import { markApi } from '../../api/mark'

const markStore = useMarkStore()

const moduleId = 48
const itemList = ref([])
const filter = ref('all')
const expanded = ref(null)

const checkedCount = computed(() => itemList.value.filter(item => item.mark_type == 1).length)

const filteredList = computed(() => {
  let list = itemList.value
  if (filter.value === 'checked') {
    list = list.filter(item => item.mark_type == 1 || item.mark_type == 2)
  } else if (filter.value === 'unchecked') {
    list = list.filter(item => item.mark_type === 0)
  } else if (filter.value !== 'all') {
    list = list.filter(item => item.tags?.difficulty?.includes(filter.value))
  }
  return list
})

const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return 'rank-normal'
}

const getDifficultyIcon = (difficulty) => {
  if (difficulty?.includes('初级')) return '🟢'
  if (difficulty?.includes('高级')) return '🔴'
  return '🟡'
}

const toggleDetail = (id) => {
  expanded.value = expanded.value === id ? null : id
}

const toggleCheck = async (item) => {
  try {
    if (item.mark_type === 0 || item.mark_type === 2) {
      // 未打卡或想去 -> 已打卡
      await markApi.markItem(item.id, 1)
      item.mark_type = 1
    } else {
      // 已打卡 -> 取消打卡
      await markApi.markItem(item.id, 0)
      item.mark_type = 0
    }
  } catch (error) {
    showToast('操作失败')
    console.error('打卡操作失败:', error)
  }
}

const getItemList = async () => {
  try {
    const data = await markStore.fetchItemList(moduleId)
    itemList.value = data.list || []
    itemList.value.forEach(item => {
      // 解析tags
      if (typeof item.tags === 'string') {
        try {
          item.tags = JSON.parse(item.tags)
        } catch (error) {
          item.tags = {}
          console.error('解析tags失败:', error)
        }
      }
      // 处理标题
      if (item.title && item.title.length > 12) {
        item.title_ = item.title.substring(0, 12) + '..'
      } else {
        item.title_ = item.title
      }
    })
  } catch (error) {
    console.error('获取骑行路线失败:', error)
  }
}

onMounted(() => {
  getItemList()
})
</script>

<style scoped>
.cycling-view {
  background: var(--gray300);
  padding: 0 16px 20px;
  max-width: 960px;
  margin: 0 auto;
  min-height: 100vh;
}

.header {
  text-align: center;
  padding: 12px 0 24px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.header h1 span {
  color: #e74c3c;
}

.header p {
  color: #8c8c8c;
  font-size: 14px;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-item .num {
  font-size: 22px;
  font-weight: 700;
  color: #e74c3c;
}

.stat-item .label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1.5px solid #d9d9d9;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all .2s;
  color: #595959;
}

.filter-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.filter-btn.active {
  background: #e74c3c;
  border-color: #e74c3c;
  color: #fff;
}

.route-card {
  background: #fff;
  border-radius: 14px;
  margin-bottom: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .06);
  transition: transform .2s, box-shadow .2s;
  cursor: pointer;
}

.route-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, .1);
}

.route-card.checked {
  border-left: 3px solid #e74c3c;
}

.card-top {
  display: flex;
  padding: 16px 18px 12px;
  gap: 14px;
}

.rank-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
  color: #fff;
}

.rank-1 {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.rank-2 {
  background: linear-gradient(135deg, #e67e22, #d35400);
}

.rank-3 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.rank-normal {
  background: linear-gradient(135deg, #636e72, #2d3436);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-info h3 {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-info h3 .en {
  font-size: 11px;
  color: #b2bec3;
  font-weight: 400;
}

.card-info .location {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.card-info .desc {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 18px 14px;
}

.tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.tag-distance {
  background: #fff3e0;
  color: #e67e22;
}

.tag-duration {
  background: #e3f2fd;
  color: #2196f3;
}

.tag-difficulty {
  background: #fce4ec;
  color: #e91e63;
}

.tag-elevation {
  background: #e8f5e9;
  color: #4caf50;
}

.tag-season {
  background: #f3e5f5;
  color: #9c27b0;
}

.tag-road {
  background: #e0f2f1;
  color: #009688;
}

.star {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star .score {
  font-size: 14px;
  font-weight: 700;
  color: #e74c3c;
}

.star .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #e74c3c;
}

.star .empty {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ddd;
}

.detail-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height .35s ease;
}

.detail-panel.open {
  max-height: 600px;
}

.detail-content {
  padding: 0 18px 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-section {
  margin-top: 12px;
}

.detail-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-section h4 .icon {
  font-size: 16px;
}

.detail-section p {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 10px 12px;
}

.detail-item .dl {
  font-size: 11px;
  color: #8c8c8c;
}

.detail-item .dv {
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
}

.progress-wrap {
  margin-top: 12px;
  padding: 16px 18px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .06);
}

.progress-wrap h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #e67e22);
  border-radius: 4px;
  transition: width .5s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.checkin-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1.5px solid #e74c3c;
  background: transparent;
  color: #e74c3c;
  font-size: 12px;
  cursor: pointer;
  transition: all .2s;
  margin-left: auto;
}

.checkin-btn:hover {
  background: #e74c3c;
  color: #fff;
}

.checkin-btn.checked {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #b2bec3;
}

.empty-state .icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>
