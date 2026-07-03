<template>
  <div class="space-y-4">
    <SectionHeader title="Audit" />

    <section class="hm-panel p-4">
      <div class="space-y-3">
        <div v-for="entry in entries || []" :key="entry.id" class="rounded-md border border-slate-200 p-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="font-medium">{{ entry.action }}</p>
              <p class="text-sm text-slate-500">{{ entry.actorName || entry.actorEmail || '' }}</p>
            </div>
            <div class="font-mono text-xs text-slate-500">{{ new Date(entry.at).toISOString() }}</div>
          </div>
          <pre class="hm-code mt-3">{{ JSON.stringify(entry.details || {}, null, 2) }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: entries } = await useAdminApi<Array<Record<string, any>>>('/audit')
</script>
