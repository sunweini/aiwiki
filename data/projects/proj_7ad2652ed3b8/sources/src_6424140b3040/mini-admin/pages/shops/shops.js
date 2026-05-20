var api = require('../../utils/request')

Page({
  data: { shops: [], parkName: '黄梅袁夫稻田' },
  onShow() { this.fetch() },
  fetch() {
    var that = this
    api.get('/shops', { page: 1, page_size: 50 }).then(function(res) {
      if (res.data) that.setData({ shops: res.data.items || [] })
    })
  },
  viewSales: function(e) { wx.showToast({ title: '销售额查询中', icon: 'none' }) },
  viewOrders: function(e) { wx.showToast({ title: '订单查询中', icon: 'none' }) },
  switchTo: function(e) { wx.showToast({ title: '已切换到该商户视角', icon: 'success' }) }
})
