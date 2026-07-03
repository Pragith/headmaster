<template>
  <div class="space-y-4">
    <SectionHeader title="Routes" />

    <section class="hm-panel">
      <div class="hm-table-wrap">
        <table class="hm-table">
          <thead>
            <tr>
              <th>Node</th>
              <th>Advertised</th>
              <th>Approved</th>
              <th>Primary</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route in routes || []" :key="route.node?.id">
              <td>{{ route.node?.name || route.node_id }}</td>
              <td class="font-mono text-xs">{{ (route.available_routes || []).join(', ') }}</td>
              <td class="font-mono text-xs">{{ (route.approved_routes || []).join(', ') }}</td>
              <td>{{ route.is_primary ? 'yes' : 'no' }}</td>
              <td class="text-right">
                <button class="hm-button hm-button-sm" @click="startEdit(route)">Approve</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="hm-dialog" :class="{ 'hm-dialog-open': Boolean(editTarget) }">
      <div class="hm-dialog-panel">
        <h3 class="text-lg font-semibold">Approve routes</h3>
        <p class="mt-1 text-sm text-slate-500">Node ID: {{ editTarget?.node_id }}</p>
        <textarea v-model="routeInput" class="hm-textarea mt-4 h-36 font-mono" />
        <div class="hm-dialog-actions">
          <button class="hm-button" @click="editTarget = null">Cancel</button>
          <button class="hm-button hm-button-primary" @click="saveRoutes">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: routes, refresh } = await useAdminApi<Array<Record<string, any>>>('/routes')
const editTarget = ref<Record<string, any> | null>(null)
const routeInput = ref('')

function startEdit(route: Record<string, any>) {
  editTarget.value = route
  routeInput.value = (route.approved_routes || []).join(', ')
}

async function saveRoutes() {
  if (!editTarget.value) {
    return
  }
  await $fetch(`/api/admin/routes/${editTarget.value.node_id}`, {
    method: 'POST',
    body: {
      routes: routeInput.value.split(',').map((item) => item.trim()).filter(Boolean),
    },
  })
  editTarget.value = null
  await refresh()
}
</script>
