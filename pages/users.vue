<template>
  <div class="space-y-4">
    <SectionHeader title="Users">
      <button class="hm-button hm-button-primary" @click="showCreate = true">Create user</button>
    </SectionHeader>

    <section class="hm-panel">
      <div class="hm-table-wrap">
        <table class="hm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Display</th>
              <th>Email</th>
              <th>Provider</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users || []" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.display_name || '' }}</td>
              <td>{{ user.email || '' }}</td>
              <td>{{ user.provider || '' }}</td>
              <td>{{ formatTs(user.created_at) }}</td>
              <td class="space-x-2 text-right">
                <button class="hm-button hm-button-sm" @click="startRename(user)">Rename</button>
                <button class="hm-button hm-button-danger hm-button-sm" @click="startDestroy(user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="statusMessage" class="text-sm text-slate-600">{{ statusMessage }}</p>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': showCreate }">
      <div class="hm-dialog-panel space-y-4">
        <h3 class="text-lg font-semibold">Create user</h3>
        <label class="hm-field">
          <span class="hm-label">Username</span>
          <input v-model="createForm.name" class="hm-input" />
        </label>
        <label class="hm-field">
          <span class="hm-label">Display name</span>
          <input v-model="createForm.displayName" class="hm-input" />
        </label>
        <label class="hm-field">
          <span class="hm-label">Email</span>
          <input v-model="createForm.email" class="hm-input" type="email" />
        </label>
        <label class="hm-field">
          <span class="hm-label">Picture URL</span>
          <input v-model="createForm.pictureUrl" class="hm-input" />
        </label>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="showCreate = false">Cancel</button>
          <button class="hm-button hm-button-primary" @click="createUser">Create</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(renameTarget) }">
      <div class="hm-dialog-panel space-y-4">
        <h3 class="text-lg font-semibold">Rename user</h3>
        <p class="text-sm text-slate-500">Current: {{ renameTarget?.name }}</p>
        <label class="hm-field">
          <span class="hm-label">New username</span>
          <input v-model="renameValue" class="hm-input" />
        </label>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="renameTarget = null">Cancel</button>
          <button class="hm-button hm-button-primary" @click="renameUser">Save</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(destroyTarget) }">
      <div class="hm-dialog-panel">
        <h3 class="text-lg font-semibold">Delete user</h3>
        <p class="mt-2 text-sm text-slate-500">
          Headscale will remove the user and associated preauth keys.
        </p>
        <p class="mt-3 font-medium">{{ destroyTarget?.name }}</p>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="destroyTarget = null">Cancel</button>
          <button class="hm-button hm-button-danger" @click="destroyUser">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: users, refresh } = await useAdminApi<Array<Record<string, any>>>('/users')
const showCreate = ref(false)
const renameTarget = ref<Record<string, any> | null>(null)
const destroyTarget = ref<Record<string, any> | null>(null)
const renameValue = ref('')
const statusMessage = ref('')
const createForm = reactive({
  name: '',
  displayName: '',
  email: '',
  pictureUrl: '',
})

function formatTs(value?: { seconds?: number }) {
  if (!value?.seconds) {
    return ''
  }
  return new Date(value.seconds * 1000).toISOString()
}

async function createUser() {
  await $fetch('/api/admin/users', {
    method: 'POST',
    body: {
      name: createForm.name.trim(),
      displayName: createForm.displayName.trim(),
      email: createForm.email.trim(),
      pictureUrl: createForm.pictureUrl.trim(),
    },
  })
  createForm.name = ''
  createForm.displayName = ''
  createForm.email = ''
  createForm.pictureUrl = ''
  showCreate.value = false
  statusMessage.value = 'User created.'
  await refresh()
}

function startRename(user: Record<string, any>) {
  renameTarget.value = user
  renameValue.value = user.name
}

function startDestroy(user: Record<string, any>) {
  destroyTarget.value = user
}

async function renameUser() {
  if (!renameTarget.value) {
    return
  }
  await $fetch(`/api/admin/users/${renameTarget.value.name}`, {
    method: 'PATCH',
    body: { newName: renameValue.value.trim() },
  })
  renameTarget.value = null
  statusMessage.value = 'User renamed.'
  await refresh()
}

async function destroyUser() {
  if (!destroyTarget.value) {
    return
  }
  await $fetch(`/api/admin/users/${destroyTarget.value.name}`, { method: 'DELETE' })
  destroyTarget.value = null
  statusMessage.value = 'User deleted.'
  await refresh()
}
</script>
