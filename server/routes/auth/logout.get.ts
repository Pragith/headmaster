import { logout } from '../../utils/oidc'

export default defineEventHandler((event) => {
  return logout(event)
})
