import { readBody } from 'h3'
import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { approveAuthRequest } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ authId: string }>(event)
  const output = await approveAuthRequest(body.authId)
  await appendAuditEntry({
    action: 'auth.approve',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { authId: body.authId, output: output.slice(0, 300) },
  })
  return { ok: true, output }
})
