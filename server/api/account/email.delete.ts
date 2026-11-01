// DELETE /api/account/email   (signed in)
// Cancels a pending email change; its confirmation link stops working.
// 200 → { user }
import { revokeTokens } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await revokeTokens('change-email', user.id)
  const updated = await updateUser(user.id, { pendingEmail: null })
  return { user: toPublicUser(updated) }
})
