// GET /api/insights?period=all|30d|90d|365d&track=KEE   (signed in)
// 200 → the object from computeInsights() (shared/insights-rules.js)
import { computeInsights, periodStart, PERIODS } from '#shared/insights-rules.js'
import { programId } from '#shared/program-rules.js'
import { getAllPrograms } from '../../utils/programs'

// Today's date where the racing is (US Eastern), as YYYY-MM-DD
const todayET = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const q = getQuery(event)
  const period = PERIODS.some(p => p.id === q.period) ? String(q.period) : 'all'
  const track = q.track ? programId(q.track, '2000-01-01')?.trackId || null : null

  const programs = await getAllPrograms(user.id)
  return {
    period,
    ...computeInsights(programs, { from: periodStart(period, todayET()), track })
  }
})
