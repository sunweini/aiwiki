var api = require('../../utils/request')
Page({
  data: { orders: [], status: '' },
  onShow() { this.fetchOrders() },
  filter(e) { this.setData({ status: e.currentTarget.dataset.status }); this.fetchOrders() },
  fetchOrders() {
    var that = this
    var params = { page: 1, page_size: 20 }
    if (that.data.status) params.status = that.data.status
    api.get('/orders', params).then(function(res) {
      if (res.data && res.data.items) that.setData({ orders: res.data.items })
    }).catch(function(){})
  }
})
