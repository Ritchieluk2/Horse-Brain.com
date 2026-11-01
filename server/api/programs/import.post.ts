// POST /api/programs/import   (signed in)
// Body: { programs: [record, …] }  (copies saved in this browser before signing in)
// Each is MERGED into the account's copy, so nothing on either side is lost.
// 200 → { imported: n }
import { programId, hasContent } from '#shared/program-rules.js'
import { mergeIntoProgram } from '../../utils/programs'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event).catch(() => null)
  const list = Array.isArray(body?.programs) ? body.programs.slice(0, 200) : []

  let imported = 0
  for (const p of list) {
    const id = programId(p?.trackId, p?.date)
    if (!id || !hasContent(p)) continue
    await mergeIntoProgram(user.id, id.trackId, id.date, p)
    imported++
  }
  return { imported }
})
