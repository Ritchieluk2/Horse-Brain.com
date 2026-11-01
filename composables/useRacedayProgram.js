// =============================================================
//  useRacedayProgram: the user's own layer on a Raceday Program
//  (bets, contenders, notes, budget) for ONE track + date.
//
//  Where it's saved
//    • Signed in  → the user's account (PUT /api/programs/:track/:date),
//                   a moment after each change. `sync` reports progress.
//    • Signed out → this browser's localStorage, key
//                   hb:program:v1:{TRACK}:{date}.
//  On sign-in, importGuestPrograms() moves every browser-saved
//  program into the account (merged, nothing lost) and clears them
//  from the browser.
//
//  The record shape (v1) and the maths (summarise, gradeBet, …) live
//  in shared/program-rules.js so the server uses the same rules.
// =============================================================
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  PROGRAM_VERSION, BET_TYPES, betType, DEFAULT_STAKE, formatMoney,
  emptyRecord, emptyRace, summarise, gradeBet, mergePrograms, hasContent, programId
} from '#shared/program-rules.js'

// Re-exported so existing imports from this file keep working
export { PROGRAM_VERSION, BET_TYPES, betType, DEFAULT_STAKE, formatMoney, summarise, gradeBet }

const PREFIX = 'hb:program'
const guestKey = (trackId, date) => `${PREFIX}:v${PROGRAM_VERSION}:${trackId}:${date}`
const SAVE_DELAY = 800   // ms after the last change before saving to the account

function uid() {
  return `b_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

// ---- Browser storage helpers (never throw) --------------------------------
function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(key)
    const saved = raw ? JSON.parse(raw) : null
    return saved?.version === PROGRAM_VERSION ? saved : null
  } catch { return null }
}
function writeLocal(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}
function removeLocal(key) {
  try { window.localStorage.removeItem(key) } catch { /* ignore */ }
}

/**
 * Move every program saved in this browser (while signed out) into the
 * signed-in account, then remove them from the browser.
 * Returns how many were imported. Safe to call any time; does nothing
 * when there's nothing to move.
 */
export async function importGuestPrograms() {
  if (typeof window === 'undefined') return 0
  const found = []
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      const m = key && key.match(/^hb:program:v1:([A-Z0-9]{1,8}):(\d{4}-\d{2}-\d{2})$/)
      if (!m) continue
      const rec = readLocal(key)
      if (rec && hasContent(rec)) found.push({ key, rec: { ...rec, trackId: m[1], date: m[2] } })
      else removeLocal(key)
    }
  } catch { return 0 }
  if (!found.length) return 0

  const res = await $fetch('/api/programs/import', { method: 'POST', body: { programs: found.map(f => f.rec) } })
  found.forEach(f => removeLocal(f.key))
  return res?.imported || 0
}

export function useRacedayProgram(trackIdIn, dateIn) {
  const id = programId(trackIdIn, dateIn) || { trackId: String(trackIdIn).toUpperCase(), date: String(dateIn) }
  const { signedIn } = useAuth()
  const localKey = guestKey(id.trackId, id.date)
  const apiUrl = `/api/programs/${id.trackId}/${id.date}`

  const record = reactive(emptyRecord(id.trackId, id.date))

  // `ready` flips once the saved copy has been read on the client. The
  // server and the first client render both show an empty program, so
  // hydration matches; saved bets then fill in.
  const ready = ref(false)
  const storageOk = ref(true)          // guest mode: can this browser save?
  const mode = computed(() => (signedIn.value ? 'account' : 'guest'))
  // Account mode: 'idle' | 'loading' | 'saving' | 'saved' | 'error' | 'load-error'
  const sync = ref('idle')
  const lastSavedAt = ref(null)

  // What was last loaded/saved, so filling the record from storage
  // doesn't count as an edit and trigger a save straight back.
  const snapshot = () => JSON.stringify([record.budget, record.races])
  let lastSnapshot = snapshot()
  let loadedFromAccount = false        // never overwrite the account copy before reading it
  let timer = null
  let inFlight = null
  let queued = false

  function apply(saved) {
    record.budget = saved?.budget ?? null
    record.races = saved?.races || {}
    record.updatedAt = saved?.updatedAt || null
    lastSnapshot = snapshot()
  }

  // ---- Loading ------------------------------------------------------------
  async function load() {
    if (mode.value === 'guest') {
      const saved = readLocal(localKey)
      if (saved) apply(saved)
      ready.value = true
      return
    }

    sync.value = 'loading'
    try {
      const { program } = await $fetch(apiUrl)
      // A copy saved in this browser before signing in? Fold it in once.
      const local = readLocal(localKey)
      let merged = program
      if (local && hasContent(local)) merged = mergePrograms(program, { ...local, trackId: id.trackId, date: id.date })
      apply(merged)
      loadedFromAccount = true
      sync.value = program ? 'saved' : 'idle'
      lastSavedAt.value = program?.updatedAt || null
      if (merged !== program) {
        lastSnapshot = ''           // the merged copy is new to the account
        await pushNow()
        removeLocal(localKey)
      }
    } catch {
      sync.value = 'load-error'
    }
    ready.value = true
  }

  // ---- Saving -------------------------------------------------------------
  async function pushNow() {
    if (mode.value !== 'account' || !loadedFromAccount) return
    if (inFlight) { queued = true; return inFlight }
    sync.value = 'saving'
    lastSnapshot = snapshot()
    inFlight = $fetch(apiUrl, { method: 'PUT', body: JSON.parse(JSON.stringify(record)) })
      .then((res) => {
        sync.value = 'saved'
        lastSavedAt.value = res?.updatedAt || new Date().toISOString()
      })
      .catch(() => { sync.value = 'error' })
      .finally(() => {
        inFlight = null
        if (queued) { queued = false; pushNow() }
      })
    return inFlight
  }

  function save() {
    if (!ready.value || snapshot() === lastSnapshot) return
    record.updatedAt = new Date().toISOString()
    if (mode.value === 'guest') {
      storageOk.value = writeLocal(localKey, record)
      lastSnapshot = snapshot()
      return
    }
    sync.value = 'saving'
    clearTimeout(timer)
    timer = setTimeout(pushNow, SAVE_DELAY)
  }

  // Leaving the page with a save still waiting: send it now. keepalive lets
  // the request finish even as the page unloads.
  function flush() {
    if (!timer || mode.value !== 'account' || !loadedFromAccount) return
    clearTimeout(timer)
    timer = null
    try {
      fetch(apiUrl, {
        method: 'PUT',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
    } catch { /* best effort */ }
  }

  function retry() {
    if (sync.value === 'load-error') { ready.value = false; return load() }
    return pushNow()
  }

  onMounted(() => {
    load()
    window.addEventListener('pagehide', flush)
  })
  onBeforeUnmount(() => {
    flush()
    window.removeEventListener('pagehide', flush)
  })
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

  function updateBet(raceNum, betId, patch) {
    const bet = race(raceNum).bets.find(b => b.id === betId)
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

  function removeBet(raceNum, betId) {
    const r = race(raceNum)
    r.bets = r.bets.filter(b => b.id !== betId)
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
  const hasInput = computed(() => hasContent(record))

  const budgetUsed = computed(() =>
    record.budget ? Math.min(100, Math.round((totals.value.staked / record.budget) * 100)) : null
  )
  const overBudget = computed(() => !!record.budget && totals.value.staked > record.budget)

  return {
    record, ready, storageOk, mode, sync, lastSavedAt, retry, hasInput,
    race, peek, toggleContender,
    addBet, updateBet, removeBet, settleFromResult, resetAll,
    totals, followedTotals, raceTotals, budgetUsed, overBudget
  }
}
