// 获取设备信息工具函数
export const getDeviceInfo = async () => {
  const deviceInfo = {
    // 系统信息
    system: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appVersion: navigator.appVersion,
      appName: navigator.appName,
      appCodeName: navigator.appCodeName
    },

    // 屏幕信息
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: screen.orientation?.type || 'unknown',
      devicePixelRatio: window.devicePixelRatio
    },

    // 窗口信息
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    },

    // 浏览器信息
    browser: {
      name: getBrowserName(),
      version: getBrowserVersion(),
      isMobile: isMobileDevice(),
      isTablet: isTabletDevice(),
      isDesktop: isDesktopDevice()
    },

    // 时间信息
    time: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      localTime: new Date().toLocaleString(),
      utcTime: new Date().toUTCString(),
      timestamp: Date.now()
    },

    // 网络信息
    network: {
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null,
      online: navigator.onLine
    },

    // 存储信息
    storage: {
      localStorage: {
        used: getLocalStorageUsed(),
        available: getLocalStorageAvailable()
      },
      sessionStorage: {
        used: getSessionStorageUsed(),
        available: getSessionStorageAvailable()
      }
    },

    // 性能信息
    performance: {
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null,
      timing: performance.timing ? {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoaded: performance.timing.domContentLoadedEventEnd
      } : null
    },

    // 地理位置信息（需要权限）
    geolocation: null,

    // 设备唯一标识（生成一个基于设备信息的指纹）
    fingerprint: null
  }

  // 尝试获取地理位置
  try {
    const position = await getCurrentPosition()
    deviceInfo.geolocation = position
  } catch (error) {
    deviceInfo.geolocation = { error: error.message }
  }

  deviceInfo.fingerprint = generateFingerprint(deviceInfo)

  return deviceInfo
}

// 获取浏览器名称
function getBrowserName() {
  const userAgent = navigator.userAgent
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox'
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome'
  if (userAgent.indexOf('Safari') > -1) return 'Safari'
  if (userAgent.indexOf('Edge') > -1) return 'Edge'
  if (userAgent.indexOf('Opera') > -1) return 'Opera'
  return 'Unknown'
}

// 获取浏览器版本
function getBrowserVersion() {
  const userAgent = navigator.userAgent
  const browserName = getBrowserName()
  let version = 'Unknown'

  try {
    if (browserName === 'Chrome') {
      const match = userAgent.match(/Chrome\/(\d+)/)
      if (match) version = match[1]
    } else if (browserName === 'Firefox') {
      const match = userAgent.match(/Firefox\/(\d+)/)
      if (match) version = match[1]
    } else if (browserName === 'Safari') {
      const match = userAgent.match(/Version\/(\d+).*Safari/)
      if (match) version = match[1]
    } else if (browserName === 'Edge') {
      const match = userAgent.match(/Edge\/(\d+)/)
      if (match) version = match[1]
    }
  } catch (error) {
    version = 'Error'
  }

  return version
}

// 检测是否为移动设备
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 检测是否为平板设备
function isTabletDevice() {
  const userAgent = navigator.userAgent
  return /iPad|Android(?!.*Mobile)/i.test(userAgent) || (isMobileDevice() && window.innerWidth >= 768)
}

// 检测是否为桌面设备
function isDesktopDevice() {
  return !isMobileDevice() && !isTabletDevice()
}

// 获取本地存储使用情况
function getLocalStorageUsed() {
  try {
    let used = 0
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length
      }
    }
    return used
  } catch (error) {
    return 'Error'
  }
}

// 获取本地存储可用空间
function getLocalStorageAvailable() {
  try {
    const test = 'test'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return 'Available'
  } catch (error) {
    return 'Unavailable'
  }
}

// 获取会话存储使用情况
function getSessionStorageUsed() {
  try {
    let used = 0
    for (let key in sessionStorage) {
      if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
        used += sessionStorage[key].length + key.length
      }
    }
    return used
  } catch (error) {
    return 'Error'
  }
}

// 获取会话存储可用空间
function getSessionStorageAvailable() {
  try {
    const test = 'test'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return 'Available'
  } catch (error) {
    return 'Unavailable'
  }
}

// 获取当前位置
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  })
}

function generateFingerprint(deviceInfo) {
  const fingerprintData = {
  // 现有信息
  userAgent: deviceInfo.system.userAgent,
  platform: deviceInfo.system.platform,
  language: deviceInfo.system.language,
  screen: `${deviceInfo.screen.width}x${deviceInfo.screen.height}`,
  colorDepth: deviceInfo.screen.colorDepth,
  timezone: deviceInfo.time.timezone,
  hardwareConcurrency: deviceInfo.system.hardwareConcurrency,

  // 新增信息
  devicePixelRatio: deviceInfo.screen.devicePixelRatio,
  maxTouchPoints: deviceInfo.system.maxTouchPoints,
  cookieEnabled: deviceInfo.system.cookieEnabled,
  vendor: deviceInfo.system.vendor
}

  const str = JSON.stringify(fingerprintData)
  let hash = 2166136261 // FNV offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
    hash = hash & 0xffffffff
  }

  return (hash >>> 0).toString(16)
}


// 打印设备信息
export const printDeviceInfo = async () => {
  try {
    console.log('🔍 正在获取设备信息...')
    const info = await getDeviceInfo()

    console.group('📱 设备信息详情')
    console.log('🖥️ 系统信息:', info.system)
    console.log('📺 屏幕信息:', info.screen)
    console.log('🪟 窗口信息:', info.window)
    console.log('🌐 浏览器信息:', info.browser)
    console.log('⏰ 时间信息:', info.time)
    console.log('🌍 网络信息:', info.network)
    console.log('💾 存储信息:', info.storage)
    console.log('⚡ 性能信息:', info.performance)
    console.log('📍 地理位置信息:', info.geolocation)
    console.log('🆔 设备指纹:', info.fingerprint)
    console.groupEnd()

    return info
  } catch (error) {
    console.error('❌ 获取设备信息失败:', error)
    return null
  }
}
