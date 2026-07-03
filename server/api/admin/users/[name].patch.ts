import { readBody } from 'h3'
import { appendAuditEntry } from '../../../utils/audit'
import { requireActor } from '../../../utils/actor'
import { renameUser } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ newName: string }>(event)
  const actor = await requireActor(event)
  const currentName = getRouterParam(event, 'name') || ''
  await renameUser(currentName, body.newName)
  await appendAuditEntry({
    action: 'user.rename',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { currentName, newName: body.newName },
  })
  return { ok: true }
})
