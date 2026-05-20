function login() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        if (!res.code) return reject(new Error('wx.login 失败'))
        wx.request({
          url: 'https://api.yuanfu.com/api/v1/auth/wx-login',
          method: 'POST',
          data: { code: res.code, type: 'admin' },
          success: function(r) {
            if (r.data && r.data.code === 0) {
              var d = r.data.data
              wx.setStorageSync('access_token', d.access_token)
              wx.setStorageSync('employee', d.employee)
              resolve(d.employee)
            } else {
              reject(new Error(r.data ? r.data.message : '登录失败'))
            }
          },
          fail: reject
        })
      }
    })
  })
}

function getEmployee() { return wx.getStorageSync('employee') || null }
function logout() { wx.removeStorageSync('access_token'); wx.removeStorageSync('employee') }

module.exports = { login: login, getEmployee: getEmployee, logout: logout }
