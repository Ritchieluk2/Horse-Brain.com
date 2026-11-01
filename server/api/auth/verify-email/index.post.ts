// POST /api/auth/verify-email   Body: { token }
// Confirms the address from the emailed link.
// 200 → { ok: true, email }   400 → invalid or expired link
import { consumeToken } from '../../../utils/tokens'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const user = await consumeToken('verify-email', body?.token)
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'This link is invalid or has expired.' })
  }
  if (!user.emailVerifiedAt) {
    await updateUser(user.id, { emailVerifiedAt: new Date().toISOString() })
  }
  return { ok: true, email: user.email }
})
