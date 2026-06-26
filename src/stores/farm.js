  import { defineStore } from 'pinia'
  import { farmApi } from '../api/farm'

  export const useFarmStore = defineStore('farm', {
    state: () => ({
      info: null, // 使用 null 初始化，避免类型混乱
      loading: false,
      lands: [], // 土地列表
      shops: [], // 商店列表
      seedList: [], // 仓库列表（种子）
      fruitList: [], // 仓库列表（水果）
      toolList: [], // 仓库列表（工具）
      marketList: [], // 仓库列表（集市）
      landUpgradeInfo: [], // 土地升级/开垦信息（土地）
    }),
    actions: {
      async fetchFarmInfo() {
        try {
          this.loading = true
          const response = await farmApi.initFarm()
          this.info = response || null
          return response
        } catch (error) {
          console.error('获取农场信息失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 获取土地信息
      async fetchLands() {
        try {
          this.loading = true
          const response = await farmApi.getLandList() || []
          this.lands = response
          return response
        } catch (error) {
          console.error('获取土地信息失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 种植土地
      async plant(data){
        try {
          this.loading = true
          const response = await farmApi.plant(data) || []
          this.lands = response
          return response
        } catch (error) {
          console.error('种植土地失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 铲除土地
      async landRemove(data){
        try {
          this.loading = true
          const response = await farmApi.remove(data) || []
          this.lands = response
          return response
        } catch (error) {
          console.error('移除土地失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      //刷新
      async LandRefresh(land_id){
         try {
          this.loading = true
          const response = await farmApi.refresh({ land_id: land_id }) || []
          this.lands = response
          return response
        } catch (error) {
          console.error('刷新土地失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 收获
      async LandHarvest(land_id){
        try {
          this.loading = true
          const response = await farmApi.harvest({ land_id: land_id }) || []
          this.lands = response
          return response
        } catch (error) {
          console.error('收获土地失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 获取商店信息
      async fetchShops(data) {
        try {
          this.loading = true
          const response = await farmApi.getShopList(data) || []
          this.shops = response
          return response
        } catch (error) {
          console.error('获取商店信息失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 购买商品（包含API调用和状态更新逻辑）
      async shopBuy(item, num) {
        const price = item.handbook.price
        const assetId = item.handbook.asset_id
        const spent = num * price

        try {
          this.loading = true
          // 调用API购买
         await farmApi.shopBuy({
            id: item.id,
            num: num
          })
          // 只有在API成功后才更新本地余额
          if (this.info && this.info.wallet_assets) {
            const asset = this.info.wallet_assets.find(a => a.asset_id === assetId)
            if (asset) {
              asset.balance -= spent
            }
          }
          return { success: true, spent }
        } catch (error) {
          console.error('购买商店商品失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 获取仓库列表
      async fetchWarehouseList(type) {
        try {
          this.loading = true
          const response = await farmApi.getWarehouseList({ type: type }) || []
          this[`${type}List`] = response || []
          return response
        } catch (error) {
          console.error('获取仓库列表失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 获取集市列表
      async fetchMarketList(data) {
        try {
          this.loading = true
          const response = await farmApi.getMarketList(data) || []
          this.marketList = response || []
          return response
        } catch (error) {
          console.error('获取集市列表失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 交付集市任务
      async deliverTask(task_id) {
        try {
          this.loading = true
          const response = await farmApi.deliverTask({ id: task_id }) || []
          this.marketList = response || []
          return response
        } catch (error) {
          console.error('交付集市任务失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 放弃集市任务
      async cancelTask(task_id) {
        try {
          this.loading = true
          const response = await farmApi.cancelTask({ id: task_id }) || []
          this.marketList = response || []
          return response
        } catch (error) {
          console.error('放弃集市任务失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 土地升级/开垦信息
      async getLandUpgradeInfo() {
        try {
          this.loading = true
          const response = await farmApi.getLandUpgradeInfo() || []
          this.landUpgradeInfo = response || []
          return response
        } catch (error) {
          console.error('获取土地升级/开垦信息失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
      // 土地升级/开垦
      async upgradeLand(upgrade_type) {
        try {
          this.loading = true
          const response = await farmApi.upgradeLand({upgrade_type: upgrade_type}) || []
          this.lands = response || []
          return response
        } catch (error) {
          console.error('土地升级/开垦失败', error)
          throw error
        } finally {
          this.loading = false
        }
      },
    }
  })
