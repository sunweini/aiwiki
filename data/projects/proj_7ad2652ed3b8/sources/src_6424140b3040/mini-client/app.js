App({
  onLaunch: function() {
    var that = this
    var user = wx.getStorageSync('user')
    if (!user) {
      wx.login({
        success: function(res) {
          if (res.code) {
            wx.request({
              url: 'https://api.yuanfu.com/api/v1/auth/wx-login',
              method: 'POST',
              data: { code: res.code, type: 'client' },
              success: function(r) {
                if (r.data && r.data.code === 0) {
                  var d = r.data.data
                  wx.setStorageSync('access_token', d.access_token)
                  wx.setStorageSync('user', d.user)
                  that.globalData.user = d.user
                }
              }
            })
          }
        }
      })
    } else {
      that.globalData.user = user
    }
  },
  globalData: { user: null }
})
