// =============================================================
//  User store: the ONLY file that knows where users are kept.
//
//  Storage: the D1 table `users` (migrations/0001_accounts.sql):
//  the whole UserRecord as JSON in `record`, plus `email` as a UNIQUE
//  column so two accounts can never share an address.
//  Keep these function signatures if storage moves again; the API
//  routes and pages don't need to change.
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
import { useDB, isUniqueViolation, parseJSON } from './db'

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

export function toPublicUser(u: UserRecord | null): PublicUser | null {
  if (!u) return null
  const { password: _pw, schemaVersion: _v, sessionVersion: _s, ...rest } = u
  return { ...rest, emailVerifiedAt: u.emailVerifiedAt || null, pendingEmail: u.pendingEmail || null }
}

export async function findUserById(id: string) {
  if (!id) return null
  const db = await useDB()
  const row = await db.prepare('SELECT record FROM users WHERE id = ?').bind(id).first()
  return parseJSON<UserRecord>(row?.record)
}

export async function findUserByEmail(email: string) {
  const db = await useDB()
  const row = await db.prepare('SELECT record FROM users WHERE email = ?').bind(email.toLowerCase()).first()
  return parseJSON<UserRecord>(row?.record)
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
  const now = new Date().toISOString()
  const user: UserRecord = {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    email: input.email.toLowerCase(),
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

  const db = await useDB()
  try {
    await db.prepare('INSERT INTO users (id, email, record, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind(user.id, user.email, JSON.stringify(user), now, now).run()
  } catch (err) {
    if (isUniqueViolation(err)) throw new EmailTakenError()
    throw err
  }
  return user
}

/** Is this address free to use (no account, or only this user's)? */
export async function emailAvailable(email: string, exceptUserId?: string) {
  const db = await useDB()
  const row = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first()
  return !row?.id || row.id === exceptUserId
}

/** Move a user to a new, already-confirmed email address. */
export async function changeUserEmail(id: string, newEmail: string) {
  try {
    return await updateUser(id, { email: newEmail.toLowerCase(), emailVerifiedAt: new Date().toISOString(), pendingEmail: null })
  } catch (err) {
    if (isUniqueViolation(err)) throw new EmailTakenError()
    throw err
  }
}

export async function updateUser(id: string, patch: Partial<Omit<UserRecord, 'id' | 'createdAt'>>) {
  const user = await findUserById(id)
  if (!user) return null
  const next: UserRecord = { ...user, ...patch, updatedAt: new Date().toISOString() }
  const db = await useDB()
  await db.prepare('UPDATE users SET email = ?, record = ?, updated_at = ? WHERE id = ?')
    .bind(next.email, JSON.stringify(next), next.updatedAt, id).run()
  return next
}
