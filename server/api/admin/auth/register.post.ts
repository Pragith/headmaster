import { readBody } from 'h3'
import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { registerAuthRequest } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ authId: string; user: string }>(event)
  const output = await registerAuthRequest(body)
  await appendAuditEntry({
    action: 'auth.register',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { authId: body.authId, user: body.user, output: output.slice(0, 300) },
  })
  return { ok: true, output }
})
