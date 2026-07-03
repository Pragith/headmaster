import { appendAuditEntry } from '../../../../utils/audit'
import { requireActor } from '../../../../utils/actor'
import { expirePreauthKey } from '../../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = Number(getRouterParam(event, 'id'))
  await expirePreauthKey(id)
  await appendAuditEntry({
    action: 'preauthkey.expire',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id },
  })
  return { ok: true }
})
