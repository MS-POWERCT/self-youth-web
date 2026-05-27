export const copyToClipboard = async (text, successMsg = '复制成功') => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Clipboard API 复制失败:', error)
      return fallbackCopy(text, successMsg)
    }
  } else {
    return fallbackCopy(text, successMsg)
  }
}

const fallbackCopy = (text, successMsg) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.top = '-200px'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)

  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  try {
    const success = document.execCommand('copy')
    if (success) {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

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

export const formatDate = (dateInput, separator = '月') => {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ''

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (separator === '月') {
    return `${month}月${day}日`
  }
  return `${month}${separator}${day}`
}

export const formatTime = (timeInput, showSeconds = false, use12Hour = false) => {
  if (!timeInput) return ''

  const date = new Date(timeInput)
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

export const formatDateTime = (dateInput, options = {}) => {
  const { dateSeparator = '月', showSeconds = false, use12Hour = false } = options
  const date = formatDate(dateInput, dateSeparator)
  const time = formatTime(dateInput, showSeconds, use12Hour)
  return `${date} ${time}`
}

export const getRelativeTime = (targetTime) => {
  const now = new Date()
  const target = new Date(targetTime)
  const diffMs = target - now
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000)
  const isFuture = diffMs > 0

  if (diffSeconds < 60) {
    return isFuture ? '即将' : '刚刚'
  }

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
