// POST /api/auth/sign-out → { ok: true }
export default defineEventHandler(async (event) => {
  await endUserSession(event)
  return { ok: true }
})
