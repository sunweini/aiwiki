Page({
  data: { records: [
    { id: 1, gate_name: '主入口 · 进', entry_time: '2026-05-14 10:23', direction: '进', verify_method: '人脸' },
    { id: 2, gate_name: '主入口 · 出', entry_time: '2026-05-14 14:05', direction: '出', verify_method: '人脸' }
  ]},
  scanCode: function() { wx.scanCode({ success: function() { wx.showToast({ title: '通行成功', icon: 'success' }) } }) },
  faceEntry: function() { wx.showToast({ title: '人脸识别中...', icon: 'none' }) }
})
