var api = require('../../utils/request')

Page({
  data: { mode: 'order', lastResult: null },
  setMode: function(e) { this.setData({ mode: e.currentTarget.dataset.mode }) },
  startScan: function() {
    var that = this
    wx.scanCode({ scanType: ['qrCode', 'barCode'], success: function(res) {
      that.handleCode(res.result)
    }})
  },
  handleCode: function(code) {
    var that = this
    var mode = that.data.mode
    var url = mode === 'meituan' ? '/meituan/records' : mode === 'douyin' ? '/douyin/records' : '/orders'
    api.post(url + (mode === 'meituan' || mode === 'douyin' ? '' : '/' + code + '/verify'), { coupon_code: code, verify_id: Date.now().toString() }).then(function(res) {
      wx.showToast({ title: '核销成功', icon: 'success' })
      that.setData({ lastResult: { name: code, time: new Date().toLocaleString(), mode: mode } })
    }).catch(function() {
      wx.showToast({ title: '核销失败', icon: 'error' })
    })
  }
})
