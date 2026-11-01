// GET /api/dev/preset-check   (only exists under `npm run dev`)
// Runs Nitro's own build-target lookup for 'cloudflare-module' in dev mode
// and reports the result or the error Nitro would otherwise swallow.
export default defineEventHandler(async () => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  const spec = 'nitropack/presets'
  const out: Record<string, unknown> = {}
  try {
    const { resolvePreset } = await import(/* @vite-ignore */ spec)
    for (const date of ['2025-07-15', { default: '2025-07-15' }]) {
      try {
        const p = await resolvePreset('cloudflare-module', { dev: true, compatibilityDate: date })
        out[JSON.stringify(date)] = p?._meta?.name || '(nothing matched)'
      } catch (e: any) {
        out[JSON.stringify(date)] = `ERROR: ${e?.message || e}`
      }
    }
  } catch (e: any) {
    out.importError = e?.message || String(e)
  }
  out.env = { NITRO_PRESET: process.env.NITRO_PRESET || null, SERVER_PRESET: process.env.SERVER_PRESET || null }
  return out
})
