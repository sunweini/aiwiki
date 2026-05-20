Page({
  data: {
    messages: [
      { id: 1, icon: '⟳', title: '退款申请', time: '14:22', content: '稻田守望者 申请退款 ¥86.50', tag: '待处理', tagType: 'warning', color: '#fff7e6' },
      { id: 2, icon: '🎉', title: '活动上线', time: '10:05', content: '稻田丰收节活动已通过审核', color: '#f6ffed' },
      { id: 3, icon: '⚠', title: '系统通知', time: '昨天', content: '系统将于凌晨 2:00-4:00 维护升级', color: '#e6f4ff' }
    ]
  },
  viewDetail: function(e) { wx.showToast({ title: '查看详情', icon: 'none' }) }
})
