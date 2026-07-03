import { handleCallback } from '../../utils/oidc'

export default defineEventHandler(async (event) => {
  return await handleCallback(event)
})
