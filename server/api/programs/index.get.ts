// GET /api/programs   (signed in)
// 200 → { programs: [{ trackId, date, updatedAt, summary }] }, newest first
import { listPrograms } from '../../utils/programs'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { programs: await listPrograms(user.id) }
})
