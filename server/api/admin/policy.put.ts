import { readBody } from 'h3'
import { appendAuditEntry } from '../../utils/audit'
import { requireActor } from '../../utils/actor'
import { setPolicy } from '../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ policy: string }>(event)
  const output = await setPolicy(body.policy)
  await appendAuditEntry({
    action: 'policy.apply',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { output: output.slice(0, 300) },
  })
  return { ok: true }
})
