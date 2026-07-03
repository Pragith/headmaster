import { createError, getMethod } from 'h3'
import { getSessionCookie } from '../utils/cookies'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin')) {
    return
  }

  const config = useHeadmasterConfig()
  if (config.readOnly && getMethod(event) !== 'GET') {
    throw createError({ statusCode: 403, statusMessage: 'Read-only mode is enabled' })
  }

  if (!config.authEnabled) {
    return
  }

  const session = await getSessionCookie(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const adminGroup = config.authAdminGroup
  const groups = Array.isArray(session.groups) ? session.groups.map((value) => String(value)) : []
  if (adminGroup && !groups.includes(adminGroup)) {
    throw createError({ statusCode: 403, statusMessage: 'Admin group required' })
  }
})
