var app = getApp()
Page({
  data: {
    userName: '',
    user: {},
    categories: [
      { id: 1, name: '餐饮', icon: '🍽', color: '#fff7e6' },
      { id: 2, name: '零售', icon: '🎁', color: '#e6f4ff' },
      { id: 3, name: '体验', icon: '🎨', color: '#f6ffed' },
      { id: 4, name: '住宿', icon: '🏠', color: '#f9f0ff' },
      { id: 5, name: '农产品', icon: '🌾', color: '#fffbe6' },
      { id: 6, name: '活动', icon: '🎉', color: '#fff2f0' },
      { id: 7, name: '饮品', icon: '🥤', color: '#e6fffb' },
      { id: 8, name: '烘焙', icon: '🍞', color: '#f5f0e8' }
    ],
    newProducts: [
      { id: 1, name: '稻田米浆', price: '18.00' },
      { id: 2, name: '手工果酱', price: '38.00' },
      { id: 3, name: '田园沙拉', price: '28.00' }
    ],
    hotProducts: [
      { id: 1, name: '稻田鲜米 5kg', desc: '有机种植 · 现碾现发', price: '68.00' },
      { id: 2, name: '稻田蜂蜜', desc: '纯天然 · 无添加', price: '45.00' }
    ]
  },
  onShow() {
    this.setData({ user: app.globalData.user || {}, userName: (app.globalData.user && app.globalData.user.nickname) || '' })
  },
  goMemberQr: function() { wx.navigateTo({ url: '/pages/member-qr/member-qr' }) },
  goCategory: function(e) { wx.switchTab({ url: '/pages/categories/categories' }) },
  goProduct: function(e) { wx.navigateTo({ url: '/pages/product/product?id=' + e.currentTarget.dataset.id }) }
})
