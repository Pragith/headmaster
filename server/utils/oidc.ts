import { createHash, randomBytes } from 'node:crypto'
import { createError, sendRedirect, type H3Event } from 'h3'
import { getClaimValue } from './claims'
import { clearOidcFlowCookie, clearSessionCookie, getOidcFlowCookie, setOidcFlowCookie, setSessionCookie } from './cookies'

type OidcMetadata = {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint?: string
  end_session_endpoint?: string
  issuer: string
}

let metadataCache: OidcMetadata | null = null

async function getMetadata() {
  if (metadataCache) {
    return metadataCache
  }
  const issuer = useHeadmasterConfig().authIssuer
  if (!issuer) {
    throw createError({ statusCode: 500, statusMessage: 'HEADMASTER_AUTH_ISSUER is required' })
  }
  metadataCache = await $fetch<OidcMetadata>(`${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`)
  return metadataCache
}

function base64url(input: Buffer) {
  return input.toString('base64url')
}

function buildCodeChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url')
}

export async function beginLogin(event: H3Event) {
  const config = useHeadmasterConfig()
  const metadata = await getMetadata()
  const state = base64url(randomBytes(24))
  const verifier = base64url(randomBytes(32))
  const challenge = buildCodeChallenge(verifier)
  await setOidcFlowCookie(event, { state, verifier })

  const params = new URLSearchParams({
    client_id: config.authClientId,
    redirect_uri: config.authRedirectUri,
    response_type: 'code',
    scope: config.authScope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  return sendRedirect(event, `${metadata.authorization_endpoint}?${params.toString()}`)
}

export async function handleCallback(event: H3Event) {
  const config = useHeadmasterConfig()
  const metadata = await getMetadata()
  const query = getQuery(event)
  const code = String(query.code || '')
  const state = String(query.state || '')
  const flow = await getOidcFlowCookie(event)

  if (!code || !state || !flow || flow.state !== state) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OIDC callback state' })
  }

  const tokenResponse = await $fetch<any>(metadata.token_endpoint, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.authRedirectUri,
      client_id: config.authClientId,
      client_secret: config.authClientSecret,
      code_verifier: String(flow.verifier),
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })

  const userinfo = metadata.userinfo_endpoint
    ? await $fetch<Record<string, any>>(metadata.userinfo_endpoint, {
        headers: {
          authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
    : {}

  const groupsClaim = config.authGroupsClaim
  const groups = normalizeGroups(getClaimValue(userinfo, groupsClaim) ?? tokenResponse[groupsClaim] ?? [])
  const adminGroup = config.authAdminGroup
  if (adminGroup && !groups.includes(adminGroup)) {
    throw createError({ statusCode: 403, statusMessage: `Missing required admin group: ${adminGroup}` })
  }

  await setSessionCookie(event, {
    sub: userinfo.sub || tokenResponse.sub || '',
    name: String(getClaimValue(userinfo, config.authNameClaim) || userinfo.preferred_username || userinfo.email || userinfo.sub || ''),
    email: String(getClaimValue(userinfo, config.authEmailClaim) || ''),
    groups,
  })

  clearOidcFlowCookie(event)
  return sendRedirect(event, '/')
}

export function logout(event: H3Event) {
  clearOidcFlowCookie(event)
  clearSessionCookie(event)
  return sendRedirect(event, '/login')
}

function normalizeGroups(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  if (typeof value === 'string' && value) {
    return [value]
  }
  return []
}
