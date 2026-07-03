<template>
  <div class="min-h-screen">
    <div class="page-shell">
      <div class="hm-shell">
        <header class="hm-topbar">
          <div class="hm-brand-lockup">
            <span class="hm-brand-mark">HM</span>
            <p class="hm-brand">{{ appName }}</p>
            <span v-if="readOnly" class="hm-status hm-status-warning">Read only</span>
          </div>
          <nav class="hm-nav">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="hm-nav-link"
              active-class="hm-nav-link-active"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="hm-actions">
            <NuxtLink to="/settings" class="hm-button hm-button-sm">Settings</NuxtLink>
            <NuxtLink to="/audit" class="hm-button hm-button-sm">Audit</NuxtLink>
            <a href="/auth/logout" class="hm-button hm-button-primary hm-button-sm">Logout</a>
          </div>
        </header>
        <main>
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appName = config.public.headmasterAppName
const readOnly = config.public.headmasterReadOnly

const navItems = [
  { to: '/nodes', label: 'Nodes' },
  { to: '/users', label: 'Users' },
  { to: '/keys', label: 'Preauth Keys' },
  { to: '/apikeys', label: 'API Keys' },
  { to: '/routes', label: 'Routes' },
  { to: '/auth', label: 'Enroll' },
  { to: '/policy', label: 'Policy' },
]
</script>
