// GET /api/dev/seed-programs?count=24     (only exists under `npm run dev`)
// GET /api/dev/seed-programs?clear=1      removes ALL of your programs
// Fills the signed-in account with realistic sample racedays so the
// history and insights pages can be checked. Same seed → same data.
// Sample days are flagged in their notes: "[sample data]".
import { saveProgram, listPrograms, deleteProgram } from '../../utils/programs'

const TRACKS = ['KEE', 'CD', 'BEL', 'RP', 'DD', 'AD']

// Small deterministic RNG (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// [type, legs, chance of hitting, typical payout multiple on a $2 base]
const KINDS: [string, number, number, [number, number]][] = [
  ['win', 1, 0.24, [4, 14]],
  ['place', 1, 0.42, [2.4, 6]],
  ['show', 1, 0.56, [2.1, 4.2]],
  ['exacta', 2, 0.09, [12, 60]],
  ['trifecta', 3, 0.03, [40, 300]]
]

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  const user = await requireUser(event)
  const q = getQuery(event)

  if (q.clear) {
    const all = await listPrograms(user.id)
    for (const p of all) await deleteProgram(user.id, p.trackId, p.date)
    return { cleared: all.length }
  }

  const count = Math.min(Math.max(Number(q.count) || 24, 1), 80)
  const r = rng(Number(q.seed) || 7)
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)]
  const today = new Date()
  let made = 0

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor((i / count) * 150 + r() * 4)
    const d = new Date(today.getTime() - daysAgo * 86400000).toISOString().slice(0, 10)
    const trackId = pick(TRACKS)
    const stakeUnit = pick([2, 2, 2, 5, 10])
    const races: Record<string, any> = {}
    const raceCount = 2 + Math.floor(r() * 6)

    for (let n = 0; n < raceCount; n++) {
      const raceNum = 1 + Math.floor(r() * 10)
      const bets = []
      const betCount = 1 + Math.floor(r() * 3)
      for (let b = 0; b < betCount; b++) {
        const [type, legs, hit, [lo, hi]] = r() < 0.75 ? KINDS[Math.floor(r() * 3)] : pick(KINDS.slice(3))
        const stake = type === 'trifecta' || type === 'exacta' ? (stakeUnit === 2 ? 1 : 2) : stakeUnit
        const selection = Array.from({ length: legs }, () => String(1 + Math.floor(r() * 10)))
        const pending = daysAgo < 1 && r() < 0.5
        const won = !pending && r() < hit
        bets.push({
          id: `seed_${i}_${n}_${b}`,
          type, selection, stake,
          status: pending ? 'pending' : won ? 'won' : 'lost',
          payout: won ? Math.round((stake / 2) * (lo + r() * (hi - lo)) * 10) / 10 : null,   // $ back incl. stake
          source: r() < 0.55 ? 'horsebrain' : 'user',
          createdAt: `${d}T${String(13 + n).padStart(2, '0')}:00:00.000Z`
        })
      }
      races[String(raceNum)] = { contenders: [], notes: n === 0 ? '[sample data]' : '', bets }
    }

    await saveProgram(user.id, trackId, d, { budget: r() < 0.5 ? pick([40, 60, 100]) : null, races })
    made++
  }
  return { seeded: made }
})
