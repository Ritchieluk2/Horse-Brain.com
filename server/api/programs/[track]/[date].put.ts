// PUT /api/programs/:track/:date   (signed in)
// Body: the whole program record (v1). Replaces the saved copy.
// 200 → { updatedAt, summary }
import { programId } from '#shared/program-rules.js'
import { saveProgram } from '../../../utils/programs'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = programId(getRouterParam(event, 'track'), getRouterParam(event, 'date'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Unknown track or date.' })
  const body = await readBody(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Expected a program record.' })

  const { record, listing } = await saveProgram(user.id, id.trackId, id.date, body)
  return { updatedAt: record.updatedAt, summary: listing?.summary || null }
})
