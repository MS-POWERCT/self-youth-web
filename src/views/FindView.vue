<template>
  <div class="find-container bg-gray50">
    <van-nav-bar title="发现" class="transparent-nav-bar" />
    <van-cell-group>
      <van-cell title="情侣圈" is-link to="/find/moments">
        <template #icon>
          <IconifyIcon
            icon="fluent-color:people-chat-24"
            class="cell-icon mr-10 text-pink"
            width="24"
            height="24"
          />
        </template>
      </van-cell>
    </van-cell-group>
    <!-- <van-cell-group class="mt-10">
      <van-cell title="成就" is-link>
        <template #icon>
          <IconifyIcon icon="fluent-color:ribbon-star-32" class="cell-icon mr-10 text-pink" width="24" height="24" />
        </template>
      </van-cell>
      <van-cell title="附近" is-link>
        <template #icon>
          <IconifyIcon icon="fluent-color:paw-24" class="cell-icon mr-10 text-pink" width="24" height="24" />
        </template>
      </van-cell>
    </van-cell-group>
    <van-cell-group class="mt-10">
      <van-cell title="相册">
        <template #icon>
          <IconifyIcon icon="fluent-color:image-28" class="cell-icon mr-10 text-pink" width="24" height="24" />
        </template>
      </van-cell>
    </van-cell-group> -->
  </div>
</template>
