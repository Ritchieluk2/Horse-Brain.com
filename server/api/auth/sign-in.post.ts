// POST /api/auth/sign-in
// Body: { email, password }
// 200 → { user }   401 wrong details   429 locked out
import { normalizeEmail } from '#shared/account-rules.js'

const WRONG = 'That email and password don’t match an account.'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const email = normalizeEmail(body?.email)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Enter your email and password.' })
  }

  const locked = await lockMinutesLeft(email)
  if (locked) {
    throw createError({
      statusCode: 429,
      statusMessage: `Too many attempts. Try again in ${locked} minute${locked === 1 ? '' : 's'}.`
    })
  }

  const user = await findUserByEmail(email)
  const valid = user ? await verifyPassword(password, user.password) : await fakeVerify(password)

  if (!user || !valid) {
    await recordFailure(email)
    throw createError({ statusCode: 401, statusMessage: WRONG })
  }
  if (user.status !== 'active') {
    throw createError({ statusCode: 403, statusMessage: 'This account is disabled. Email info@horse-brain.com for help.' })
  }

  await clearFailures(email)
  const updated = await updateUser(user.id, { lastSignInAt: new Date().toISOString() })
  await startUserSession(event, user)
  return { user: toPublicUser(updated) }
})
