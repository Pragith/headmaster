<template>
  <div class="space-y-4">
    <SectionHeader title="API keys">
      <button class="hm-button hm-button-primary" @click="showCreate = true">Create API key</button>
    </SectionHeader>

    <section class="hm-panel">
      <div class="hm-table-wrap">
        <table class="hm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Prefix</th>
              <th>Created</th>
              <th>Expiration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in keys || []" :key="key.id">
              <td class="font-mono text-xs">{{ key.id }}</td>
              <td class="font-mono text-xs">{{ key.prefix }}</td>
              <td>{{ formatTs(key.created_at) }}</td>
              <td>{{ formatTs(key.expiration) }}</td>
              <td class="space-x-2 text-right">
                <button class="hm-button hm-button-warning hm-button-sm" @click="startExpire(key)">Expire</button>
                <button class="hm-button hm-button-danger hm-button-sm" @click="startDelete(key)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="statusMessage" class="text-sm text-slate-600">{{ statusMessage }}</p>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': showCreate }">
      <div class="hm-dialog-panel space-y-4">
        <h3 class="text-lg font-semibold">Create API key</h3>
        <label class="hm-field">
          <span class="hm-label">Expiration</span>
          <input v-model="createExpiration" class="hm-input" placeholder="90d" />
        </label>
        <div v-if="newKey" class="hm-code">{{ newKey }}</div>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="closeCreate">Close</button>
          <button class="hm-button hm-button-primary" @click="createKey">Create</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(expireTarget) }">
      <div class="hm-dialog-panel">
        <h3 class="text-lg font-semibold">Expire API key</h3>
        <p class="mt-3 font-mono text-sm">{{ expireTarget?.prefix }}</p>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="expireTarget = null">Cancel</button>
          <button class="hm-button hm-button-warning" @click="expireKey">Expire</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(deleteTarget) }">
      <div class="hm-dialog-panel">
        <h3 class="text-lg font-semibold">Delete API key</h3>
        <p class="mt-3 font-mono text-sm">{{ deleteTarget?.prefix }}</p>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="deleteTarget = null">Cancel</button>
          <button class="hm-button hm-button-danger" @click="deleteKey">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: keys, refresh } = await useAdminApi<Array<Record<string, any>> | null>('/apikeys')
const showCreate = ref(false)
const createExpiration = ref('90d')
const newKey = ref('')
const statusMessage = ref('')
const expireTarget = ref<Record<string, any> | null>(null)
const deleteTarget = ref<Record<string, any> | null>(null)

function formatTs(value?: { seconds?: number }) {
  if (!value?.seconds) {
    return ''
  }
  return new Date(value.seconds * 1000).toISOString()
}

function closeCreate() {
  showCreate.value = false
  newKey.value = ''
}

function startExpire(key: Record<string, any>) {
  expireTarget.value = key
}

function startDelete(key: Record<string, any>) {
  deleteTarget.value = key
}

async function createKey() {
  const response = await $fetch<string | Record<string, any>>('/api/admin/apikeys', {
    method: 'POST',
    body: { expiration: createExpiration.value.trim() },
  })
  newKey.value = typeof response === 'string' ? response : JSON.stringify(response, null, 2)
  statusMessage.value = 'API key created.'
  await refresh()
}

async function expireKey() {
  if (!expireTarget.value) {
    return
  }
  await $fetch('/api/admin/apikeys/expire', {
    method: 'POST',
    body: { id: Number(expireTarget.value.id), prefix: String(expireTarget.value.prefix || '') },
  })
  expireTarget.value = null
  statusMessage.value = 'API key expired.'
  await refresh()
}

async function deleteKey() {
  if (!deleteTarget.value) {
    return
  }
  await $fetch('/api/admin/apikeys/delete', {
    method: 'POST',
    body: { id: Number(deleteTarget.value.id), prefix: String(deleteTarget.value.prefix || '') },
  })
  deleteTarget.value = null
  statusMessage.value = 'API key deleted.'
  await refresh()
}
</script>
