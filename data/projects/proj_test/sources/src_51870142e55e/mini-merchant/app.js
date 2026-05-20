App({
  onLaunch() {
    var that = this
    var employee = wx.getStorageSync('employee')
    if (!employee) {
      require('./utils/auth').login().then(function(emp) {
        that.globalData.employee = emp
      })
    } else {
      that.globalData.employee = employee
    }
  },
  globalData: { employee: null }
})
