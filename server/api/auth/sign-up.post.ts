// POST /api/auth/sign-up
// Body: { firstName, lastName, email, password, phone?, address?,
//         agreements: { terms, disclaimer, age }, marketingOptIn? }
// 201 → { user, verificationSent }   400/409 → { data: { fieldErrors } }
import { validateSignUp } from '#shared/account-rules.js'
import { sendVerificationEmail } from '../../utils/account-emails'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Expected a JSON body.' })
  }

  const { ok, errors, value } = validateSignUp(body)
  if (!ok) {
    throw createError({ statusCode: 400, statusMessage: 'Please fix the highlighted fields.', data: { fieldErrors: errors } })
  }

  try {
    const user = await createUser({ ...value, password: await hashPassword(body.password) })
    await startUserSession(event, user)

    // The account exists either way; if the email fails, /account offers "Resend"
    let verificationSent = true
    try {
      await sendVerificationEmail(event, user)
    } catch (err: any) {
      verificationSent = false
      console.error('[auth] verification email not sent:', err?.message || err)
    }

    setResponseStatus(event, 201)
    return { user: toPublicUser(user), verificationSent }
  } catch (err) {
    if (err instanceof EmailTakenError) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That email already has an account.',
        data: { fieldErrors: { email: 'An account with this email already exists. Sign in instead?' } }
      })
    }
    throw err
  }
})
