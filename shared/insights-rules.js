// =============================================================
//  Insights: turns a user's saved Raceday Programs into the
//  figures on /account/insights. Pure functions, no I/O, so the
//  server (and tests) can call them directly.
//  Import as '#shared/insights-rules.js'.
//
//  Honesty rules (BRANDING: Responsibility, Honesty):
//   • Profit, loss, ROI and strike rate count SETTLED bets only.
//   • Every figure comes with its sample size; small samples are
//     flagged, never hidden.
//   • Best and worst days are shown together.
// =============================================================
import { summarise, BET_TYPES, betType } from './program-rules.js'

// Below this many settled bets, percentages swing too much to mean much
export const SMALL_SAMPLE = 30

export const PERIODS = [
  { id: 'all', label: 'All time', days: null },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
  { id: '365d', label: 'Last 12 months', days: 365 }
]

/** 'YYYY-MM-DD' for `days` before `today` (also 'YYYY-MM-DD'). */
export function periodStart(periodId, today) {
  const p = PERIODS.find(x => x.id === periodId)
  if (!p?.days) return null
  const [y, m, d] = today.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d - p.days + 1))
  return dt.toISOString().slice(0, 10)
}

const round2 = (n) => Math.round(n * 100) / 100
const settledCount = (s) => s.won + s.lost

/** Flatten programs into bets that know their track, date and race. */
export function flattenBets(programs) {
  const out = []
  for (const p of programs) {
    for (const [race, r] of Object.entries(p.races || {})) {
      for (const b of r.bets || []) out.push({ ...b, trackId: p.trackId, date: p.date, race: Number(race) })
    }
  }
  return out
}

function groupSummaries(bets, keyFn, extra = () => ({})) {
  const groups = new Map()
  for (const b of bets) {
    const k = keyFn(b)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k).push(b)
  }
  return [...groups.entries()].map(([key, list]) => ({ key, ...summarise(list), ...extra(key, list) }))
}

/**
 * @param programs  saved program records (v1)
 * @param opts      { from?: 'YYYY-MM-DD', to?: 'YYYY-MM-DD', track?: 'KEE' }
 */
export function computeInsights(programs, opts = {}) {
  const { from = null, to = null, track = null } = opts
  const inScope = programs.filter(p =>
    (!from || p.date >= from) && (!to || p.date <= to) && (!track || p.trackId === track))

  const bets = flattenBets(inScope)
  const totals = summarise(bets)
  const dates = inScope.map(p => p.date).sort()

  // ---- Per raceday, oldest first, with a running total --------------
  let running = 0
  const days = inScope
    .map((p) => {
      const dayBets = bets.filter(b => b.date === p.date && b.trackId === p.trackId)
      const s = summarise(dayBets)
      return {
        date: p.date,
        trackId: p.trackId,
        bets: s.count,
        settled: settledCount(s),
        staked: s.staked,
        net: s.net,
        budget: p.budget ?? null,
        overBudget: !!p.budget && s.staked > p.budget
      }
    })
    .filter(d => d.bets)
    .sort((a, b) => a.date.localeCompare(b.date) || a.trackId.localeCompare(b.trackId))
    .map((d) => { running = round2(running + d.net); return { ...d, cumulative: running } })

  const settledDays = days.filter(d => d.settled)
  const best = settledDays.reduce((m, d) => (!m || d.net > m.net ? d : m), null)
  const worst = settledDays.reduce((m, d) => (!m || d.net < m.net ? d : m), null)

  // ---- Breakdowns ----------------------------------------------------
  const typeOrder = BET_TYPES.map(t => t.id)
  const byType = groupSummaries(bets, b => b.type, k => ({ label: betType(k).label }))
    .sort((a, b) => typeOrder.indexOf(a.key) - typeOrder.indexOf(b.key))

  const byTrack = groupSummaries(bets, b => b.trackId, (k, list) => ({
    racedays: new Set(list.map(b => b.date)).size
  })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))

  const byMonth = groupSummaries(bets, b => b.date.slice(0, 7))
    .sort((a, b) => a.key.localeCompare(b.key))

  const followed = summarise(bets.filter(b => b.source === 'horsebrain'))
  const own = summarise(bets.filter(b => b.source !== 'horsebrain'))

  // ---- Budget habits -------------------------------------------------
  const withBudget = days.filter(d => d.budget)
  const budget = {
    daysWithBudget: withBudget.length,
    daysOver: withBudget.filter(d => d.overBudget).length,
    racedays: days.length
  }

  // ---- Biggest single return ----------------------------------------
  const biggestWin = bets
    .filter(b => b.status === 'won' && b.payout)
    .reduce((m, b) => (!m || b.payout > m.payout ? b : m), null)

  const settled = settledCount(totals)
  return {
    scope: { from, to, track },
    range: dates.length ? { first: dates[0], last: dates[dates.length - 1] } : null,
    racedays: days.length,
    racesPlayed: new Set(bets.map(b => `${b.trackId}:${b.date}:${b.race}`)).size,
    totals,
    sample: { settled, pending: totals.pending, small: settled < SMALL_SAMPLE },
    followed,
    own,
    byType,
    byTrack,
    byMonth,
    days,
    best,
    worst: worst && best && worst !== best ? worst : null,
    budget,
    biggestWin: biggestWin && {
      date: biggestWin.date, trackId: biggestWin.trackId, race: biggestWin.race,
      type: biggestWin.type, label: betType(biggestWin.type).label,
      selection: biggestWin.selection, stake: biggestWin.stake, payout: biggestWin.payout
    },
    tracks: [...new Set(programs.map(p => p.trackId))].sort()
  }
}
