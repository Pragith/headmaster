import { SignJWT, jwtVerify } from 'jose'
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3'

const SESSION_COOKIE = 'headmaster_session'
const OIDC_FLOW_COOKIE = 'headmaster_oidc_flow'

function getSecret() {
  const secret = useHeadmasterConfig().sessionSecret
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'HEADMASTER_SESSION_SECRET is required' })
  }
  return new TextEncoder().encode(secret)
}

async function sign(payload: Record<string, any>, maxAgeSeconds: number) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret())
}

async function verify(token: string) {
  const result = await jwtVerify(token, getSecret())
  return result.payload
}

export async function setSessionCookie(event: H3Event, payload: Record<string, any>) {
  const token = await sign(payload, 60 * 60 * 8)
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export async function getSessionCookie(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    return null
  }
  try {
    return await verify(token)
  } catch {
    return null
  }
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export async function setOidcFlowCookie(event: H3Event, payload: Record<string, any>) {
  const token = await sign(payload, 60 * 10)
  setCookie(event, OIDC_FLOW_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 10,
  })
}

export async function getOidcFlowCookie(event: H3Event) {
  const token = getCookie(event, OIDC_FLOW_COOKIE)
  if (!token) {
    return null
  }
  try {
    return await verify(token)
  } catch {
    return null
  }
}

export function clearOidcFlowCookie(event: H3Event) {
  deleteCookie(event, OIDC_FLOW_COOKIE, { path: '/' })
}
