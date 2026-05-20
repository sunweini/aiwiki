Page({
  data: {
    items: [
      { id: 1, name: '稻田米浆', price: '18.00', qty: 1, selected: true },
      { id: 2, name: '田园沙拉', price: '28.00', qty: 2, selected: true }
    ],
    allSelected: true, totalPrice: '74.00', selectedCount: 2
  },
  calcTotal: function() {
    var items = this.data.items
    var selected = items.filter(function(i) { return i.selected })
    var total = selected.reduce(function(s, i) { return s + Number(i.price) * i.qty }, 0)
    this.setData({
      totalPrice: total.toFixed(2),
      selectedCount: selected.reduce(function(s, i) { return s + i.qty }, 0),
      allSelected: items.length > 0 && selected.length === items.length
    })
  },
  toggleSelect: function(e) {
    var id = e.currentTarget.dataset.id
    var items = this.data.items
    var item = items.find(function(i) { return i.id === id })
    if (item) item.selected = !item.selected
    this.setData({ items: items }); this.calcTotal()
  },
  toggleAll: function() {
    var all = !this.data.allSelected
    this.data.items.forEach(function(i) { i.selected = all })
    this.setData({ items: this.data.items }); this.calcTotal()
  },
  decQty: function(e) {
    var id = e.currentTarget.dataset.id
    var item = this.data.items.find(function(i) { return i.id === id })
    if (item && item.qty > 1) { item.qty--; this.setData({ items: this.data.items }); this.calcTotal() }
  },
  incQty: function(e) {
    var id = e.currentTarget.dataset.id
    var item = this.data.items.find(function(i) { return i.id === id })
    if (item) { item.qty++; this.setData({ items: this.data.items }); this.calcTotal() }
  },
  goCheckout: function() { wx.navigateTo({ url: '/pages/checkout/checkout' }) }
})
