var app = getApp()
Page({
  data: { user: {}, avatarText: '用' },
  onShow: function() {
    var user = app.globalData.user || {}
    this.setData({ user: user, avatarText: (user.nickname || '用').charAt(0) })
  },
  goRecharge: function() { wx.navigateTo({ url: '/pages/recharge/recharge' }) },
  goOrders: function() { wx.showToast({ title: '我的订单', icon: 'none' }) },
  goPoints: function() { wx.showToast({ title: '积分中心', icon: 'none' }) },
  goMemberQr: function() { wx.navigateTo({ url: '/pages/member-qr/member-qr' }) },
  goActivities: function() { wx.navigateTo({ url: '/pages/activities/activities' }) },
  goGate: function() { wx.navigateTo({ url: '/pages/gate/gate' }) },
  showAbout: function() { wx.showToast({ title: '袁夫稻田 · 智慧园区', icon: 'none' }) },
  logout: function() {
    wx.removeStorageSync('access_token')
    wx.removeStorageSync('user')
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
