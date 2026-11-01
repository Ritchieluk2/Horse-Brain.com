// DELETE /api/programs/:track/:date   (signed in) → { ok: true }
import { programId } from '#shared/program-rules.js'
import { deleteProgram } from '../../../utils/programs'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = programId(getRouterParam(event, 'track'), getRouterParam(event, 'date'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Unknown track or date.' })
  await deleteProgram(user.id, id.trackId, id.date)
  return { ok: true }
})
