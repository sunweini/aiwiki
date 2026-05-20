var auth = require('../../utils/auth')

Page({
  data: { employee: {}, avatarText: '管', parkName: '黄梅袁夫稻田' },
  onShow() {
    var emp = auth.getEmployee() || {}
    this.setData({
      employee: emp,
      avatarText: (emp.real_name || '管').charAt(0)
    })
  },
  switchPark: function() { wx.showToast({ title: '已切换园区', icon: 'success' }) },
  showInfo: function() { wx.showToast({ title: '园区信息', icon: 'none' }) },
  showAbout: function() { wx.showToast({ title: '袁夫稻田智慧园区 V2', icon: 'none' }) },
  logout: function() {
    auth.logout()
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
