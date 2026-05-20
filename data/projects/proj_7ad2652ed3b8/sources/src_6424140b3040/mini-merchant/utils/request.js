const BASE_URL = 'http://localhost:8080/api/v1'

function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('access_token')
    const header = { 'Content-Type': 'application/json' }
    if (token) header['Authorization'] = `Bearer ${token}`

    wx.request({
      url: BASE_URL + (options.url || ''),
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success(res) {
        if (res.statusCode === 401) {
          wx.removeStorageSync('access_token')
          wx.reLaunch({ url: '/pages/index/index' })
          return
        }
        const body = res.data
        if (body && body.code === 0) {
          resolve(body)
        } else if (body && body.code === 401) {
          wx.removeStorageSync('access_token')
          wx.reLaunch({ url: '/pages/index/index' })
          reject(body)
        } else {
          reject(body || res)
        }
      },
      fail(err) {
        wx.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  del: (url, data) => request({ url, method: 'DELETE', data }),
  BASE_URL
}
