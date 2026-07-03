import { beginLogin } from '../../utils/oidc'

export default defineEventHandler(async (event) => {
  return await beginLogin(event)
})
