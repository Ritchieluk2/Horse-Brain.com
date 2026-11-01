// GET /api/auth/reset-password?token=…
// Checks a reset link without using it, so the page can say
// "expired" before the user types a new password.
// 200 → { valid: boolean }
import { peekToken } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const found = await peekToken('reset-password', getQuery(event).token)
  return { valid: !!found }
})
