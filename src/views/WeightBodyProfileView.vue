<template>
  <div class="body-profile-page">
    <van-nav-bar title="身体参数" left-arrow @click-left="$router.back()" />

    <div class="profile-content">
      <div class="profile-tip">
        填写身高、年龄和性别后，系统会根据当前体重自动计算 BMI 和估算体脂率。信息会保存到你的账号中。
      </div>

      <div class="form-card">
        <van-field
          v-model="form.height"
          type="digit"
          label="身高(cm)"
          placeholder="50-250"
          input-align="right"
        />
        <van-field
          v-model="form.age"
          type="digit"
          label="年龄"
          placeholder="1-150"
          input-align="right"
        />
        <van-field label="性别" input-align="right">
          <template #input>
            <van-radio-group v-model="form.gender" direction="horizontal">
              <van-radio :name="1">男</van-radio>
              <van-radio :name="2">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </div>

      <div v-if="previewReady" class="preview-card">
        <div class="preview-title">当前估算</div>
        <div class="preview-row">
          <span>BMI</span>
          <strong>{{ previewBmi }}</strong>
        </div>
        <BmiProgressBar :bmi="previewBmiValue" />
        <div class="preview-row">
          <span>体脂率</span>
          <strong>{{ previewBodyFat }}%</strong>
        </div>
        <div class="preview-note">{{ previewNote }}</div>
      </div>

      <van-button
        type="primary"
        block
        round
        class="save-btn"
        :loading="saving"
        @click="handleSave"
      >
        保存
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useWeightStore } from '@/stores/weight'
import { useUserStore } from '@/stores/user'
import BmiProgressBar from '@/components/weight/BmiProgressBar.vue'
import {
  calcBmi,
  calcBodyFatPercent,
  genderFromUser,
  genderToApi,
  toWeightKg,
  validateBodyProfile,
} from '@/utils/weight'

const route = useRoute()
const router = useRouter()
const weightStore = useWeightStore()
const userStore = useUserStore()
const saving = ref(false)

const form = ref({
  height: '',
  age: '',
  gender: 1,
})

const currentWeightKg = computed(() => {
  const stats = weightStore.stats
  if (!stats?.current_weight) {
    return null
  }
  return toWeightKg(stats.current_weight, stats.unit)
})

const previewBmiValue = computed(() =>
  calcBmi(currentWeightKg.value, Number(form.value.height)),
)

const previewReady = computed(
  () => !!(form.value.height && form.value.age && previewBmiValue.value != null),
)

const previewBmi = computed(() =>
  previewBmiValue.value != null ? previewBmiValue.value.toFixed(1) : '--',
)

const previewBodyFat = computed(() => {
  const bodyFat = calcBodyFatPercent(
    previewBmiValue.value,
    form.value.age,
    form.value.gender,
  )
  return bodyFat != null ? bodyFat.toFixed(1) : '--'
})

const previewNote = computed(() => '体脂率为根据 BMI 和年龄的估算值')

const loadFormFromUser = () => {
  const user = userStore.user
  form.value = {
    height: user?.height ? String(user.height) : '',
    age: user?.age ? String(user.age) : '',
    gender: genderFromUser(user?.gender),
  }
  weightStore.syncBodyProfileFromUser(user)
}

onMounted(async () => {
  try {
    if (!userStore.user?.height && !userStore.user?.age) {
      await userStore.getUserInfo()
    }
    loadFormFromUser()

    if (!weightStore.stats) {
      await weightStore.fetchStats()
    }
  } catch (error) {
    console.error('加载身体参数失败', error)
  }
})

const handleSave = async () => {
  const errorMessage = validateBodyProfile(form.value)
  if (errorMessage) {
    showToast(errorMessage)
    return
  }

  const payload = {
    age: Number(form.value.age),
    gender: genderToApi(form.value.gender),
    height: Number(form.value.height),
  }

  try {
    saving.value = true
    await userStore.fillInfo(payload)
    weightStore.syncBodyProfileFromUser(userStore.user)
    showToast('保存成功')
    router.back()
  } catch (error) {
    console.error('保存身体参数失败', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.body-profile-page {
  min-height: 100vh;
  background-color: #f4f5f7;
}

.profile-content {
  padding: var(--px-16);
}

.profile-tip {
  margin-bottom: var(--px-12);
  padding: var(--px-12) var(--px-14);
  border-radius: var(--radius-12);
  background-color: #e8f4f2;
  color: #3d8f82;
  font-size: var(--rem-8);
  line-height: 1.5;
}

.form-card,
.preview-card {
  margin-bottom: var(--px-12);
  border-radius: var(--radius-16);
  background-color: var(--white);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.preview-card {
  padding: var(--px-16);
}

.preview-title {
  font-size: var(--rem-9);
  color: var(--gray500);
  margin-bottom: var(--px-10);
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--px-8) 0;
  font-size: var(--rem-10);
  color: var(--black300);
}

.preview-row strong {
  font-size: var(--rem-12);
  color: #3d8f82;
}

.preview-note {
  margin-top: var(--px-8);
  font-size: var(--rem-8);
  color: var(--gray500);
  line-height: 1.4;
}

.save-btn {
  margin-top: var(--px-8);
  background: #3d8f82;
  border-color: #3d8f82;
}
</style>
