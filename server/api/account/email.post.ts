// POST /api/account/email   (signed in)
// Body: { newEmail, currentPassword }
// Starts an email change: sends a confirmation link to the NEW address
// and a heads-up to the current one. Nothing changes until it's confirmed.
// 200 → { user }   400 field errors   409 address in use   429 cooldown
import { normalizeEmail, validateEmail } from '#shared/account-rules.js'
import { emailCooldownSeconds } from '../../utils/tokens'
import { sendEmailChangeEmails } from '../../utils/account-emails'
import { emailAvailable } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event).catch(() => null)
  const newEmail = normalizeEmail(body?.newEmail)
  const current = typeof body?.currentPassword === 'string' ? body.currentPassword : ''

  const fail = (statusCode: number, field: string, msg: string) =>
    createError({ statusCode, statusMessage: msg, data: { fieldErrors: { [field]: msg } } })

  const emailErr = validateEmail(newEmail)
  if (emailErr) throw fail(400, 'newEmail', emailErr)
  if (newEmail === user.email) throw fail(400, 'newEmail', 'That’s already your email address.')

  const locked = await lockMinutesLeft(user.email)
  if (locked) {
    throw createError({ statusCode: 429, statusMessage: `Too many attempts. Try again in ${locked} minute${locked === 1 ? '' : 's'}.` })
  }
  if (!current || !(await verifyPassword(current, user.password))) {
    if (current) await recordFailure(user.email)
    throw fail(400, 'emailPassword', current ? 'That isn’t your current password.' : 'Enter your current password.')
  }
  await clearFailures(user.email)

  if (!(await emailAvailable(newEmail, user.id))) {
    throw fail(409, 'newEmail', 'Another HorseBrain account already uses that email.')
  }

  const wait = await emailCooldownSeconds('change-email', user.email)
  if (wait) {
    throw createError({ statusCode: 429, statusMessage: `We just sent a confirmation. You can try again in ${wait} seconds.` })
  }

  try {
    await sendEmailChangeEmails(event, user, newEmail)
  } catch (err: any) {
    console.error('[auth] email-change confirmation not sent:', err?.message || err)
    throw createError({
      statusCode: 503,
      statusMessage: 'We couldn’t send the confirmation email just now. Please try again in a few minutes.',
      data: import.meta.dev ? { detail: err?.message } : undefined
    })
  }

  const updated = await updateUser(user.id, { pendingEmail: { email: newEmail, requestedAt: new Date().toISOString() } })
  return { user: toPublicUser(updated) }
})
