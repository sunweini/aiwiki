Page({
  data: {
    address: '黄梅袁夫稻田 · 火车餐厅',
    items: [{ id: 1, name: '稻田米浆', price: 18, qty: 1 }, { id: 2, name: '田园沙拉', price: 28, qty: 2 }],
    totalPrice: '74.00', remark: ''
  },
  selectAddress: function() { wx.showToast({ title: '选择地址', icon: 'none' }) },
  setRemark: function(e) { this.setData({ remark: e.detail.value }) },
  submitOrder: function() {
    wx.request({ url: 'https://api.yuanfu.com/api/v1/orders', method: 'POST', data: {}, success: function() {
      wx.showToast({ title: '下单成功', icon: 'success' })
    }})
  }
})
