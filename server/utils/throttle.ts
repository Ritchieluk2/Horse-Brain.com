// =============================================================
//  Sign-in throttle: after 5 wrong passwords for one email within
//  15 minutes, that email is locked for 15 minutes. Stored in the
//  D1 table `auth_throttle`, keyed by sha256(email).
//  Before a public launch, also add an IP-based Cloudflare rate
//  limiting rule on /api/auth/*.
// =============================================================
import { sha256Hex } from './password'
import { useDB } from './db'

const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000

const hashOf = (email: string) => sha256Hex(email.toLowerCase())

/** Minutes left on a lock, or 0 if sign-in may proceed. */
export async function lockMinutesLeft(email: string) {
  const db = await useDB()
  const row = await db.prepare('SELECT locked_until FROM auth_throttle WHERE email_hash = ?').bind(await hashOf(email)).first()
  const ms = (row?.locked_until || 0) - Date.now()
  return ms > 0 ? Math.ceil(ms / 60000) : 0
}

export async function recordFailure(email: string) {
  const db = await useDB()
  const h = await hashOf(email)
  const now = Date.now()
  const prev = await db.prepare('SELECT count, first_at FROM auth_throttle WHERE email_hash = ?').bind(h).first()
  const fresh = !prev || now - prev.first_at > WINDOW_MS
  const count = fresh ? 1 : prev.count + 1
  const firstAt = fresh ? now : prev.first_at
  const lockedUntil = count >= MAX_FAILURES ? now + WINDOW_MS : 0
  await db.prepare(`INSERT INTO auth_throttle (email_hash, count, first_at, locked_until) VALUES (?, ?, ?, ?)
    ON CONFLICT (email_hash) DO UPDATE SET count = excluded.count, first_at = excluded.first_at, locked_until = excluded.locked_until`)
    .bind(h, count, firstAt, lockedUntil).run()
}

export async function clearFailures(email: string) {
  const db = await useDB()
  await db.prepare('DELETE FROM auth_throttle WHERE email_hash = ?').bind(await hashOf(email)).run()
}
