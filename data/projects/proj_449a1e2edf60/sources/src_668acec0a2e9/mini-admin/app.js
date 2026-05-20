App({
  onLaunch() {
    var that = this
    var employee = wx.getStorageSync('employee')
    if (!employee) {
      require('./utils/auth').login().then(function(emp) {
        that.globalData.employee = emp
      }).catch(function() {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      })
    } else {
      that.globalData.employee = employee
    }
  },
  globalData: {
    employee: null
  }
})
