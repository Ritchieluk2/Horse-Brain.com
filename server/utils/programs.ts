// =============================================================
//  Program store: each signed-in user's Raceday Programs.
//  The ONLY file that knows where programs live: the D1 table
//  `programs` (migrations/0001_accounts.sql), one row per
//  user + track + date, with the v1 record as JSON and a ready-made
//  summary for the history list. Keep these signatures if it moves.
// =============================================================
import { sanitizeProgram, mergePrograms, summariseProgram, hasContent } from '#shared/program-rules.js'
import { useDB, parseJSON } from './db'

export interface ProgramListing {
  trackId: string
  date: string
  updatedAt: string
  summary: ReturnType<typeof summariseProgram>
}

export async function listPrograms(userId: string): Promise<ProgramListing[]> {
  const db = await useDB()
  const { results } = await db
    .prepare('SELECT track_id, date, updated_at, summary FROM programs WHERE user_id = ? ORDER BY date DESC, track_id')
    .bind(userId).all()
  return (results || []).map((r: any) => ({
    trackId: r.track_id, date: r.date, updatedAt: r.updated_at, summary: parseJSON(r.summary)
  }))
}

export async function getProgram(userId: string, trackId: string, date: string) {
  const db = await useDB()
  const row = await db.prepare('SELECT record FROM programs WHERE user_id = ? AND track_id = ? AND date = ?')
    .bind(userId, trackId, date).first()
  return parseJSON<any>(row?.record)
}

/** Every saved program for a user (full records). Used by insights. */
export async function getAllPrograms(userId: string) {
  const db = await useDB()
  const { results } = await db.prepare('SELECT record FROM programs WHERE user_id = ? ORDER BY date').bind(userId).all()
  return (results || []).map((r: any) => parseJSON<any>(r.record)).filter(Boolean)
}

/** Save (replace) one program. An empty program is deleted instead. */
export async function saveProgram(userId: string, trackId: string, date: string, input: unknown) {
  const record = sanitizeProgram(input, trackId, date)
  record.updatedAt = new Date().toISOString()
  if (!hasContent(record)) {
    await deleteProgram(userId, trackId, date)
    return { record, listing: null }
  }
  const summary = summariseProgram(record)
  const db = await useDB()
  await db.prepare(`
    INSERT INTO programs (user_id, track_id, date, record, summary, updated_at) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id, track_id, date) DO UPDATE SET
      record = excluded.record, summary = excluded.summary, updated_at = excluded.updated_at
  `).bind(userId, trackId, date, JSON.stringify(record), JSON.stringify(summary), record.updatedAt).run()
  const listing: ProgramListing = { trackId, date, updatedAt: record.updatedAt, summary }
  return { record, listing }
}

/** Merge an incoming copy (e.g. from this browser) into the saved one. */
export async function mergeIntoProgram(userId: string, trackId: string, date: string, input: unknown) {
  const incoming = sanitizeProgram(input, trackId, date)
  const existing = await getProgram(userId, trackId, date)
  return saveProgram(userId, trackId, date, mergePrograms(existing, incoming))
}

export async function deleteProgram(userId: string, trackId: string, date: string) {
  const db = await useDB()
  await db.prepare('DELETE FROM programs WHERE user_id = ? AND track_id = ? AND date = ?').bind(userId, trackId, date).run()
}
