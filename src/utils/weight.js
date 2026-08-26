export function toWeightKg(weight, unit = 'kg') {
  const numericWeight = Number(weight)
  if (Number.isNaN(numericWeight)) {
    return null
  }

  return unit === 'jin' ? numericWeight / 2 : numericWeight
}

export function calcBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) {
    return null
  }

  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function calcBodyFatPercent(bmi, age, gender) {
  if (bmi == null || !age) {
    return null
  }

  const base = 1.2 * bmi + 0.23 * Number(age)
  return genderToApi(gender) === 2 ? base - 5.4 : base - 16.2
}

export function genderToApi(gender) {
  const value = Number(gender)
  if (value === 0 || value === 1 || value === 2) {
    return value
  }
  if (gender === 'male') {
    return 1
  }
  if (gender === 'female') {
    return 2
  }
  return 0
}

export function genderFromUser(userGender) {
  const gender = Number(userGender)
  if (gender === 1 || gender === 2) {
    return gender
  }
  return 1
}

export function validateBodyProfile({ age, gender, height }) {
  const ageNum = Number(age)
  if (!age || Number.isNaN(ageNum)) {
    return '请输入年龄'
  }
  if (ageNum < 1) {
    return '年龄不能小于1岁'
  }
  if (ageNum > 150) {
    return '年龄不能大于150岁'
  }

  const genderNum = genderToApi(gender)
  if (![0, 1, 2].includes(genderNum)) {
    return '性别只能是0未知、1男、2女'
  }

  const heightNum = Number(height)
  if (!height || Number.isNaN(heightNum)) {
    return '请输入身高'
  }
  if (heightNum < 50) {
    return '身高不能小于50cm'
  }
  if (heightNum > 250) {
    return '身高不能大于250cm'
  }

  return ''
}

export function hasCompleteBodyProfile(profile) {
  if (!profile) {
    return false
  }

  const gender = genderToApi(profile.gender)
  return !!(profile.height && profile.age && (gender === 1 || gender === 2))
}

export function getBmiStatus(bmi) {
  if (bmi == null) {
    return ''
  }
  if (bmi < 18.5) {
    return '偏瘦'
  }
  if (bmi < 24) {
    return '正常'
  }
  if (bmi < 28) {
    return '偏胖'
  }
  return '肥胖'
}

export const BMI_SEGMENTS = [
  { label: '偏瘦', min: 15, max: 18.5, color: '#6BA3D6' },
  { label: '正常', min: 18.5, max: 24, color: '#3d8f82' },
  { label: '偏胖', min: 24, max: 28, color: '#F0AD4E' },
  { label: '肥胖', min: 28, max: 35, color: '#E85D5D' },
]

export const BMI_SCALE_MIN = 15
export const BMI_SCALE_MAX = 35

export function getBmiMarkerPercent(bmi) {
  if (bmi == null) {
    return 0
  }

  const clamped = Math.max(BMI_SCALE_MIN, Math.min(BMI_SCALE_MAX, bmi))
  return ((clamped - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100
}

export function getBmiStatusColor(bmi) {
  const status = getBmiStatus(bmi)
  return BMI_SEGMENTS.find((segment) => segment.label === status)?.color || '#3d8f82'
}

export function getBmiScaleTicks() {
  const values = [BMI_SCALE_MIN, 18.5, 24, 28, BMI_SCALE_MAX]
  return values.map((value) => ({
    value,
    label: Number.isInteger(value) ? String(value) : value.toFixed(1),
    percent: getBmiMarkerPercent(value),
  }))
}

export function getBmiSegmentRangeText(segment) {
  if (segment.label === '偏瘦') {
    return `<${segment.max}`
  }
  if (segment.label === '肥胖') {
    return `≥${segment.min}`
  }
  return `${segment.min}-${segment.max}`
}
