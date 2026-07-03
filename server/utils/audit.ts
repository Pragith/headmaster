import { mkdir, readFile, appendFile } from 'node:fs/promises'
import { dirname } from 'node:path'

type AuditEntry = {
  id: string
  at: string
  action: string
  actorName?: string
  actorEmail?: string
  details?: Record<string, any>
}

function getAuditPath() {
  const path = useHeadmasterConfig().auditLogPath
  return path || '.data/audit.jsonl'
}

export async function appendAuditEntry(entry: Omit<AuditEntry, 'id' | 'at'>) {
  const path = getAuditPath()
  await mkdir(dirname(path), { recursive: true })
  const payload: AuditEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    ...entry,
  }
  await appendFile(path, `${JSON.stringify(payload)}\n`, 'utf8')
  return payload
}

export async function readAuditEntries(limit = 50) {
  try {
    const raw = await readFile(getAuditPath(), 'utf8')
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditEntry)
      .slice(-limit)
      .reverse()
  } catch {
    return []
  }
}
