Page({
  data: {
    currentId: 1,
    categories: [
      { id: 1, name: '餐饮' }, { id: 2, name: '零售' }, { id: 3, name: '体验' },
      { id: 4, name: '农产品' }, { id: 5, name: '饮品' }, { id: 6, name: '烘焙' }
    ],
    products: [
      { id: 1, name: '稻田米浆', desc: '现磨鲜制', price: '18.00' },
      { id: 2, name: '时令沙拉', desc: '新鲜有机蔬菜', price: '28.00' },
      { id: 3, name: '田园烤鸡', desc: '散养土鸡', price: '68.00' }
    ]
  },
  selectCat: function(e) { this.setData({ currentId: Number(e.currentTarget.dataset.id) }) },
  goProduct: function(e) { wx.navigateTo({ url: '/pages/product/product?id=' + e.currentTarget.dataset.id }) }
})
