import { readBody } from 'h3'
import { appendAuditEntry } from '../../../../utils/audit'
import { requireActor } from '../../../../utils/actor'
import { expireNode } from '../../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ expiry?: string; disable?: boolean }>(event)
  const id = Number(getRouterParam(event, 'id'))
  await expireNode({ id, expiry: body?.expiry, disable: body?.disable })
  await appendAuditEntry({
    action: 'node.expire',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id, expiry: body?.expiry || '', disable: Boolean(body?.disable) },
  })
  return { ok: true }
})
