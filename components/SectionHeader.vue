<template>
  <div class="hm-page-header">
    <div>
      <p v-if="eyebrow" class="hm-eyebrow">{{ eyebrow }}</p>
      <h1 class="hm-title">{{ title }}</h1>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
}>()
</script>
