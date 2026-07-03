import { readBody } from 'h3'
import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { approveRoutes } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ routes: string[] }>(event)
  const id = Number(getRouterParam(event, 'id'))
  await approveRoutes(id, body.routes)
  await appendAuditEntry({
    action: 'routes.approve',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { id, routes: body.routes },
  })
  return { ok: true }
})
