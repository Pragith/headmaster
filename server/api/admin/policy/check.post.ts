import { readBody } from 'h3'
import { checkPolicy } from '../../../utils/headscale'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ policy: string }>(event)
  return {
    output: await checkPolicy(body.policy),
  }
})
