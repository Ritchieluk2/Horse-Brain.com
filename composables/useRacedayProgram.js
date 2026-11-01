// =============================================================
//  useRacedayProgram: the user's own layer on a Raceday Program
//  (bets, contenders, notes, budget) for ONE track + date.
//
//  Storage, for now: this browser's localStorage, one record per
//  raceday. The shape is versioned and has no browser-specific
//  fields, so when user accounts arrive the same object can be
//  POSTed to the API, and synced back, without changes.
//
//  Record shape (v1):
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
import { reactive, ref, computed, watch, onMounted } from 'vue'

export const PROGRAM_VERSION = 1
const PREFIX = 'hb:program'

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

const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export const formatMoney = (v, { sign = false } = {}) => {
  const n = Number(v) || 0
  const s = Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  if (!sign) return n < 0 ? `-${s}` : s
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s
}

function emptyRecord(trackId, date) {
  return { version: PROGRAM_VERSION, trackId, date, budget: null, races: {}, updatedAt: null }
}

function emptyRace() {
  return { contenders: [], notes: '', bets: [] }
}

function uid() {
  return `b_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
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

/**
 * Would this bet have won, given the finishing order? Returns
 * 'won' | 'lost' | null (unknown: no result, or type 'other').
 * Exacta/trifecta are "straight": exact order required.
 */
export function gradeBet(bet, finishOrder) {
  if (!finishOrder?.length) return null
  const sel = (bet.selection || []).map(String)
  const pos = (pgm) => finishOrder.indexOf(String(pgm)) + 1   // 0 = unplaced
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

export function useRacedayProgram(trackId, date) {
  const storageKey = `${PREFIX}:v${PROGRAM_VERSION}:${String(trackId).toUpperCase()}:${date}`
  const record = reactive(emptyRecord(String(trackId).toUpperCase(), date))

  // `ready` flips once storage has been read on the client. The server
  // and the first client render both show an empty program, so
  // hydration matches; saved bets then fill in.
  const ready = ref(false)
  const storageOk = ref(true)

  function load() {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved?.version === PROGRAM_VERSION) {
          record.budget = saved.budget ?? null
          record.races = saved.races || {}
          record.updatedAt = saved.updatedAt || null
        }
      }
    } catch {
      storageOk.value = false   // private mode / blocked storage: still usable, just not saved
    }
    ready.value = true
  }

  function save() {
    if (!ready.value) return
    record.updatedAt = new Date().toISOString()
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(record))
      storageOk.value = true
    } catch {
      storageOk.value = false
    }
  }

  onMounted(load)
  watch(() => [record.budget, record.races], save, { deep: true })

  // ---- Per-race access ---------------------------------------------------
  function race(raceNum) {
    const k = String(raceNum)
    if (!record.races[k]) record.races[k] = emptyRace()
    return record.races[k]
  }

  /** Read-only view that doesn't create an entry (safe in templates). */
  function peek(raceNum) {
    return record.races[String(raceNum)] || null
  }

  function toggleContender(raceNum, pgm) {
    const r = race(raceNum)
    const p = String(pgm)
    r.contenders = r.contenders.includes(p) ? r.contenders.filter(x => x !== p) : [...r.contenders, p]
  }

  function addBet(raceNum, partial = {}) {
    const type = betType(partial.type || 'win')
    const bet = {
      id: uid(),
      type: type.id,
      selection: (partial.selection || []).map(String).slice(0, type.legs || undefined),
      label: partial.label || '',
      stake: partial.stake ?? DEFAULT_STAKE,
      status: 'pending',
      payout: null,
      source: partial.source || 'user',
      createdAt: new Date().toISOString()
    }
    while (type.legs && bet.selection.length < type.legs) bet.selection.push('')
    race(raceNum).bets.push(bet)
    return bet
  }

  function updateBet(raceNum, id, patch) {
    const bet = race(raceNum).bets.find(b => b.id === id)
    if (!bet) return
    if (patch.type && patch.type !== bet.type) {
      const legs = betType(patch.type).legs
      const sel = [...bet.selection].slice(0, legs)
      while (sel.length < legs) sel.push('')
      patch = { ...patch, selection: sel }
    }
    if (patch.status && patch.status !== 'won') patch = { ...patch, payout: null }
    Object.assign(bet, patch)
  }

  function removeBet(raceNum, id) {
    const r = race(raceNum)
    r.bets = r.bets.filter(b => b.id !== id)
  }

  /** Mark pending bets won/lost from the official order. Payouts stay for the user to enter. */
  function settleFromResult(raceNum, finishOrder) {
    let changed = 0
    for (const bet of race(raceNum).bets) {
      if (bet.status !== 'pending') continue
      const grade = gradeBet(bet, finishOrder)
      if (grade) { bet.status = grade; changed++ }
    }
    return changed
  }

  function resetAll() {
    record.races = {}
    record.budget = null
  }

  // ---- Totals --------------------------------------------------------------
  const allBets = computed(() => Object.values(record.races).flatMap(r => r.bets || []))
  const totals = computed(() => summarise(allBets.value))
  const followedTotals = computed(() => summarise(allBets.value.filter(b => b.source === 'horsebrain')))
  const raceTotals = (raceNum) => summarise(peek(raceNum)?.bets || [])

  const budgetUsed = computed(() =>
    record.budget ? Math.min(100, Math.round((totals.value.staked / record.budget) * 100)) : null
  )
  const overBudget = computed(() => !!record.budget && totals.value.staked > record.budget)

  return {
    record, ready, storageOk,
    race, peek, toggleContender,
    addBet, updateBet, removeBet, settleFromResult, resetAll,
    totals, followedTotals, raceTotals, budgetUsed, overBudget
  }
}
