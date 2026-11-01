// POST /api/account/password   (signed in)
// Body: { currentPassword, newPassword }
// Changes the password, signs out every other device, keeps this one
// signed in, and emails a "password changed" notice.
// 200 → { user }   400 field errors   429 too many wrong current passwords
import { validatePassword } from '#shared/account-rules.js'
import { sendPasswordChangedEmail } from '../../utils/account-emails'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event).catch(() => null)
  const current = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
  const next = typeof body?.newPassword === 'string' ? body.newPassword : ''

  const locked = await lockMinutesLeft(user.email)
  if (locked) {
    throw createError({ statusCode: 429, statusMessage: `Too many attempts. Try again in ${locked} minute${locked === 1 ? '' : 's'}.` })
  }

  if (!current || !(await verifyPassword(current, user.password))) {
    if (current) await recordFailure(user.email)
    const msg = current ? 'That isn’t your current password.' : 'Enter your current password.'
    throw createError({ statusCode: 400, statusMessage: msg, data: { fieldErrors: { currentPassword: msg } } })
  }

  const pwError = validatePassword(next, user.email)
    || (next === current ? 'Choose a password you haven’t been using.' : '')
  if (pwError) {
    throw createError({ statusCode: 400, statusMessage: pwError, data: { fieldErrors: { newPassword: pwError } } })
  }

  await clearFailures(user.email)
  const updated = await updateUser(user.id, {
    password: await hashPassword(next),
    sessionVersion: (user.sessionVersion || 1) + 1
  })
  await startUserSession(event, updated!)

  try {
    await sendPasswordChangedEmail(event, updated!)
  } catch (err: any) {
    console.error('[auth] password-changed email not sent:', err?.message || err)
  }
  return { user: toPublicUser(updated) }
})
