import request from '../utils/request'

export const farmApi = {
  initFarm() {
    return request({
      url: '/api/farmUser/initFarm',
      method: 'post',
    })
  },
  getLandList() {
    return request({
      url: '/api/farmUser/getLandList',
      method: 'post',
    })
  },
  // plant(data) {
  //   return request({
  //     url: '/api/farmLand/plant', // 种植
  //     method: 'post',
  //     data,
  //   })
  // },
  // refresh(data) {
  //   return request({
  //     url: '/api/farmLand/refresh', // 刷新
  //     method: 'post',
  //     data,
  //   })
  // },
  // harvest(data) {
  //   return request({
  //     url: '/api/farmLand/harvest', // 收获
  //     method: 'post',
  //     data,
  //   })
  // },
  // remove(data) {
  //   return request({
  //     url: '/api/farmLand/remove', // 铲除
  //     method: 'post',
  //     data,
  //   })
  // },
  // productGetList(data) {
  //   return request({
  //     url: '/api/farmProduct/getList', // 商店列表
  //     method: 'post',
  //     data,
  //   })
  // },
  // productBuy(data) {
  //   return request({
  //     url: '/api/farmProduct/buy', // 购买
  //     method: 'post',
  //     data,
  //   })
  // },
  // warehouseGetList(data) {
  //   return request({
  //     url: '/api/farmWarehouse/getList', // 仓库列表
  //     method: 'post',
  //     data,
  //   })
  // },
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
}
