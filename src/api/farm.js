import request from '../utils/request'

export const farmApi = {
  initFarm() {
    return request({
      url: '/api/farmUser/initFarm',
      method: 'post',
      silent: true,
    })
  },
  getLandList() {
    return request({
      url: '/api/farmUser/getLandList',
      method: 'post',
      silent: true,
    })
  },
  plant(data) {
    return request({
      url: '/api/farmUser/plant', // 种植
      method: 'post',
      data,
      silent: true,
    })
  },
  remove(data) {
    return request({
      url: '/api/farmUser/remove', // 铲除
      method: 'post',
      data,
      silent: true,
    })
  },
  refresh(data) {
    return request({
      url: '/api/farmUser/refresh', // 刷新
      method: 'post',
      data,
      silent: true,
    })
  },
  harvest(data) {
    return request({
      url: '/api/farmUser/harvest', // 收获
      method: 'post',
      data,
      silent: true,
    })
  },
  getShopList(data) {
    return request({
      url: '/api/farmShop/getList', // 商店列表
      method: 'get',
      data,
      silent: true,
    })
  },
  shopBuy(data) {
    return request({
      url: '/api/farmShop/buy', // 购买
      method: 'post',
      data,
      silent: true,
    })
  },

  getWarehouseList(data) {
    return request({
      url: '/api/farmWarehouse/getList', // 仓库列表
      method: 'post',
      data,
      silent: true,
    })
  },
  // warehouseSell(data) {
  //   return request({
  //     url: '/api/farmWarehouse/sell', // 卖出
  //     method: 'post',
  //     data,
  //   })
  // },
  // warehouseSellAll() {
  //   return request({
  //     url: '/api/farmWarehouse/sellAll', // 卖出全部
  //     method: 'post',
  //   })
  // },
  getMarketList(data) {
    return request({
      url: '/api/farmTask/getList', // 集市列表
      method: 'post',
      data,
      silent: true,
    })
  },
  // 交付集市任务
  deliverTask(data) {
    return request({
      url: '/api/farmTask/submit', // 交付
      method: 'post',
      data,
      silent: true,
    })
  },
  // 放弃集市任务
  cancelTask(data) {
    return request({
      url: '/api/farmTask/cancel', // 放弃
      method: 'post',
      data,
      silent: true,
    })
  },

  // 土地升级/开垦信息
  getLandUpgradeInfo() {
    return request({
      url: '/api/farmUser/getLandUpgradeInfo', // 土地升级/开垦信息
      method: 'post',
      silent: true,
    })
  },
  // 土地升级/开垦
  upgradeLand(data) {
    return request({
      url: '/api/farmUser/upgradeLand', // 土地升级/开垦
      method: 'post',
      data,
      silent: true,
    })
  },
}
