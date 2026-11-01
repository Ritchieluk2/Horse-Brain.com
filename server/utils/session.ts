// =============================================================
//  Sessions: an encrypted, signed cookie (h3's built-in useSession,
//  sealed with iron-webcrypto). No session table needed; the cookie
//  only holds { userId }, and the user is re-read from storage on
//  every request, so disabling a user takes effect immediately.
//
//  Secret: NUXT_SESSION_SECRET (32+ characters). In `npm run dev` a
//  fixed development secret is used if it's missing, with a warning.
// =============================================================
import type { H3Event } from 'h3'

const COOKIE = 'hb_session'
const MAX_AGE = 60 * 60 * 24 * 14 // 14 days
const DEV_SECRET = 'horsebrain-dev-only-session-secret-change-me-0001'

interface SessionData {
  userId?: string
  version?: number      // must match user.sessionVersion
  signedInAt?: string
}

let warned = false

// Read per request: on Cloudflare, secrets arrive with each request
function sessionConfig(event: H3Event) {
  let password = useRuntimeConfig(event).sessionSecret as string
  if (!password || password.length < 32) {
    if (!import.meta.dev) {
      throw createError({ statusCode: 500, statusMessage: 'NUXT_SESSION_SECRET is missing or shorter than 32 characters.' })
    }
    if (!warned) {
      console.warn('[auth] NUXT_SESSION_SECRET not set: using the development secret. Set it in .env before deploying.')
      warned = true
    }
    password = DEV_SECRET
  }
  return {
    name: COOKIE,
    password,
    maxAge: MAX_AGE,
    cookie: {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax' as const,
      path: '/'
    }
  }
}

export const getAuthSession = (event: H3Event) => useSession<SessionData>(event, sessionConfig(event))

export async function startUserSession(event: H3Event, user: { id: string; sessionVersion?: number }) {
  const session = await getAuthSession(event)
  await session.clear()               // new session id on every sign-in
  const fresh = await getAuthSession(event)
  await fresh.update({ userId: user.id, version: user.sessionVersion || 1, signedInAt: new Date().toISOString() })
}

export async function endUserSession(event: H3Event) {
  const session = await getAuthSession(event)
  await session.clear()
}

/** The signed-in user, or null. Never throws for a bad/expired cookie. */
export async function getSessionUser(event: H3Event) {
  try {
    const session = await getAuthSession(event)
    const id = session.data?.userId
    if (!id) return null
    const user = await findUserById(id)
    // A password reset bumps sessionVersion, which signs out every other device
    const stale = (session.data.version || 1) !== (user?.sessionVersion || 1)
    if (!user || user.status !== 'active' || stale) {
      await session.clear()
      return null
    }
    return user
  } catch (err: any) {
    if (err?.statusCode === 500) throw err
    return null
  }
}

/** Use in API routes that need a signed-in user. */
export async function requireUser(event: H3Event) {
  const user = await getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Please sign in.' })
  return user
}
