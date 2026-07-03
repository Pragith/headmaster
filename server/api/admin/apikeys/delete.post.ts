import { readBody } from 'h3'
import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { deleteApiKey } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ id?: number; prefix?: string }>(event)
  await deleteApiKey(body || {})
  await appendAuditEntry({
    action: 'apikey.delete',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id: body?.id || 0, prefix: body?.prefix || '' },
  })
  return { ok: true }
})
