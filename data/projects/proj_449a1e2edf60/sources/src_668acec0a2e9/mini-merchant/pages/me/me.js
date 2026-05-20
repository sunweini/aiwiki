Page({
  data: { shopName: '火车餐厅', balance: '130.00', orderCount: 0, verifyCount: 0 },
  onShow() { this.fetchSummary() },
  fetchSummary() {
    var that = this
    var today = new Date().toISOString().slice(0, 10)
    var api = require('../../utils/request')
    api.get('/stats/sales', { start_date: today, end_date: today }).then(function(res) {
      if (res.data) that.setData({ orderCount: res.data.total_orders || 0 })
    }).catch(function(){})
  },
  goMenu() { wx.navigateTo({ url: '/pages/menu/menu' }) },
  goBusiness() { wx.navigateTo({ url: '/pages/business/business' }) },
  goWithdrawAccount() { wx.navigateTo({ url: '/pages/withdraw-account/withdraw-account' }) },
  logout() {
    wx.removeStorageSync('access_token')
    wx.reLaunch({ url: '/pages/dashboard/dashboard' })
  }
})
