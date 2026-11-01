// GET /api/dev/env-check   (only exists under `npm run dev`)
// Is Cloudflare dev emulation running, and which bindings does it expose?
// Lists binding NAMES and types only, never values.
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  const g = (globalThis as any).__env__
  let env: any = null
  let envError = ''
  try { env = await g } catch (e: any) { envError = e?.message || String(e) }
  return {
    globalEnvSet: g !== undefined,
    globalEnvIsPromise: typeof g?.then === 'function',
    envError,
    bindings: env ? Object.fromEntries(Object.keys(env).map(k => [k, typeof env[k] === 'string' ? 'string (hidden)' : typeof env[k]])) : null,
    eventCloudflare: !!event.context.cloudflare,
    wranglerConfig: (useRuntimeConfig() as any).wrangler || null
  }
})
