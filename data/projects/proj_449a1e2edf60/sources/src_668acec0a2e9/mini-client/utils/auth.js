const request = require('./request')

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: request.BASE_URL + '/auth/wx-login',
            method: 'POST',
            data: { code: res.code, type: 'client' },
            success(result) {
              const body = result.data
              if (body && body.code === 0) {
                wx.setStorageSync('access_token', body.data.access_token)
                wx.setStorageSync('user', body.data.user)
                resolve(body.data)
              } else reject(body)
            },
            fail: reject
          })
        } else reject(new Error('wx.login failed'))
      },
      fail: reject
    })
  })
}

function getUser() { return wx.getStorageSync('user') || null }
function getToken() { return wx.getStorageSync('access_token') || '' }
function isLoggedIn() { return !!getToken() }
function logout() { wx.removeStorageSync('access_token'); wx.removeStorageSync('user') }
module.exports = { login, getUser, getToken, isLoggedIn, logout }
