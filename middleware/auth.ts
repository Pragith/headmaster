export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/login') || to.path.startsWith('/auth/')) {
    return
  }

  const session = useState<{ authenticated?: boolean }>('headmaster-session-state', () => ({}))

  if (session.value.authenticated) {
    return
  }

  try {
    await $fetch('/api/session', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
    session.value.authenticated = true
  } catch {
    return navigateTo('/login')
  }
})
