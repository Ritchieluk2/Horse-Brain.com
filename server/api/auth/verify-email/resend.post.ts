// POST /api/auth/verify-email/resend   (signed in)
// 200 → { ok: true }   400 already confirmed   429 cooldown   503 send failed
import { emailCooldownSeconds } from '../../../utils/tokens'
import { sendVerificationEmail } from '../../../utils/account-emails'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (user.emailVerifiedAt) {
    throw createError({ statusCode: 400, statusMessage: 'Your email is already confirmed.' })
  }

  const wait = await emailCooldownSeconds('verify-email', user.email)
  if (wait) {
    throw createError({ statusCode: 429, statusMessage: `We just sent one. You can ask again in ${wait} seconds.` })
  }

  try {
    await sendVerificationEmail(event, user)
  } catch (err: any) {
    console.error('[auth] verification email not sent:', err?.message || err)
    throw createError({
      statusCode: 503,
      statusMessage: 'We couldn’t send the email just now. Please try again in a few minutes.',
      // In `npm run dev` only, include the provider's reason to make setup problems obvious
      data: import.meta.dev ? { detail: err?.message } : undefined
    })
  }
  return { ok: true }
})
