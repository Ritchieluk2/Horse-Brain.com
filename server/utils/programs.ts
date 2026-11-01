// =============================================================
//  Program store: each signed-in user's Raceday Programs.
//  The ONLY file that knows where programs live (Nitro storage
//  `hb` today; a `programs` + `bets` table later, see
//  docs/ACCOUNTS-ROADMAP.md §4). Keep these signatures when moving.
//
//  Keys
//    programs:{userId}:{TRACK}:{date}   → program record (v1, shared/program-rules.js)
//    program-index:{userId}             → { 'KEE:2026-10-31': ProgramListing, … }
//  The index lets the history page list everything in one read.
// =============================================================
import { sanitizeProgram, mergePrograms, summariseProgram, hasContent } from '#shared/program-rules.js'

export interface ProgramListing {
  trackId: string
  date: string
  updatedAt: string
  summary: ReturnType<typeof summariseProgram>
}

const db = () => useStorage('hb')
const recordKey = (userId: string, trackId: string, date: string) => `programs:${userId}:${trackId}:${date}`
const indexKey = (userId: string) => `program-index:${userId}`
const listingKey = (trackId: string, date: string) => `${trackId}:${date}`

async function readIndex(userId: string) {
  return (await db().getItem<Record<string, ProgramListing>>(indexKey(userId))) || {}
}

export async function listPrograms(userId: string) {
  const index = await readIndex(userId)
  return Object.values(index).sort((a, b) => b.date.localeCompare(a.date) || a.trackId.localeCompare(b.trackId))
}

export async function getProgram(userId: string, trackId: string, date: string) {
  return (await db().getItem<any>(recordKey(userId, trackId, date))) || null
}

/** Save (replace) one program. An empty program is deleted instead. */
export async function saveProgram(userId: string, trackId: string, date: string, input: unknown) {
  const record = sanitizeProgram(input, trackId, date)
  record.updatedAt = new Date().toISOString()
  if (!hasContent(record)) {
    await deleteProgram(userId, trackId, date)
    return { record, listing: null }
  }
  const listing: ProgramListing = { trackId, date, updatedAt: record.updatedAt, summary: summariseProgram(record) }
  await db().setItem(recordKey(userId, trackId, date), record)
  const index = await readIndex(userId)
  index[listingKey(trackId, date)] = listing
  await db().setItem(indexKey(userId), index)
  return { record, listing }
}

/** Merge an incoming copy (e.g. from this browser) into the saved one. */
export async function mergeIntoProgram(userId: string, trackId: string, date: string, input: unknown) {
  const incoming = sanitizeProgram(input, trackId, date)
  const existing = await getProgram(userId, trackId, date)
  return saveProgram(userId, trackId, date, mergePrograms(existing, incoming))
}

export async function deleteProgram(userId: string, trackId: string, date: string) {
  await db().removeItem(recordKey(userId, trackId, date))
  const index = await readIndex(userId)
  if (index[listingKey(trackId, date)]) {
    delete index[listingKey(trackId, date)]
    await db().setItem(indexKey(userId), index)
  }
}

/** Every saved program for a user (full records). Used by insights. */
export async function getAllPrograms(userId: string) {
  const listings = await listPrograms(userId)
  const records = await Promise.all(listings.map(l => getProgram(userId, l.trackId, l.date)))
  return records.filter(Boolean)
}
