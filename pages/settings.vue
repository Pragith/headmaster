<template>
  <div class="space-y-4">
    <SectionHeader title="Settings" />

    <section class="hm-panel">
      <table class="hm-table">
        <tbody>
          <tr v-for="item in settings?.items || []" :key="item.key">
            <th class="w-80 font-mono">{{ item.key }}</th>
            <td class="break-all">{{ item.value }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="hm-panel p-4">
      <h3 class="text-lg font-semibold">Headscale</h3>
      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <div>
          <p class="hm-eyebrow">Health</p>
          <p class="mt-2 text-sm">{{ settings?.headscale.health?.status || 'unknown' }}</p>
        </div>
        <div>
          <p class="hm-eyebrow">Version</p>
          <pre class="mt-2 whitespace-pre-wrap font-mono text-xs">{{ settings?.headscale.version || '' }}</pre>
        </div>
        <div>
          <p class="hm-eyebrow">Config Test</p>
          <pre class="mt-2 whitespace-pre-wrap font-mono text-xs">{{ settings?.headscale.configtest || '' }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: settings } = await useAdminApi<{
  items: Array<{ key: string; value: string }>
  headscale: {
    health: { status?: string; url?: string | null }
    version: string
    configtest: string
  }
}>('/settings')
</script>
