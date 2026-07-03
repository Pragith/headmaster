<template>
  <div class="space-y-4">
    <SectionHeader title="Nodes" />

    <section class="hm-panel">
      <div class="hm-panel-header">
        <a v-if="overview?.health.url" :href="overview.health.url" class="font-medium text-blue-600 hover:underline">
          {{ overview.health.url }}
        </a>
        <span v-if="overview?.health.status">{{ overview.health.status }}</span>
        <span>{{ overview?.totals.users ?? 0 }} users</span>
        <span>{{ overview?.totals.nodes ?? 0 }} nodes</span>
        <span>{{ overview?.totals.onlineNodes ?? 0 }} online</span>
      </div>
      <div class="hm-table-wrap">
        <table class="hm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>User</th>
              <th>IPs</th>
              <th>Tags</th>
              <th>Seen</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="node in overview?.recentNodes || []" :key="node.id">
              <td>{{ node.name }}</td>
              <td>{{ node.user?.name }}</td>
              <td class="font-mono text-xs">{{ node.ip_addresses?.join(', ') }}</td>
              <td class="font-mono text-xs">{{ (node.forced_tags || []).join(', ') }}</td>
              <td>{{ formatTs(node.last_seen) }}</td>
              <td>
                <span class="hm-status" :class="node.online ? 'hm-status-success' : 'hm-status-muted'">
                  {{ node.online ? 'online' : 'offline' }}
                </span>
              </td>
              <td class="space-x-2 text-right">
                <button class="hm-button hm-button-sm" @click="startRename(node)">Rename</button>
                <button class="hm-button hm-button-sm" @click="startTags(node)">Tags</button>
                <button class="hm-button hm-button-warning hm-button-sm" @click="startExpire(node)">Expire</button>
                <button class="hm-button hm-button-danger hm-button-sm" @click="startDelete(node)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="statusMessage" class="text-sm text-slate-600">{{ statusMessage }}</p>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(renameTarget) }">
      <div class="hm-dialog-panel space-y-4">
        <h3 class="text-lg font-semibold">Rename node</h3>
        <p class="text-sm text-slate-500">Node ID: {{ renameTarget?.id }}</p>
        <input v-model="renameValue" class="hm-input" />
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="renameTarget = null">Cancel</button>
          <button class="hm-button hm-button-primary" @click="renameNode">Save</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(tagTarget) }">
      <div class="hm-dialog-panel space-y-4">
        <h3 class="text-lg font-semibold">Update node tags</h3>
        <p class="text-sm text-slate-500">Use ACL-permitted tags only.</p>
        <textarea v-model="tagValue" class="hm-textarea h-28 font-mono" placeholder="tag:prod, tag:edge" />
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="tagTarget = null">Cancel</button>
          <button class="hm-button hm-button-primary" @click="saveTags">Save</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(expireTarget) }">
      <div class="hm-dialog-panel space-y-4">
        <h3 class="text-lg font-semibold">Expire node</h3>
        <p class="text-sm text-slate-500">
          Leave expiry blank to expire immediately, or disable expiry entirely for this node.
        </p>
        <label class="hm-field">
          <span class="hm-label">Expiry</span>
          <input v-model="expiryValue" class="hm-input" placeholder="2026-07-04T12:00:00Z" />
        </label>
        <label class="flex cursor-pointer items-center gap-3">
          <input v-model="disableExpiry" class="hm-checkbox" type="checkbox" />
          <span class="hm-label">Disable key expiry</span>
        </label>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="expireTarget = null">Cancel</button>
          <button class="hm-button hm-button-warning" @click="expireNode">Apply</button>
        </div>
      </div>
    </div>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(deleteTarget) }">
      <div class="hm-dialog-panel">
        <h3 class="text-lg font-semibold">Delete node</h3>
        <p class="mt-2 text-sm text-slate-500">This permanently removes the node from Headscale.</p>
        <p class="mt-3 font-medium">{{ deleteTarget?.name }}</p>
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="deleteTarget = null">Cancel</button>
          <button class="hm-button hm-button-danger" @click="deleteNode">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: overview, refresh } = await useAdminApi<{
  health: { status: string; url: string | null }
  totals: { users: number; nodes: number; onlineNodes: number }
  recentNodes: Array<Record<string, any>>
}>('/overview')

const renameTarget = ref<Record<string, any> | null>(null)
const tagTarget = ref<Record<string, any> | null>(null)
const expireTarget = ref<Record<string, any> | null>(null)
const deleteTarget = ref<Record<string, any> | null>(null)
const renameValue = ref('')
const tagValue = ref('')
const expiryValue = ref('')
const disableExpiry = ref(false)
const statusMessage = ref('')

function formatTs(value?: { seconds?: number }) {
  if (!value?.seconds) {
    return ''
  }
  return new Date(value.seconds * 1000).toISOString()
}

function startRename(node: Record<string, any>) {
  renameTarget.value = node
  renameValue.value = node.name
}

function startTags(node: Record<string, any>) {
  tagTarget.value = node
  tagValue.value = (node.forced_tags || []).join(', ')
}

function startExpire(node: Record<string, any>) {
  expireTarget.value = node
  expiryValue.value = ''
  disableExpiry.value = false
}

function startDelete(node: Record<string, any>) {
  deleteTarget.value = node
}

async function renameNode() {
  if (!renameTarget.value) {
    return
  }
  await $fetch(`/api/admin/nodes/${renameTarget.value.id}`, {
    method: 'PATCH',
    body: { newName: renameValue.value.trim() },
  })
  renameTarget.value = null
  statusMessage.value = 'Node renamed.'
  await refresh()
}

async function saveTags() {
  if (!tagTarget.value) {
    return
  }
  await $fetch(`/api/admin/nodes/${tagTarget.value.id}/tags`, {
    method: 'PUT',
    body: {
      tags: tagValue.value.split(',').map((item) => item.trim()).filter(Boolean),
    },
  })
  tagTarget.value = null
  statusMessage.value = 'Node tags updated.'
  await refresh()
}

async function expireNode() {
  if (!expireTarget.value) {
    return
  }
  await $fetch(`/api/admin/nodes/${expireTarget.value.id}/expire`, {
    method: 'POST',
    body: {
      expiry: expiryValue.value.trim(),
      disable: disableExpiry.value,
    },
  })
  expireTarget.value = null
  statusMessage.value = disableExpiry.value ? 'Node expiry disabled.' : 'Node expiry updated.'
  await refresh()
}

async function deleteNode() {
  if (!deleteTarget.value) {
    return
  }
  await $fetch(`/api/admin/nodes/${deleteTarget.value.id}`, { method: 'DELETE' })
  deleteTarget.value = null
  statusMessage.value = 'Node deleted.'
  await refresh()
}
</script>
