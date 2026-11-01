// =============================================================
//  One-time links (verify email, reset password).
//
//  The raw token only ever exists in the emailed link. Storage
//  keeps its SHA-256, so a leaked database can't be used to
//  reset anyone's password.
//
//  Keys
//    tokens:{purpose}:{sha256(token)}   → { userId, email, newEmail?, expiresAt }
//    tokens-latest:{purpose}:{userId}   → sha256 of the newest token
//  Issuing a new token deletes the previous one, so only the most
//  recent email's link works.
// =============================================================
import { sha256Hex } from './password'
import { findUserById } from './users'


export type TokenPurpose = 'verify-email' | 'reset-password' | 'change-email'

export const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  'verify-email': 24 * 60 * 60 * 1000,   // 24 hours
  'reset-password': 60 * 60 * 1000,      // 1 hour
  'change-email': 24 * 60 * 60 * 1000    // 24 hours
}

interface TokenRecord {
  userId: string
  email: string          // the account's email when issued; a changed email invalidates it
  newEmail?: string      // change-email only: the address being confirmed
  expiresAt: number
}

const db = () => useStorage('hb')
const tokenKey = (purpose: TokenPurpose, hash: string) => `tokens:${purpose}:${hash}`
const latestKey = (purpose: TokenPurpose, userId: string) => `tokens-latest:${purpose}:${userId}`

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function issueToken(purpose: TokenPurpose, user: { id: string; email: string }, extra: { newEmail?: string } = {}) {
  const previous = await db().getItem<string>(latestKey(purpose, user.id))
  if (previous) await db().removeItem(tokenKey(purpose, previous))

  const token = randomToken()
  const hash = await sha256Hex(token)
  await db().setItem(tokenKey(purpose, hash), {
    userId: user.id,
    email: user.email,
    ...extra,
    expiresAt: Date.now() + TOKEN_TTL_MS[purpose]
  } satisfies TokenRecord)
  await db().setItem(latestKey(purpose, user.id), hash)
  return token
}

/** Look a token up without using it. Returns the user, or null if invalid / expired. */
export async function peekToken(purpose: TokenPurpose, token: unknown) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null
  const hash = await sha256Hex(token)
  const rec = await db().getItem<TokenRecord>(tokenKey(purpose, hash))
  if (!rec) return null
  if (rec.expiresAt < Date.now()) {
    await db().removeItem(tokenKey(purpose, hash))
    return null
  }
  const user = await findUserById(rec.userId)
  if (!user || user.status !== 'active' || user.email !== rec.email) return null
  return { user, hash, newEmail: rec.newEmail }
}

/** Use a token: returns the user and deletes the token so it can't be used again. */
export async function consumeToken(purpose: TokenPurpose, token: unknown) {
  const found = await peekToken(purpose, token)
  if (!found) return null
  await db().removeItem(tokenKey(purpose, found.hash))
  await db().removeItem(latestKey(purpose, found.user.id))
  return found.user
}

/** change-email: use the token, returning the user and the confirmed new address. */
export async function consumeEmailChangeToken(token: unknown) {
  const found = await peekToken('change-email', token)
  if (!found?.newEmail) return null
  await db().removeItem(tokenKey('change-email', found.hash))
  await db().removeItem(latestKey('change-email', found.user.id))
  return { user: found.user, newEmail: found.newEmail }
}

/** Cancel the outstanding token of one kind for a user (e.g. a pending email change). */
export async function revokeTokens(purpose: TokenPurpose, userId: string) {
  const latest = await db().getItem<string>(latestKey(purpose, userId))
  if (latest) await db().removeItem(tokenKey(purpose, latest))
  await db().removeItem(latestKey(purpose, userId))
}

// ---- Resend cooldown ------------------------------------------------
// One email of each kind per address per minute, so the buttons can't
// be used to flood someone's inbox (or burn our 100/day free quota).
const COOLDOWN_MS = 60 * 1000

export async function emailCooldownSeconds(purpose: TokenPurpose, email: string) {
  const until = await db().getItem<number>(`email-cooldown:${purpose}:${await sha256Hex(email)}`)
  const ms = (until || 0) - Date.now()
  return ms > 0 ? Math.ceil(ms / 1000) : 0
}

export async function startEmailCooldown(purpose: TokenPurpose, email: string) {
  await db().setItem(`email-cooldown:${purpose}:${await sha256Hex(email)}`, Date.now() + COOLDOWN_MS)
}
