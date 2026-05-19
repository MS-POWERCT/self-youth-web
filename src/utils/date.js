/**
 * 获取当前日期时间
 * @param {string} format - 格式类型：'datetime'(默认) | 'date' | 'time'
 * @returns {string} 格式化后的日期时间字符串
 */
export const getCurrentTime = (format = 'datetime', now = new Date()) => {

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hour}:${minute}:${second}`
    case 'datetime_cn':
      return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
    default:
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
}

/**
 * 格式化日期为 "MM月DD日" 格式
 * @param {string|Date} dateInput - 日期字符串、时间戳或Date对象
 * @param {string} separator - 分隔符，默认 '月' 和 '日'，可自定义如 '/'
 * @returns {string} 格式化后的日期，如 "05月09日"
 * @example
 * formatDate('2026-05-09') // "05月09日"
 * formatDate('2026-05-09', '/') // "05/09"
 */
export const formatDate = (dateInput, separator = '月') => {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  // 校验日期是否有效
  if (isNaN(date.getTime())) return ''

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (separator === '月') {
    return `${month}月${day}日`
  }
  return `${month}${separator}${day}`
}

/**
 * 格式化时间为 "HH:MM" 格式（24小时制）
 * @param {string|Date} timeInput - 日期字符串、时间戳或Date对象
 * @param {boolean} showSeconds - 是否显示秒，默认 false
 * @param {boolean} use12Hour - 是否使用12小时制，默认 false
 * @returns {string} 格式化后的时间，如 "14:30" 或 "02:30 PM"
 * @example
 * formatTime('2026-05-09 14:30:25') // "14:30"
 * formatTime('2026-05-09 14:30:25', true) // "14:30:25"
 * formatTime('2026-05-09 14:30:25', false, true) // "02:30 PM"
 */
export const formatTime = (timeInput, showSeconds = false, use12Hour = false) => {
  if (!timeInput) return ''

  const date = new Date(timeInput)
  // 校验日期是否有效
  if (isNaN(date.getTime())) return ''

  if (use12Hour) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: true
    })
  }

  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  if (showSeconds) {
    return `${hour}:${minute}:${second}`
  }
  return `${hour}:${minute}`
}

/**
 * 格式化完整日期时间
 * @param {string|Date} dateInput - 日期字符串、时间戳或Date对象
 * @param {Object} options - 配置选项
 * @returns {string} 格式化后的日期时间
 * @example
 * formatDateTime('2026-05-09 14:30:25') // "05月09日 14:30"
 */
export const formatDateTime = (dateInput, options = {}) => {
  const { dateSeparator = '月', showSeconds = false, use12Hour = false } = options
  const date = formatDate(dateInput, dateSeparator)
  const time = formatTime(dateInput, showSeconds, use12Hour)
  return `${date} ${time}`
}


// 给一个时间之前的时间返回距离现在过了多久了，然后是负数就返回未来
export const getRelativeTime = (targetTime) => {
  const now = new Date()
  const target = new Date(targetTime)
  const diffMs = target - now
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000)
  const isFuture = diffMs > 0
  // 刚刚/即将
  if (diffSeconds < 60) {
    return isFuture ? '即将' : '刚刚'
  }

  // 计算时间差
  const intervals = [
    { label: '年', seconds: 31536000 },
    { label: '个月', seconds: 2592000 },
    { label: '天', seconds: 86400 },
    { label: '小时', seconds: 3600 },
    { label: '分钟', seconds: 60 },
    { label: '秒', seconds: 1 }
  ]

  for (const interval of intervals) {
    const count = Math.floor(diffSeconds / interval.seconds)
    if (count >= 1) {
      const suffix = isFuture ? '后' : '前'
      return `${count}${interval.label}${suffix}`
    }
  }

  return isFuture ? '即将' : '刚刚'
}
