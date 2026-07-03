import { readBody } from 'h3'
import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { renameNode } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ newName: string }>(event)
  const id = Number(getRouterParam(event, 'id'))
  await renameNode(id, body.newName)
  await appendAuditEntry({
    action: 'node.rename',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id, newName: body.newName },
  })
  return { ok: true }
})
