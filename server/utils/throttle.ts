// =============================================================
//  Sign-in throttle: after 5 wrong passwords for one email within
//  15 minutes, that email is locked for 15 minutes. Stored next to
//  the users (`auth-throttle:{sha256(email)}`). Good enough for the
//  mock-up; add IP-based limits (e.g. Cloudflare rate limiting)
//  before launch.
// =============================================================
const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000

interface Attempts { count: number; firstAt: number; lockedUntil: number }

const key = async (email: string) => `auth-throttle:${await sha256Hex(email.toLowerCase())}`

/** Minutes left on a lock, or 0 if sign-in may proceed. */
export async function lockMinutesLeft(email: string) {
  const a = await useStorage('hb').getItem<Attempts>(await key(email))
  if (!a?.lockedUntil) return 0
  const ms = a.lockedUntil - Date.now()
  return ms > 0 ? Math.ceil(ms / 60000) : 0
}

export async function recordFailure(email: string) {
  const k = await key(email)
  const now = Date.now()
  const prev = await useStorage('hb').getItem<Attempts>(k)
  const fresh = !prev || now - prev.firstAt > WINDOW_MS
  const next: Attempts = fresh
    ? { count: 1, firstAt: now, lockedUntil: 0 }
    : { ...prev!, count: prev!.count + 1 }
  if (next.count >= MAX_FAILURES) next.lockedUntil = now + WINDOW_MS
  await useStorage('hb').setItem(k, next)
}

export async function clearFailures(email: string) {
  await useStorage('hb').removeItem(await key(email))
}
