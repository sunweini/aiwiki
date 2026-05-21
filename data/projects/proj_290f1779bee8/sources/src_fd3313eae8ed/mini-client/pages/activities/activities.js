var api = require('../../utils/request')
Page({
  data: { activities: [] },
  onShow: function() {
    var that = this
    api.get('/activities', { page: 1, page_size: 20 }).then(function(res) {
      if (res.data) that.setData({ activities: res.data.items || [] })
    })
  },
  viewDetail: function(e) { wx.showToast({ title: '活动详情', icon: 'none' }) }
})
