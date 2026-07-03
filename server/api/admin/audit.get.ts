import { readAuditEntries } from '../../utils/audit'

export default defineEventHandler(async () => {
  return await readAuditEntries(100)
})
