<template>
  <header class="primary-page-header">
    <h1 class="primary-page-title">{{ title }}</h1>
    <div class="primary-page-header__action">
      <slot name="action">
        <span class="primary-page-header__spacer" aria-hidden="true" />
      </slot>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>
