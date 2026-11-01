// =============================================================
//  User store: the ONLY file that knows where users are kept.
//
//  Today it uses Nitro storage (unstorage), mounted as `hb` in
//  nuxt.config.ts:
//    • `npm run dev`  → JSON files in .data/hb/ (git-ignored)
//    • Cloudflare     → the HB_DATA Workers KV namespace
//  When we move to a real database (D1 / Postgres / Mongo), rewrite
//  the functions below and keep their signatures; the API routes
//  and pages won't need to change.
//
//  Keys
//    users:{id}                 → UserRecord
//    users-by-email:{sha256}    → { id }     (email lookup index)
//
//  UserRecord (schemaVersion 1)
//  {
//    id, schemaVersion: 1,
//    email, firstName, lastName,
//    phone: '+18595551234' | '',
//    address: { line1, line2, city, region, postalCode, country } | null,
//    agreements: {
//      terms:      { version, acceptedAt },   // Terms of Use + Privacy
//      disclaimer: { version, acceptedAt },
//      age:        { minimumAge: 21, confirmedAt }
//    },
//    marketingOptIn: false,
//    emailVerifiedAt: ISO string | null,
//    pendingEmail: { email, requestedAt } | null,   // change waiting for confirmation
//    sessionVersion: 1,      // bump to sign the user out everywhere
//    password: { algo, iterations, salt, hash },   // never leaves the server
//    role: 'member', status: 'active',
//    createdAt, updatedAt, lastSignInAt
//  }
// =============================================================
import { LEGAL_VERSIONS, MINIMUM_AGE } from '#shared/account-rules.js'
import type { PasswordRecord } from './password'

export interface Address {
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface UserRecord {
  id: string
  schemaVersion: 1
  email: string
  firstName: string
  lastName: string
  phone: string
  address: Address | null
  agreements: {
    terms: { version: string; acceptedAt: string }
    disclaimer: { version: string; acceptedAt: string }
    age: { minimumAge: number; confirmedAt: string }
  }
  marketingOptIn: boolean
  emailVerifiedAt?: string | null   // missing on accounts made before verification existed
  pendingEmail?: { email: string; requestedAt: string } | null
  sessionVersion?: number
  password: PasswordRecord
  role: 'member' | 'admin'
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
  lastSignInAt: string | null
}

// What the browser is allowed to see
export type PublicUser = Omit<UserRecord, 'password' | 'schemaVersion' | 'sessionVersion'>

const db = () => useStorage('hb')
const userKey = (id: string) => `users:${id}`
const emailKey = async (email: string) => `users-by-email:${await sha256Hex(email.toLowerCase())}`

export function toPublicUser(u: UserRecord | null): PublicUser | null {
  if (!u) return null
  const { password: _pw, schemaVersion: _v, sessionVersion: _s, ...rest } = u
  return { ...rest, emailVerifiedAt: u.emailVerifiedAt || null, pendingEmail: u.pendingEmail || null }
}

export async function findUserById(id: string) {
  if (!id) return null
  return (await db().getItem<UserRecord>(userKey(id))) || null
}

export async function findUserByEmail(email: string) {
  const ref = await db().getItem<{ id: string }>(await emailKey(email))
  return ref?.id ? findUserById(ref.id) : null
}

export interface NewUser {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: Address | null
  marketingOptIn: boolean
  password: PasswordRecord
}

export class EmailTakenError extends Error {}

export async function createUser(input: NewUser) {
  const key = await emailKey(input.email)
  // Note: KV has no transactions, so two simultaneous sign-ups with the
  // same email could both pass this check. Acceptable for the mock-up;
  // a real database gets a UNIQUE index on email.
  if (await db().hasItem(key)) throw new EmailTakenError()

  const now = new Date().toISOString()
  const user: UserRecord = {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    address: input.address,
    agreements: {
      terms: { version: LEGAL_VERSIONS.terms, acceptedAt: now },
      disclaimer: { version: LEGAL_VERSIONS.disclaimer, acceptedAt: now },
      age: { minimumAge: MINIMUM_AGE, confirmedAt: now }
    },
    marketingOptIn: input.marketingOptIn,
    emailVerifiedAt: null,
    sessionVersion: 1,
    password: input.password,
    role: 'member',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastSignInAt: now
  }

  await db().setItem(userKey(user.id), user)
  await db().setItem(key, { id: user.id })
  return user
}

/** Is this address free to use (no account, or only this user's)? */
export async function emailAvailable(email: string, exceptUserId?: string) {
  const ref = await db().getItem<{ id: string }>(await emailKey(email))
  return !ref?.id || ref.id === exceptUserId
}

/** Move a user to a new, already-confirmed email address. */
export async function changeUserEmail(id: string, newEmail: string) {
  const user = await findUserById(id)
  if (!user) return null
  if (!(await emailAvailable(newEmail, id))) throw new EmailTakenError()

  await db().setItem(await emailKey(newEmail), { id })
  await db().removeItem(await emailKey(user.email))
  return updateUser(id, { email: newEmail, emailVerifiedAt: new Date().toISOString(), pendingEmail: null })
}

export async function updateUser(id: string, patch: Partial<Omit<UserRecord, 'id' | 'createdAt'>>) {
  const user = await findUserById(id)
  if (!user) return null
  const next: UserRecord = { ...user, ...patch, updatedAt: new Date().toISOString() }
  await db().setItem(userKey(id), next)
  return next
}
