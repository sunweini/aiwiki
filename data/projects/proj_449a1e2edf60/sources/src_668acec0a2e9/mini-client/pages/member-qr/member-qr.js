var app = getApp()
Page({
  data: { user: {}, avatarText: '用', mode: 'pay' },
  onShow: function() {
    var user = app.globalData.user || {}
    this.setData({ user: user, avatarText: (user.nickname || '用').charAt(0) })
    this.startTimer()
  },
  onHide: function() { clearInterval(this._timer) },
  startTimer: function() { this._timer = setInterval(function() {}, 30000) },
  setMode: function(e) { this.setData({ mode: e.currentTarget.dataset.mode }) },
  refresh: function() { wx.showToast({ title: '已刷新', icon: 'success' }) },
  goRecharge: function() { wx.navigateTo({ url: '/pages/recharge/recharge' }) }
})
