import { createError, type H3Event } from 'h3'
import { getSessionCookie } from './cookies'

export async function requireActor(event: H3Event) {
  const session = await getSessionCookie(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return {
    sub: String(session.sub || ''),
    name: String(session.name || ''),
    email: String(session.email || ''),
    groups: Array.isArray(session.groups) ? session.groups.map((value) => String(value)) : [],
  }
}
