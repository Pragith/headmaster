import { listNodes } from '../../utils/headscale'

export default defineEventHandler(async () => {
  return await listNodes()
})
