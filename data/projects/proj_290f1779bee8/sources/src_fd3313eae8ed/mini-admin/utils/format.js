function money(val) {
  if (val === null || val === undefined) return '¥0.00'
  return '¥' + Number(val).toFixed(2)
}

function date(val, format) {
  if (!val) return '-'
  var d = new Date(val)
  var y = d.getFullYear()
  var m = String(d.getMonth() + 1).padStart(2, '0')
  var day = String(d.getDate()).padStart(2, '0')
  var h = String(d.getHours()).padStart(2, '0')
  var min = String(d.getMinutes()).padStart(2, '0')
  if (format === 'time') return h + ':' + min
  if (format === 'date') return m + '-' + day
  return y + '-' + m + '-' + day + ' ' + h + ':' + min
}

function phone(val) {
  if (!val || val.length < 7) return val || '-'
  return val.slice(0, 3) + '****' + val.slice(-4)
}

module.exports = { money: money, date: date, phone: phone }
