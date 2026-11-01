// POST /api/auth/reset-password   Body: { token, password }
// Sets the new password, signs out every other device, signs the
// user in here and sends a "password changed" notice.
// 200 → { user }   400 bad password / invalid link
import { validatePassword } from '#shared/account-rules.js'
import { peekToken, consumeToken } from '../../utils/tokens'
import { sendPasswordChangedEmail } from '../../utils/account-emails'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const found = await peekToken('reset-password', body?.token)
  if (!found) {
    throw createError({ statusCode: 400, statusMessage: 'This reset link is invalid or has expired. Request a new one.' })
  }

  const pwError = validatePassword(body?.password, found.user.email)
  if (pwError) {
    throw createError({ statusCode: 400, statusMessage: pwError, data: { fieldErrors: { password: pwError } } })
  }

  const user = await consumeToken('reset-password', body.token)
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'This reset link is invalid or has expired. Request a new one.' })
  }

  const now = new Date().toISOString()
  const updated = await updateUser(user.id, {
    password: await hashPassword(body.password),
    sessionVersion: (user.sessionVersion || 1) + 1,
    // The link reached their inbox, so the address is confirmed too
    emailVerifiedAt: user.emailVerifiedAt || now,
    lastSignInAt: now
  })
  await clearFailures(user.email)
  await startUserSession(event, updated!)

  try {
    await sendPasswordChangedEmail(event, updated!)
  } catch (err: any) {
    console.error('[auth] password-changed email not sent:', err?.message || err)
  }

  return { user: toPublicUser(updated) }
})
