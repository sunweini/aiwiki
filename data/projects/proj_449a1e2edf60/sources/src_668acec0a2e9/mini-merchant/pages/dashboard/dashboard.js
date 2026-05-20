var api = require('../../utils/request')

Page({
  data: {
    shopName: '火车餐厅',
    today: '',
    dash: { sales: 0, orders: 0, verifies: 0, balance: 0, monthSales: 0, pendingWithdraws: 0, pendingSettle: 0 },
    recentOrders: []
  },

  onShow() {
    var now = new Date()
    this.setData({ today: now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') })
    this.fetchData()
  },

  fetchData() {
    var that = this
    api.get('/stats/sales', { start_date: that.data.today, end_date: that.data.today }).then(function(res) {
      if (res.data) that.setData({ dash: Object.assign(that.data.dash, { sales: res.data.total_amount || 0, orders: res.data.total_orders || 0 }) })
    }).catch(function(){})
    api.get('/orders', { page: 1, page_size: 5 }).then(function(res) {
      if (res.data && res.data.items) that.setData({ recentOrders: res.data.items })
    }).catch(function(){})
    api.get('/finance/withdraws', { page: 1, page_size: 1 }).then(function(res) {
      if (res.data) that.setData({ dash: Object.assign(that.data.dash, { pendingWithdraws: res.data.total || 0 }) })
    }).catch(function(){})
  },

  formatMoney: function(v) { return (Number(v) || 0).toLocaleString() },
  goVerify() { wx.switchTab({ url: '/pages/verify/verify' }) },
  goOrders() { wx.switchTab({ url: '/pages/orders/orders' }) },
  goFinance() { wx.switchTab({ url: '/pages/finance/finance' }) },
  goMenu() { wx.navigateTo({ url: '/pages/menu/menu' }) }
})
