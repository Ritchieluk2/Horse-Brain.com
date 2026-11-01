// =============================================================
//  One-time links (verify email, reset password, change email).
//
//  The raw token only ever exists in the emailed link. The D1 table
//  `tokens` keeps its SHA-256, so a leaked database can't be used to
//  reset anyone's password. Issuing a new token deletes the user's
//  older ones of the same kind, so only the newest email's link works.
// =============================================================
import { sha256Hex } from './password'
import { findUserById } from './users'
import { useDB } from './db'

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


function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function issueToken(purpose: TokenPurpose, user: { id: string; email: string }, extra: { newEmail?: string } = {}) {
  const token = randomToken()
  const hash = await sha256Hex(token)
  const db = await useDB()
  await db.batch([
    db.prepare('DELETE FROM tokens WHERE user_id = ? AND purpose = ?').bind(user.id, purpose),
    db.prepare('INSERT INTO tokens (hash, purpose, user_id, email, new_email, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(hash, purpose, user.id, user.email, extra.newEmail || null, Date.now() + TOKEN_TTL_MS[purpose])
  ])
  return token
}

/** Look a token up without using it. Returns the user, or null if invalid / expired. */
export async function peekToken(purpose: TokenPurpose, token: unknown) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null
  const hash = await sha256Hex(token)
  const db = await useDB()
  const rec = await db.prepare('SELECT user_id, email, new_email, expires_at FROM tokens WHERE hash = ? AND purpose = ?')
    .bind(hash, purpose).first()
  if (!rec) return null
  if (rec.expires_at < Date.now()) {
    await db.prepare('DELETE FROM tokens WHERE hash = ?').bind(hash).run()
    return null
  }
  const user = await findUserById(rec.user_id)
  if (!user || user.status !== 'active' || user.email !== rec.email) return null
  return { user, hash, newEmail: (rec.new_email as string | null) || undefined }
}

/** Use a token: returns the user and deletes it (and any siblings) so it can't be used again. */
export async function consumeToken(purpose: TokenPurpose, token: unknown) {
  const found = await peekToken(purpose, token)
  if (!found) return null
  await revokeTokens(purpose, found.user.id)
  return found.user
}

/** change-email: use the token, returning the user and the confirmed new address. */
export async function consumeEmailChangeToken(token: unknown) {
  const found = await peekToken('change-email', token)
  if (!found?.newEmail) return null
  await revokeTokens('change-email', found.user.id)
  return { user: found.user, newEmail: found.newEmail }
}

/** Cancel the outstanding tokens of one kind for a user (e.g. a pending email change). */
export async function revokeTokens(purpose: TokenPurpose, userId: string) {
  const db = await useDB()
  await db.prepare('DELETE FROM tokens WHERE user_id = ? AND purpose = ?').bind(userId, purpose).run()
}

// ---- Resend cooldown ------------------------------------------------
// One email of each kind per address per minute, so the buttons can't
// be used to flood someone's inbox (or burn our 100/day free quota).
const COOLDOWN_MS = 60 * 1000

export async function emailCooldownSeconds(purpose: TokenPurpose, email: string) {
  const db = await useDB()
  const row = await db.prepare('SELECT until FROM email_cooldowns WHERE purpose = ? AND email_hash = ?')
    .bind(purpose, await sha256Hex(email.toLowerCase())).first()
  const ms = (row?.until || 0) - Date.now()
  return ms > 0 ? Math.ceil(ms / 1000) : 0
}

export async function startEmailCooldown(purpose: TokenPurpose, email: string) {
  const db = await useDB()
  await db.prepare(`INSERT INTO email_cooldowns (purpose, email_hash, until) VALUES (?, ?, ?)
    ON CONFLICT (purpose, email_hash) DO UPDATE SET until = excluded.until`)
    .bind(purpose, await sha256Hex(email.toLowerCase()), Date.now() + COOLDOWN_MS).run()
}
