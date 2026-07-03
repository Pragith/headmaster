import { listRoutes } from '../../utils/headscale'

export default defineEventHandler(async () => {
  return await listRoutes()
})
