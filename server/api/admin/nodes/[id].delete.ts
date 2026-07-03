import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { deleteNode } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = Number(getRouterParam(event, 'id'))
  await deleteNode(id)
  await appendAuditEntry({
    action: 'node.delete',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id },
  })
  return { ok: true }
})
