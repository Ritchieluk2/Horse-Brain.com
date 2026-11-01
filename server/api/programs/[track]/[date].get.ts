// GET /api/programs/:track/:date   (signed in)
// 200 → { program } (null if this user hasn't saved one)
import { programId } from '#shared/program-rules.js'
import { getProgram } from '../../../utils/programs'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = programId(getRouterParam(event, 'track'), getRouterParam(event, 'date'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Unknown track or date.' })
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { program: await getProgram(user.id, id.trackId, id.date) }
})
