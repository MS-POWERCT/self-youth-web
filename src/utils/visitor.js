import { Capacitor } from '@capacitor/core'

export function getVisitorId() {
  let vid = localStorage.getItem('visitor_id')
  if (vid) {
    return vid
  }

  let deviceId
  const type = getDeviceType()

  if (Capacitor.isNativePlatform()) {
    deviceId = getNativeDeviceId()
  } else {
    deviceId = createUUID()
  }

  vid = `visitor_${type}_${deviceId}`
  localStorage.setItem('visitor_id', vid)

  return vid
}

async function getNativeDeviceId() {
  try {
    const { Device } = await import('@capacitor/device')
    const info = await Device.getId()
    return info.uuid
  } catch {
    return createUUID()
  }
}

// 工具：生成唯一ID
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getDeviceType() {
  const platform = Capacitor.getPlatform()

  if (platform === 'android') {
    return 'app_android'
  } else if (platform === 'ios') {
    return 'app_ios'
  } else if (platform === 'web') {
    const ua = navigator.userAgent
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(ua)) {
      return 'web_mobile'
    }
    return 'web_pc'
  }
  return 'web_pc'
}

export function isVisitor() {
  const token = localStorage.getItem('user-token')
  const visitorId = localStorage.getItem('visitor_id')
  return !token && visitorId
}

export function clearVisitor() {
  localStorage.removeItem('visitor_id')
}
