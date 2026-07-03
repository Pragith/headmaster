import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { destroyUser } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const name = getRouterParam(event, 'name') || ''
  await destroyUser(name)
  await appendAuditEntry({
    action: 'user.destroy',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { name },
  })
  return { ok: true }
})
