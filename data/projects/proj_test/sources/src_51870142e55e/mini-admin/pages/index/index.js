var api = require('../../utils/request')

Page({
  data: {
    today: '',
    parkName: '黄梅袁夫稻田',
    data: { sales: 0, orders: 0, flow: 0, shops: 0, users: 0, refunds: 0, monthSales: 0 },
    activities: []
  },

  onLoad() {
    var now = new Date()
    this.setData({ today: now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') })
    this.fetchData()
  },

  fetchData() {
    var that = this
    api.get('/parks', { page: 1, page_size: 10 }).then(function(res) {
      if (res.data && res.data.items && res.data.items.length > 0) {
        var park = res.data.items[0]
        that.setData({ parkName: park.name })
      }
    }).catch(function(){})
    api.get('/stats/sales', { start_date: that.data.today, end_date: that.data.today }).then(function(res) {
      if (res.data) that.setData({ data: Object.assign(that.data.data, res.data) })
    }).catch(function(){})
    api.get('/stats/flow', { start_date: that.data.today, end_date: that.data.today }).then(function(res) {
      if (res.data) that.setData({ data: Object.assign(that.data.data, res.data) })
    }).catch(function(){})
  },

  formatMoney: function(v) { return (v || 0).toLocaleString ? (v || 0).toLocaleString() : String(v || 0) },
  goScan: function() { wx.switchTab({ url: '/pages/scan/scan' }) },
  goShops: function() { wx.switchTab({ url: '/pages/shops/shops' }) },
  goOrders: function() { wx.navigateTo({ url: '/pages/shops/shops' }) },
  switchPark: function() { wx.showToast({ title: '已切换园区', icon: 'success' }) }
})
