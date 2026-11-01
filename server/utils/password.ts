// =============================================================
//  Password hashing with the Web Crypto API (PBKDF2-SHA-256).
//  Web Crypto exists in Node 20+ and Cloudflare Workers, so this
//  needs no native module. Workers cap PBKDF2 at 100,000
//  iterations, which is the value used here.
//
//  Stored on the user as:
//    password: { algo: 'pbkdf2-sha256', iterations, salt, hash }
//  (salt + hash are base64). `algo` + `iterations` let us move to a
//  stronger scheme later and re-hash on the user's next sign-in.
// =============================================================

const ALGO = 'pbkdf2-sha256'
const ITERATIONS = 100_000
const KEY_BYTES = 32
const SALT_BYTES = 16

export interface PasswordRecord {
  algo: string
  iterations: number
  salt: string
  hash: string
}

const enc = new TextEncoder()

const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

const fromB64 = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0))

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, KEY_BYTES * 8)
}

export async function hashPassword(password: string): Promise<PasswordRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const bits = await derive(password, salt, ITERATIONS)
  return { algo: ALGO, iterations: ITERATIONS, salt: toB64(salt), hash: toB64(bits) }
}

// Constant-time comparison so timing doesn't leak how many bytes matched
function equal(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyPassword(password: string, record?: PasswordRecord | null) {
  if (!record || record.algo !== ALGO) return false
  const bits = await derive(password, fromB64(record.salt), record.iterations)
  return equal(new Uint8Array(bits), fromB64(record.hash))
}

// Same cost as a real check. Used when the email isn't found, so a
// missing account and a wrong password take the same time.
let dummy: PasswordRecord | null = null
export async function fakeVerify(password: string) {
  dummy ||= await hashPassword('not-a-real-password')
  await verifyPassword(password, dummy)
  return false
}

export async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}
