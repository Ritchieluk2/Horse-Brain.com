// POST /api/auth/forgot-password   Body: { email }
// Always answers the same way, so it can't be used to find out
// which emails have accounts. 200 → { ok: true }
import { normalizeEmail, validateEmail } from '#shared/account-rules.js'
import { emailCooldownSeconds } from '../../utils/tokens'
import { sendPasswordResetEmail } from '../../utils/account-emails'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const email = normalizeEmail(body?.email)
  const invalid = validateEmail(email)
  if (invalid) {
    throw createError({ statusCode: 400, statusMessage: invalid, data: { fieldErrors: { email: invalid } } })
  }

  const user = await findUserByEmail(email)
  if (user && user.status === 'active' && !(await emailCooldownSeconds('reset-password', email))) {
    try {
      await sendPasswordResetEmail(event, user)
    } catch (err: any) {
      // The answer stays the same either way, so log it for us
      console.error('[auth] reset email not sent:', err?.message || err)
    }
  }
  return { ok: true }
})
