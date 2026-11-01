// =============================================================
//  Raceday Program rules, shared by the browser and the server.
//  Import as '#shared/program-rules.js'.
//
//  Record shape (v1), one per user + track + date:
//  {
//    version: 1,
//    trackId: 'KEE', date: '2026-10-31',
//    budget: 60 | null,                       // optional daily limit, $
//    races: {
//      '1': {
//        contenders: ['7', '2'],              // program numbers ticked as "my picks"
//        notes: 'Paddock: 7 looked sharp',
//        bets: [{
//          id, type: 'win'|'place'|'show'|'exacta'|'trifecta'|'other',
//          selection: ['7'] | ['7','9'] | …,   // program numbers, in finishing order
//          label: '',                          // free text, only for type 'other'
//          stake: 2,                           // $ wagered
//          status: 'pending'|'won'|'lost'|'refunded',
//          payout: 14.2 | null,                // $ returned (total, incl. stake) when won
//          source: 'horsebrain' | 'user',      // added from our picks, or by hand
//          createdAt: ISO string
//        }]
//      }
//    },
//    updatedAt: ISO string
//  }
// =============================================================

export const PROGRAM_VERSION = 1

export const BET_TYPES = [
  { id: 'win',      label: 'Win',      legs: 1 },
  { id: 'place',    label: 'Place',    legs: 1 },
  { id: 'show',     label: 'Show',     legs: 1 },
  { id: 'exacta',   label: 'Exacta',   legs: 2 },
  { id: 'trifecta', label: 'Trifecta', legs: 3 },
  { id: 'other',    label: 'Other',    legs: 0 }
]
export const betType = (id) => BET_TYPES.find(t => t.id === id) || BET_TYPES[0]

export const DEFAULT_STAKE = 2   // the classic $2 base bet

// Limits that keep one record a sensible size
export const LIMITS = { races: 20, betsPerRace: 50, notes: 2000, label: 80, money: 100000 }

const TRACK_RE = /^[A-Z0-9]{1,8}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATUSES = new Set(['pending', 'won', 'lost', 'refunded'])

export const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export const formatMoney = (v, { sign = false } = {}) => {
  const n = Number(v) || 0
  const s = Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  if (!sign) return n < 0 ? `-${s}` : s
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s
}

export function emptyRecord(trackId, date) {
  return { version: PROGRAM_VERSION, trackId, date, budget: null, races: {}, updatedAt: null }
}

export function emptyRace() {
  return { contenders: [], notes: '', bets: [] }
}

/** 'kee', '2026-10-31' → { trackId: 'KEE', date } or null if malformed. */
export function programId(trackId, date) {
  const t = String(trackId || '').toUpperCase()
  const d = String(date || '').slice(0, 10)
  return TRACK_RE.test(t) && DATE_RE.test(d) ? { trackId: t, date: d } : null
}

/** Sum a list of bets into the figures shown on the scoreboard. */
export function summarise(bets) {
  let staked = 0, settledStake = 0, returned = 0, won = 0, lost = 0, pending = 0
  for (const b of bets) {
    const stake = num(b.stake)
    staked += stake
    if (b.status === 'pending') { pending++; continue }
    settledStake += stake
    if (b.status === 'won') { won++; returned += num(b.payout) }
    else if (b.status === 'refunded') { returned += stake }
    else if (b.status === 'lost') { lost++ }
  }
  const net = returned - settledStake
  return {
    count: bets.length, staked, settledStake, returned, net,
    won, lost, pending,
    strikeRate: won + lost ? Math.round((won / (won + lost)) * 100) : null,
    roi: settledStake ? Math.round((net / settledStake) * 100) : null
  }
}

/** Whole-day figures for one program (used by history lists). */
export function summariseProgram(record) {
  const races = Object.values(record?.races || {})
  const bets = races.flatMap(r => r.bets || [])
  const followed = summarise(bets.filter(b => b.source === 'horsebrain'))
  return {
    ...summarise(bets),
    racesPlayed: races.filter(r => (r.bets || []).length).length,
    hasNotes: races.some(r => r.notes || (r.contenders || []).length),
    followedCount: followed.count,
    followedNet: followed.net,
    budget: record?.budget ?? null
  }
}

/** True when a record holds anything worth keeping. */
export function hasContent(record) {
  if (!record) return false
  if (record.budget) return true
  return Object.values(record.races || {}).some(r =>
    (r.bets || []).length || (r.contenders || []).length || (r.notes || '').trim())
}

// ---- Cleaning untrusted input (server side, and before import) ----------
const clip = (v, n) => String(v ?? '').slice(0, n)
const money = (v) => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n * 100) / 100, LIMITS.money) : null
}
const pgm = (v) => clip(v, 4).replace(/[^0-9A-Za-z]/g, '')

function cleanBet(b) {
  const type = betType(b?.type)
  return {
    id: clip(b?.id || '', 40) || `b_${Math.random().toString(36).slice(2, 10)}`,
    type: type.id,
    selection: (Array.isArray(b?.selection) ? b.selection : []).slice(0, Math.max(type.legs, 0) || 3).map(pgm),
    label: clip(b?.label, LIMITS.label),
    stake: money(b?.stake) ?? 0,
    status: STATUSES.has(b?.status) ? b.status : 'pending',
    payout: b?.status === 'won' ? money(b?.payout) : null,
    source: b?.source === 'horsebrain' ? 'horsebrain' : 'user',
    createdAt: typeof b?.createdAt === 'string' ? clip(b.createdAt, 40) : new Date().toISOString()
  }
}

/** Return a valid v1 record built only from known fields, within LIMITS. */
export function sanitizeProgram(input, trackId, date) {
  const out = emptyRecord(trackId, date)
  out.budget = money(input?.budget)
  const races = input?.races && typeof input.races === 'object' ? input.races : {}
  for (const key of Object.keys(races).slice(0, LIMITS.races)) {
    if (!/^\d{1,2}$/.test(key)) continue
    const r = races[key] || {}
    out.races[key] = {
      contenders: [...new Set((Array.isArray(r.contenders) ? r.contenders : []).map(pgm).filter(Boolean))].slice(0, 30),
      notes: clip(r.notes, LIMITS.notes),
      bets: (Array.isArray(r.bets) ? r.bets : []).slice(0, LIMITS.betsPerRace).map(cleanBet)
    }
  }
  out.updatedAt = typeof input?.updatedAt === 'string' ? clip(input.updatedAt, 40) : new Date().toISOString()
  return out
}

/**
 * Combine two copies of the same program without losing anything
 * (e.g. this browser's copy + the account's copy on sign-in).
 * Bets are matched by id; when both copies have the same bet, the
 * newer record's version wins. Notes are joined if they differ.
 */
export function mergePrograms(a, b) {
  if (!a) return b
  if (!b) return a
  const [older, newer] = (a.updatedAt || '') <= (b.updatedAt || '') ? [a, b] : [b, a]
  const out = emptyRecord(newer.trackId, newer.date)
  out.budget = newer.budget ?? older.budget ?? null
  const keys = new Set([...Object.keys(older.races || {}), ...Object.keys(newer.races || {})])
  for (const k of keys) {
    const o = older.races?.[k] || emptyRace()
    const n = newer.races?.[k] || emptyRace()
    const bets = new Map()
    for (const bet of o.bets || []) bets.set(bet.id, bet)
    for (const bet of n.bets || []) bets.set(bet.id, bet)
    const on = (o.notes || '').trim()
    const nn = (n.notes || '').trim()
    out.races[k] = {
      contenders: [...new Set([...(o.contenders || []), ...(n.contenders || [])])],
      notes: !on ? nn : !nn || on === nn ? on || nn : `${nn}\n\n${on}`,
      bets: [...bets.values()].sort((x, y) => (x.createdAt || '').localeCompare(y.createdAt || ''))
    }
  }
  out.updatedAt = new Date().toISOString()
  return out
}

/**
 * Would this bet have won, given the finishing order? Returns
 * 'won' | 'lost' | null (unknown: no result, or type 'other').
 * Exacta/trifecta are "straight": exact order required.
 */
export function gradeBet(bet, finishOrder) {
  if (!finishOrder?.length) return null
  const sel = (bet.selection || []).map(String)
  const pos = (p) => finishOrder.indexOf(String(p)) + 1   // 0 = unplaced
  switch (bet.type) {
    case 'win':   return sel[0] && pos(sel[0]) === 1 ? 'won' : 'lost'
    case 'place': return sel[0] && pos(sel[0]) >= 1 && pos(sel[0]) <= 2 ? 'won' : 'lost'
    case 'show':  return sel[0] && pos(sel[0]) >= 1 && pos(sel[0]) <= 3 ? 'won' : 'lost'
    case 'exacta':
      return sel.length === 2 && sel.every((p, i) => finishOrder[i] === p) ? 'won' : 'lost'
    case 'trifecta':
      return sel.length === 3 && sel.every((p, i) => finishOrder[i] === p) ? 'won' : 'lost'
    default: return null
  }
}
