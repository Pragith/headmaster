import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { createError } from 'h3'
import YAML from 'yaml'

const execFileAsync = promisify(execFile)

type HeadscaleExecOptions = {
  json?: boolean
}

async function execHeadscale(args: string[], options: HeadscaleExecOptions = {}) {
  const config = useHeadmasterConfig()
  const commandArgs = [
    '-c',
    config.headscaleConfig,
    ...(options.json ? ['-o', 'json'] : []),
    ...args,
  ]

  let file = config.headscaleBinary
  let finalArgs = commandArgs

  if (config.execMode === 'docker') {
    file = config.dockerBin
    finalArgs = ['exec', config.headscaleContainer, config.headscaleBinary, ...commandArgs]
  }

  try {
    const result = await execFileAsync(file, finalArgs, { maxBuffer: 8 * 1024 * 1024 })
    return result.stdout.trim()
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.stderr?.trim() || error.message || 'Headscale command failed',
    })
  }
}

async function execHeadscaleJson<T>(args: string[]) {
  const output = await execHeadscale(args, { json: true })
  return output ? JSON.parse(output) as T : null
}

async function dockerCp(source: string, destination: string) {
  const config = useHeadmasterConfig()
  if (config.execMode !== 'docker') {
    throw createError({ statusCode: 500, statusMessage: 'docker cp is only available in docker exec mode' })
  }

  try {
    await execFileAsync(config.dockerBin, ['cp', source, destination], { maxBuffer: 8 * 1024 * 1024 })
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.stderr?.trim() || error.message || 'docker cp failed',
    })
  }
}

async function withHeadscaleContainerFile<T>(
  contents: string,
  fileName: string,
  run: (paths: { localPath: string; containerPath: string }) => Promise<T>,
) {
  const directory = await mkdtemp(join(tmpdir(), 'headmaster-docker-'))
  const file = join(directory, fileName)
  const containerPath = `/tmp/${fileName}`
  await writeFile(file, contents, 'utf8')
  try {
    await dockerCp(file, `${useHeadmasterConfig().headscaleContainer}:${containerPath}`)
    return await run({ localPath: file, containerPath })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function getHeadscaleContainerConfig() {
  const config = useHeadmasterConfig()
  if (config.execMode !== 'docker') {
    if (config.headscaleConfigFile) {
      return await readFile(config.headscaleConfigFile, 'utf8')
    }
    return ''
  }

  const directory = await mkdtemp(join(tmpdir(), 'headmaster-config-'))
  const file = join(directory, 'config.yaml')
  try {
    await dockerCp(`${config.headscaleContainer}:${config.headscaleConfig}`, file)
    return await readFile(file, 'utf8')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function resolveUserIdentifier(name: string) {
  const users = await listUsers()
  const match = (users || []).find((user) => user.name === name)
  return match?.id ? Number(match.id) : null
}

export async function listUsers() {
  return await execHeadscaleJson<Array<Record<string, any>>>(['users', 'list'])
}

export async function createUser(input: {
  name: string
  displayName?: string
  email?: string
  pictureUrl?: string
}) {
  const args = ['users', 'create', input.name]
  if (input.displayName) {
    args.push('--display-name', input.displayName)
  }
  if (input.email) {
    args.push('--email', input.email)
  }
  if (input.pictureUrl) {
    args.push('--picture-url', input.pictureUrl)
  }
  return await execHeadscaleJson<Record<string, any>>(args)
}

export async function renameUser(currentName: string, newName: string) {
  const identifier = await resolveUserIdentifier(currentName)
  if (identifier) {
    return await execHeadscale(['users', 'rename', '--identifier', String(identifier), '--new-name', newName])
  }
  return await execHeadscale(['users', 'rename', '--name', currentName, '--new-name', newName])
}

export async function destroyUser(name: string) {
  const identifier = await resolveUserIdentifier(name)
  if (identifier) {
    return await execHeadscale(['--force', 'users', 'destroy', '--identifier', String(identifier)])
  }
  return await execHeadscale(['--force', 'users', 'destroy', '--name', name])
}

export async function listNodes() {
  return await execHeadscaleJson<Array<Record<string, any>>>(['nodes', 'list'])
}

export async function renameNode(id: number, newName: string) {
  return await execHeadscale(['nodes', 'rename', '--identifier', String(id), newName])
}

export async function expireNode(input: {
  id: number
  expiry?: string
  disable?: boolean
}) {
  const args = ['nodes', 'expire', '--identifier', String(input.id)]
  if (input.disable) {
    args.push('--disable')
  } else if (input.expiry) {
    args.push('--expiry', input.expiry)
  }
  return await execHeadscale(args)
}

export async function deleteNode(id: number) {
  return await execHeadscale(['--force', 'nodes', 'delete', '--identifier', String(id)])
}

export async function updateNodeTags(id: number, tags: string[]) {
  const args = ['nodes', 'tag', '--identifier', String(id)]
  for (const tag of tags) {
    args.push('--tags', tag)
  }
  return await execHeadscale(args)
}

export async function listPreauthKeys() {
  return await execHeadscaleJson<Array<Record<string, any>>>(['preauthkeys', 'list'])
}

export async function createPreauthKey(input: {
  userId: number
  expiration: string
  reusable: boolean
  ephemeral: boolean
  tags: string[]
}) {
  const args = ['preauthkeys', 'create', '--user', String(input.userId), '--expiration', input.expiration]
  if (input.reusable) {
    args.push('--reusable')
  }
  if (input.ephemeral) {
    args.push('--ephemeral')
  }
  for (const tag of input.tags) {
    args.push('--tags', tag)
  }
  return await execHeadscaleJson<Record<string, any>>(args)
}

export async function expirePreauthKey(id: number) {
  return await execHeadscale(['preauthkeys', 'expire', '--id', String(id)])
}

export async function deletePreauthKey(id: number) {
  return await execHeadscale(['--force', 'preauthkeys', 'delete', '--id', String(id)])
}

export async function listApiKeys() {
  return await execHeadscaleJson<Array<Record<string, any>>>(['apikeys', 'list'])
}

export async function createApiKey(expiration?: string) {
  const args = ['apikeys', 'create']
  if (expiration) {
    args.push('--expiration', expiration)
  }
  return await execHeadscaleJson<Record<string, any>>(args)
}

export async function expireApiKey(input: {
  id?: number
  prefix?: string
}) {
  const args = ['apikeys', 'expire']
  if (input.id) {
    args.push('--id', String(input.id))
  } else if (input.prefix) {
    args.push('--prefix', input.prefix)
  }
  return await execHeadscale(args)
}

export async function deleteApiKey(input: {
  id?: number
  prefix?: string
}) {
  const args = ['--force', 'apikeys', 'delete']
  if (input.id) {
    args.push('--id', String(input.id))
  } else if (input.prefix) {
    args.push('--prefix', input.prefix)
  }
  return await execHeadscale(args)
}

export async function listRoutes() {
  return await execHeadscaleJson<Array<Record<string, any>>>(['nodes', 'list-routes'])
}

export async function approveRoutes(nodeId: number, routes: string[]) {
  return await execHeadscale([
    'nodes',
    'approve-routes',
    '--identifier',
    String(nodeId),
    '--routes',
    routes.join(','),
  ])
}

export async function getPolicy() {
  return await execHeadscale(['policy', 'get'])
}

export async function checkPolicy(policy: string) {
  const config = useHeadmasterConfig()
  if (config.execMode === 'docker') {
    return await withHeadscaleContainerFile(policy, 'headmaster-policy-check.hujson', async ({ containerPath }) => {
      return await execHeadscale(['policy', 'check', '--file', containerPath])
    })
  }

  const directory = await mkdtemp(join(tmpdir(), 'headmaster-policy-'))
  const file = join(directory, 'policy.hujson')
  await writeFile(file, policy, 'utf8')
  try {
    return await execHeadscale(['policy', 'check', '--file', file])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

export async function setPolicy(policy: string) {
  const config = useHeadmasterConfig()
  if (config.execMode === 'docker') {
    return await withHeadscaleContainerFile(policy, 'headmaster-policy-set.hujson', async ({ localPath, containerPath }) => {
      try {
        return await execHeadscale(['policy', 'set', '--file', containerPath])
      } catch (error: any) {
        const message = String(error.statusMessage || error.message || '')
        if (!message.includes("update is disabled for modes other than 'database'")) {
          throw error
        }

        const configText = await getHeadscaleContainerConfig()
        const parsed = YAML.parse(configText) as Record<string, any> | null
        const policyPath = parsed?.policy?.path || parsed?.acl_policy_path
        if (!policyPath || typeof policyPath !== 'string') {
          throw error
        }

        await dockerCp(localPath, `${config.headscaleContainer}:${policyPath}`)
        return 'Policy file updated.'
      }
    })
  }

  const directory = await mkdtemp(join(tmpdir(), 'headmaster-policy-'))
  const file = join(directory, 'policy.hujson')
  await writeFile(file, policy, 'utf8')
  try {
    return await execHeadscale(['policy', 'set', '--file', file])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

export async function registerAuthRequest(input: {
  authId: string
  user: string
}) {
  return await execHeadscale(['auth', 'register', '--auth-id', input.authId, '--user', input.user])
}

export async function approveAuthRequest(authId: string) {
  return await execHeadscale(['auth', 'approve', '--auth-id', authId])
}

export async function rejectAuthRequest(authId: string) {
  return await execHeadscale(['auth', 'reject', '--auth-id', authId])
}

export async function getHeadscaleVersion() {
  return await execHeadscale(['version'])
}

export async function runConfigTest() {
  return await execHeadscale(['configtest'])
}

export async function getHeadscaleHealth() {
  const config = useHeadmasterConfig()
  const url = config.headscalePublicUrl
  if (!url) {
    return { status: '', url: null }
  }
  try {
    const response = await $fetch<{ status: string }>(`${url.replace(/\/$/, '')}/health`)
    return { status: response.status || 'pass', url }
  } catch {
    return { status: 'down', url }
  }
}
