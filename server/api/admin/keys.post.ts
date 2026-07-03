import { readBody } from 'h3'
import { appendAuditEntry } from '../../utils/audit'
import { requireActor } from '../../utils/actor'
import { createPreauthKey } from '../../utils/headscale'

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{
    userId: number
    expiration: string
    reusable: boolean
    ephemeral: boolean
    tags: string[]
  }>(event)
  const response = await createPreauthKey(body)
  await appendAuditEntry({
    action: 'preauthkey.create',
    actorName: actor.name,
    actorEmail: actor.email,
    details: { userId: body.userId, reusable: body.reusable, ephemeral: body.ephemeral, tags: body.tags },
  })
  return response
})
