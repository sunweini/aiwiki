var api = require('../../utils/request')
Page({
  data: { mode: 'order', result: null },
  setMode(e) { this.setData({ mode: e.currentTarget.dataset.mode, result: null }) },
  handleScan() {
    var that = this
    wx.scanCode({ success(res) {
      wx.showLoading({ title: '核销中...' })
      var url = that.data.mode === 'order' ? '/orders/' + res.result + '/verify' : '/meituan/verify'
      api.post(url, { code: res.result }).then(function(r) {
        wx.hideLoading()
        that.setData({ result: { message: '核销成功' } })
      }).catch(function(err) { wx.hideLoading(); wx.showToast({ title: '核销失败', icon: 'none' }) })
    }})
  }
})
