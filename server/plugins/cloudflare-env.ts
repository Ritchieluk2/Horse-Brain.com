// On Cloudflare, secrets and vars (NUXT_SESSION_SECRET, NUXT_RESEND_API_KEY,
// NUXT_SITE_URL …) arrive with each request on `env`, but Nuxt's
// useRuntimeConfig(event) reads them from process.env. Newer Workers
// compatibility dates fill process.env automatically; this copies them
// across anyway so settings never silently go missing. Strings only;
// bindings like the D1 database are left alone.
// Production only: in `npm run dev`, .env is the source of settings (the
// emulated env carries wrangler.jsonc's production NUXT_SITE_URL).
export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return
  nitroApp.hooks.hook('request', (event) => {
    const env = event.context.cloudflare?.env
    if (!env || typeof process === 'undefined') return
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'string' && (key.startsWith('NUXT_') || key.startsWith('NITRO_'))) {
        process.env[key] = value
      }
    }
  })
})
