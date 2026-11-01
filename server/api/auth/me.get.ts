// GET /api/auth/me → { user } (null when signed out)
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { user: toPublicUser(await getSessionUser(event)) }
})
