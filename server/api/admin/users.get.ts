import { listUsers } from '../../utils/headscale'

export default defineEventHandler(async () => {
  return await listUsers()
})
