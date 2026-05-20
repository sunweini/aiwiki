var app = getApp()
Page({
  data: {
    user: {}, selectedAmount: 100, selectedBonus: 10,
    tiers: [
      { amount: 50, bonus: 0 }, { amount: 100, bonus: 10 }, { amount: 200, bonus: 30 },
      { amount: 500, bonus: 100 }, { amount: 1000, bonus: 300 }, { amount: 2000, bonus: 800 }
    ]
  },
  onShow: function() { this.setData({ user: app.globalData.user || {} }) },
  selectTier: function(e) {
    this.setData({
      selectedAmount: Number(e.currentTarget.dataset.amount),
      selectedBonus: Number(e.currentTarget.dataset.bonus)
    })
  },
  doRecharge: function() {
    wx.requestPayment({ timeStamp: '', nonceStr: '', package: '', signType: 'MD5', paySign: '', success: function() {
      wx.showToast({ title: '充值成功', icon: 'success' })
    }, fail: function() {
      wx.showToast({ title: '支付取消', icon: 'none' })
    }})
  }
})
