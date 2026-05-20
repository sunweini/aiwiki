const BASE_URL = 'https://api.yuanfu.com/api/v1'

function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('access_token')
    const header = { 'Content-Type': 'application/json' }
    if (token) header['Authorization'] = 'Bearer ' + token

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      success(res) {
        if (res.statusCode === 401) {
          wx.removeStorageSync('access_token')
          wx.redirectTo({ url: '/pages/login/login' })
          return
        }
        if (res.data && res.data.code === 0) {
          resolve(res.data)
        } else {
          reject(res.data || { message: '请求失败' })
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = {
  get: function(url, data) { return request({ url: url, data: data, method: 'GET' }) },
  post: function(url, data) { return request({ url: url, data: data, method: 'POST' }) },
  put: function(url, data) { return request({ url: url, data: data, method: 'PUT' }) },
  del: function(url, data) { return request({ url: url, data: data, method: 'DELETE' }) }
}
