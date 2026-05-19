/**
 * 复制文本到剪贴板（兼容 iOS 和 Android）
 * @param {string} text - 要复制的文本
 * @param {string} successMsg - 成功提示文案
 */
export const copyToClipboard = async (text, successMsg = '复制成功') => {
  // 方法1：使用现代 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Clipboard API 复制失败:', error)
      // 降级到 fallback 方法
      return fallbackCopy(text, successMsg)
    }
  } else {
    // 方法2：降级方案（兼容老浏览器）
    return fallbackCopy(text, successMsg)
  }
}

// 降级复制方法（使用 textarea + execCommand）
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
