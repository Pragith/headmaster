import { createError } from 'h3'
import { getSessionCookie } from '../utils/cookies'

export default defineEventHandler(async (event) => {
  if (!useHeadmasterConfig().authEnabled) {
    return {
      authenticated: true,
      name: 'Local operator',
      email: '',
      groups: [],
    }
  }

  const session = await getSessionCookie(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  }
  return {
    authenticated: true,
    name: session.name,
    email: session.email,
    groups: session.groups,
  }
})
