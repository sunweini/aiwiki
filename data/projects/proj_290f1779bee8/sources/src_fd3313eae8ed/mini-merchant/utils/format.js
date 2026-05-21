function money(val) {
  const n = Number(val)
  if (isNaN(n)) return '¥0.00'
  return '¥' + n.toFixed(2)
}

function date(str) {
  if (!str) return ''
  const d = new Date(str)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dateTime(str) {
  if (!str) return ''
  const d = new Date(str)
  return date(str) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

function phone(str) {
  if (!str || str.length < 7) return str
  return str.slice(0, 3) + '****' + str.slice(-4)
}

function relativeTime(str) {
  if (!str) return ''
  const now = Date.now()
  const then = new Date(str).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前'
  return date(str)
}

module.exports = { money, date, dateTime, phone, relativeTime }
