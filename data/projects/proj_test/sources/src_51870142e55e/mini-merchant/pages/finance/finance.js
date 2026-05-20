var api = require('../../utils/request')
Page({
  data: { balance: '0.00', frozenAmount: '0.00', totalEarned: '0.00', withdrawCount: 0, withdraws: [] },
  onShow() { this.fetchData() },
  fetchData() {
    var that = this
    api.get('/finance/withdraws', { page: 1, page_size: 20 }).then(function(res) {
      if (res.data) that.setData({ withdraws: res.data.items || [], withdrawCount: res.data.total || 0 })
    }).catch(function(){})
  },
  formatMoney: function(v) { return (Number(v) || 0).toLocaleString() },
  showWithdraw() {
    wx.navigateTo({ url: '/pages/withdraw-account/withdraw-account' })
  }
})
