import { listApiKeys } from '../../utils/headscale'

export default defineEventHandler(async () => {
  return await listApiKeys()
})
