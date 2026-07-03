import { getPolicy } from '../../utils/headscale'

export default defineEventHandler(async () => {
  return {
    policy: await getPolicy(),
  }
})
