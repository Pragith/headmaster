<template>
  <div class="space-y-4">
    <SectionHeader title="Preauth keys">
      <button class="hm-button hm-button-primary" @click="showCreate = true">Create key</button>
    </SectionHeader>

    <section class="hm-panel">
      <div class="hm-table-wrap">
        <table class="hm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Key prefix</th>
              <th>Reusable</th>
              <th>Ephemeral</th>
              <th>Expiration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in keys || []" :key="key.id">
              <td class="font-mono text-xs">{{ key.id }}</td>
              <td>{{ key.user?.name || key.user || '' }}</td>
              <td class="font-mono text-xs">{{ maskKey(key.key) }}</td>
              <td>{{ key.reusable ? 'Reusable' : 'Single use' }}</td>
              <td>{{ key.ephemeral ? 'Ephemeral' : 'Standard' }}</td>
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
        <h3 class="text-lg font-semibold">Create preauth key</h3>
        <label class="hm-field">
          <span class="hm-label">User ID</span>
          <input v-model="createForm.userId" class="hm-input" type="number" />
        </label>
        <label class="hm-field">
          <span class="hm-label">Expiration</span>
          <input v-model="createForm.expiration" class="hm-input" placeholder="30m, 24h, 7d" />
        </label>
        <label class="hm-field">
          <span class="hm-label">Tags</span>
          <input v-model="createForm.tags" class="hm-input" placeholder="tag:prod, tag:edge" />
        </label>
        <label class="flex cursor-pointer items-center gap-3">
          <input v-model="createForm.reusable" class="hm-checkbox" type="checkbox" />
          <span class="hm-label">Reusable</span>
        </label>
        <label class="flex cursor-pointer items-center gap-3">
          <input v-model="createForm.ephemeral" class="hm-checkbox" type="checkbox" />
          <span class="hm-label">Ephemeral</span>
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
        <h3 class="text-lg font-semibold">Expire preauth key</h3>
        <p class="mt-3 font-mono text-sm">{{ maskKey(expireTarget?.key) }}</p>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="expireTarget = null">Cancel</button>
          <button class="hm-button hm-button-warning" @click="expireKey">Expire</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(deleteTarget) }">
      <div class="hm-dialog-panel">
        <h3 class="text-lg font-semibold">Delete preauth key</h3>
        <p class="mt-3 font-mono text-sm">{{ maskKey(deleteTarget?.key) }}</p>
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

const { data: keys, refresh } = await useAdminApi<Array<Record<string, any>> | null>('/keys')
const showCreate = ref(false)
const newKey = ref('')
const statusMessage = ref('')
const expireTarget = ref<Record<string, any> | null>(null)
const deleteTarget = ref<Record<string, any> | null>(null)
const createForm = reactive({
  userId: '',
  expiration: '1h',
  tags: '',
  reusable: false,
  ephemeral: false,
})

function formatTs(value?: { seconds?: number }) {
  if (!value?.seconds) {
    return ''
  }
  return new Date(value.seconds * 1000).toISOString()
}

function maskKey(value?: string) {
  if (!value) {
    return ''
  }
  if (value.length < 18) {
    return value
  }
  return `${value.slice(0, 14)}...${value.slice(-8)}`
}

function closeCreate() {
  showCreate.value = false
  newKey.value = ''
}

async function createKey() {
  const response = await $fetch<{ key?: string }>('/api/admin/keys', {
    method: 'POST',
    body: {
      userId: Number(createForm.userId),
      expiration: createForm.expiration.trim(),
      reusable: createForm.reusable,
      ephemeral: createForm.ephemeral,
      tags: createForm.tags.split(',').map((item) => item.trim()).filter(Boolean),
    },
  })
  newKey.value = response.key || ''
  statusMessage.value = 'Preauth key created.'
  await refresh()
}

function startExpire(key: Record<string, any>) {
  expireTarget.value = key
}

function startDelete(key: Record<string, any>) {
  deleteTarget.value = key
}

async function expireKey() {
  if (!expireTarget.value) {
    return
  }
  await $fetch(`/api/admin/keys/${expireTarget.value.id}/expire`, { method: 'POST' })
  expireTarget.value = null
  statusMessage.value = 'Preauth key expired.'
  await refresh()
}

async function deleteKey() {
  if (!deleteTarget.value) {
    return
  }
  await $fetch(`/api/admin/keys/${deleteTarget.value.id}/delete`, { method: 'POST' })
  deleteTarget.value = null
  statusMessage.value = 'Preauth key deleted.'
  await refresh()
}
</script>
