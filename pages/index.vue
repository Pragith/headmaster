<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
await navigateTo('/nodes', { replace: true })
</script>
