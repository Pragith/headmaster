<template>
  <div class="space-y-4">
    <SectionHeader title="Policy">
      <div class="flex gap-2">
        <button class="hm-button" @click="validatePolicy">Validate</button>
        <button class="hm-button hm-button-primary" @click="savePolicy">Apply</button>
      </div>
    </SectionHeader>

    <section class="hm-panel p-4">
      <textarea v-model="policyText" class="hm-textarea h-[34rem] font-mono" spellcheck="false" />
    </section>

    <section class="hm-panel p-4">
      <h3 class="text-lg font-semibold">Validation</h3>
      <pre class="mt-4 whitespace-pre-wrap font-mono text-sm">{{ validationResult }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const validationResult = ref('')
const { data, refresh } = await useAdminApi<{ policy: string }>('/policy')
const policyText = ref(data.value?.policy || '')

watch(data, () => {
  policyText.value = data.value?.policy || ''
})

async function validatePolicy() {
  const result = await $fetch<{ output: string }>('/api/admin/policy/check', {
    method: 'POST',
    body: { policy: policyText.value },
  })
  validationResult.value = result.output
}

async function savePolicy() {
  await $fetch('/api/admin/policy', {
    method: 'PUT',
    body: { policy: policyText.value },
  })
  validationResult.value = 'Policy applied.'
  await refresh()
}
</script>
