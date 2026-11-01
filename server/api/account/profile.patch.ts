// PATCH /api/account/profile   (signed in)
// Body: { firstName, lastName, phone, address, marketingOptIn }
// 200 → { user }   400 → { data: { fieldErrors } }
import { validateProfile } from '#shared/account-rules.js'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event).catch(() => null)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Expected a JSON body.' })
  }

  const { errors, value } = validateProfile(body)
  if (Object.keys(errors).length) {
    throw createError({ statusCode: 400, statusMessage: 'Please fix the highlighted fields.', data: { fieldErrors: errors } })
  }

  const updated = await updateUser(user.id, value)
  return { user: toPublicUser(updated) }
})
