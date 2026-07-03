<template>
  <div class="space-y-4">
    <SectionHeader title="Enrollment" />

    <section class="grid gap-4 xl:grid-cols-3">
      <div class="hm-panel p-4 space-y-4">
        <h3 class="text-lg font-semibold">Register</h3>
        <label class="hm-field">
          <span class="hm-label">Auth ID</span>
          <input v-model="registerForm.authId" class="hm-input font-mono" />
        </label>
        <label class="hm-field">
          <span class="hm-label">User</span>
          <input v-model="registerForm.user" class="hm-input" />
        </label>
        <button class="hm-button hm-button-primary" @click="registerNode">Register node</button>
      </div>

      <div class="hm-panel p-4 space-y-4">
        <h3 class="text-lg font-semibold">Approve</h3>
        <label class="hm-field">
          <span class="hm-label">Auth ID</span>
          <input v-model="approveAuthId" class="hm-input font-mono" />
        </label>
        <button class="hm-button hm-button-primary" @click="approveNode">Approve request</button>
      </div>

      <div class="hm-panel p-4 space-y-4">
        <h3 class="text-lg font-semibold">Reject</h3>
        <label class="hm-field">
          <span class="hm-label">Auth ID</span>
          <input v-model="rejectAuthId" class="hm-input font-mono" />
        </label>
        <button class="hm-button hm-button-danger" @click="rejectNode">Reject request</button>
      </div>
    </section>

    <section class="hm-panel p-4">
      <h3 class="text-lg font-semibold">Headscale diagnostics</h3>
      <div class="mt-4 grid gap-3 lg:grid-cols-3">
        <div>
          <p class="hm-eyebrow">Health</p>
          <p class="mt-2 text-sm">{{ headscale?.health?.status || 'unknown' }}</p>
        </div>
        <div>
          <p class="hm-eyebrow">Version</p>
          <pre class="mt-2 whitespace-pre-wrap font-mono text-xs">{{ headscale?.version || '' }}</pre>
        </div>
        <div>
          <p class="hm-eyebrow">Config Test</p>
          <pre class="mt-2 whitespace-pre-wrap font-mono text-xs">{{ headscale?.configtest || '' }}</pre>
        </div>
      </div>
    </section>

    <section class="hm-panel p-4">
      <h3 class="text-lg font-semibold">Last command output</h3>
      <pre class="hm-code mt-4">{{ output }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: headscale, refresh } = await useAdminApi<{
  health: { status?: string; url?: string | null }
  version: string
  configtest: string
}>('/headscale')

const registerForm = reactive({
  authId: '',
  user: '',
})
const approveAuthId = ref('')
const rejectAuthId = ref('')
const output = ref('')

async function registerNode() {
  const response = await $fetch<{ ok: boolean; output: string }>('/api/admin/auth/register', {
    method: 'POST',
    body: {
      authId: registerForm.authId.trim(),
      user: registerForm.user.trim(),
    },
  })
  output.value = response.output
  await refresh()
}

async function approveNode() {
  const response = await $fetch<{ ok: boolean; output: string }>('/api/admin/auth/approve', {
    method: 'POST',
    body: { authId: approveAuthId.value.trim() },
  })
  output.value = response.output
  await refresh()
}

async function rejectNode() {
  const response = await $fetch<{ ok: boolean; output: string }>('/api/admin/auth/reject', {
    method: 'POST',
    body: { authId: rejectAuthId.value.trim() },
  })
  output.value = response.output
  await refresh()
}
</script>
