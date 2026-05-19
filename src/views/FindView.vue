<template>
  <div class="find-container">
    <van-nav-bar title="发现" class="transparent-nav-bar" />
    <van-cell-group>
      <van-cell title="情侣圈" is-link to="/find/moments">
        <template #icon>
          <IconifyIcon icon="fluent-color:people-chat-24" class="cell-icon" width="24" height="24" />
        </template>
      </van-cell>
    </van-cell-group>
    <van-cell-group class="margin-top">
      <van-cell title="成就" is-link>
        <template #icon>
          <IconifyIcon icon="fluent-color:ribbon-star-32" class="cell-icon" width="24" height="24" />
        </template>
      </van-cell>
      <van-cell title="附近" is-link>
        <template #icon>
          <IconifyIcon icon="fluent-color:paw-24" class="cell-icon" width="24" height="24" />
        </template>
      </van-cell>
    </van-cell-group>
    <van-cell-group class="margin-top">
      <van-cell title="相册">
        <template #icon>
          <IconifyIcon icon="fluent-color:image-28" class="cell-icon" width="24" height="24" />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup>
// import { Icon } from '@iconify/vue'
// 如果需要处理点击事件，可以添加相应的方法
// const handleCellClick = (path) => {
//   router.push(path)
// }
</script>

<style scoped>
.find-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.transparent-nav-bar {
  background-color: transparent !important;
  border-bottom: none !important;
}
.margin-top {
  margin-top: 10px;
}

.cell-icon {
  margin-right: 10px;
  color: #e091bf;
}

:deep(.van-cell__title) {
  font-size: 16px;
}

:deep(.van-cell) {
  align-items: center;
}
</style>
