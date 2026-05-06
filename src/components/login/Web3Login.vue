<template>
  <div class="web3">
    <div class="web3-copy">
      Web3 登录将使用钱包地址 /
      签名完成鉴权。当前版本仅保留入口与信息结构，避免影响现有账号体系。
    </div>
    <van-field
      v-model="walletAddress"
      readonly
      label="钱包地址"
      placeholder="（预留）连接钱包后自动填充"
    />
    <van-button block round type="primary" disabled class="primary-btn">
      连接钱包并登录（敬请期待）
    </van-button>
    <van-button block round plain type="primary" @click="handleWeb3Placeholder">
      查看预留说明
    </van-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const walletAddress = ref('')

const handleWeb3Placeholder = () => {
  showToast('Web3：预留入口。后续接入 provider + 签名 + 后端验签换取 token。')
}
</script>

<style scoped>
.web3 {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.web3-copy {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(11, 18, 32, 0.72);
  padding: 6px 6px 2px;
}

.primary-btn {
  margin-top: 6px;
}

:deep(.van-field) {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(11, 18, 32, 0.08);
  background: rgba(255, 255, 255, 0.75);
}

:deep(.van-field__label) {
  width: 64px;
  color: rgba(11, 18, 32, 0.62);
  font-weight: 700;
}
</style>
