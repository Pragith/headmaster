import { listPreauthKeys } from '../../utils/headscale'

export default defineEventHandler(async () => {
  return await listPreauthKeys()
})
