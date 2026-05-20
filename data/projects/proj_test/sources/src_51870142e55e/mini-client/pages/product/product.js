Page({
  data: { product: { name: '稻田米浆', desc: '现磨鲜制 · 纯天然', price: '18.00', origPrice: '22.00', detail: '选用有机稻田种植的大米，传统石磨现磨鲜制，口感醇厚，天然健康。' } },
  onLoad: function(options) { if (options.id) this.setData({ product: Object.assign(this.data.product, { id: options.id }) }) },
  addToCart: function() { wx.showToast({ title: '已加入购物车', icon: 'success' }) },
  buyNow: function() { wx.navigateTo({ url: '/pages/checkout/checkout' }) }
})
