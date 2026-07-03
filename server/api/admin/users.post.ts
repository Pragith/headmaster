import { readBody } from 'h3'
import { appendAuditEntry } from '../../utils/audit'
import { requireActor } from '../../utils/actor'
import { createUser } from '../../utils/headscale'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string
    displayName?: string
    email?: string
    pictureUrl?: string
  }>(event)
  const actor = await requireActor(event)
  const response = await createUser(body)
  await appendAuditEntry({
    action: 'user.create',
    actorName: actor.name,
    actorEmail: actor.email,
    details: {
      name: body.name,
      displayName: body.displayName || '',
      email: body.email || '',
      pictureUrl: body.pictureUrl || '',
    },
  })
  return response
})
