// POST /api/auth/confirm-email-change   Body: { token }
// Finishes an email change from the link sent to the new address.
// Works without being signed in (the link may be opened on a phone).
// 200 → { ok: true, email }   400 invalid/expired   409 address taken meanwhile
import { consumeEmailChangeToken } from '../../utils/tokens'
import { changeUserEmail, EmailTakenError } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const found = await consumeEmailChangeToken(body?.token)
  if (!found) {
    throw createError({ statusCode: 400, statusMessage: 'This link is invalid or has expired.' })
  }
  // The user may have cancelled the change after the email went out
  if (found.user.pendingEmail?.email !== found.newEmail) {
    throw createError({ statusCode: 400, statusMessage: 'This email change was cancelled.' })
  }

  try {
    await changeUserEmail(found.user.id, found.newEmail)
  } catch (err) {
    if (err instanceof EmailTakenError) {
      await updateUser(found.user.id, { pendingEmail: null })
      throw createError({ statusCode: 409, statusMessage: 'Another HorseBrain account started using that email in the meantime.' })
    }
    throw err
  }
  return { ok: true, email: found.newEmail }
})
