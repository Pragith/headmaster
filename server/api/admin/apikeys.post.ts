import { readBody } from 'h3'
import { appendAuditEntry } from '../../utils/audit'
import { requireActor } from '../../utils/actor'
import { createApiKey } from '../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ expiration?: string }>(event)
  const response = await createApiKey(body?.expiration)
  await appendAuditEntry({
    action: 'apikey.create',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { expiration: body?.expiration || '' },
  })
  return response
})
