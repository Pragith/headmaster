import { readBody } from 'h3'
import { appendAuditEntry } from '../../../../utils/audit'
import { requireActor } from '../../../../utils/actor'
import { updateNodeTags } from '../../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ tags: string[] }>(event)
  const id = Number(getRouterParam(event, 'id'))
  await updateNodeTags(id, body.tags || [])
  await appendAuditEntry({
    action: 'node.tags',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id, tags: body.tags || [] },
  })
  return { ok: true }
})
