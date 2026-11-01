// `npm run dev` only: give the server the same Cloudflare bindings it gets
// in production (the D1 database `horsebrain`), using wrangler's local
// emulation. Data lives in .wrangler/state/v3, the same place
// `npx wrangler d1 migrations apply horsebrain --local` writes to.
//
// Why this exists: Nitro 2.12's built-in emulation needs compatibilityDate
// 2025-07-15, but the installed `compatx` caps dates at 2025-07-11, so it
// never switches on. This does the same job (it mirrors Nitro's own
// cloudflare/runtime/plugin.dev). It steps aside if Nitro's emulation is
// ever active, and is removed from production builds entirely.
export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.dev) return
  if ((globalThis as any).__env__) return // Nitro's own emulation is running

  const spec = 'wrangler' // variable, so the bundler leaves it alone
  const proxy = import(/* @vite-ignore */ spec)
    .then(({ getPlatformProxy }) => getPlatformProxy({
      configPath: 'wrangler.jsonc',
      persist: { path: '.wrangler/state/v3' }
    }))
    .then((p) => {
      console.info('[dev] Cloudflare bindings ready:', Object.keys(p.env).filter(k => typeof p.env[k] !== 'string').join(', ') || '(none)')
      return p
    })
    .catch((err) => {
      console.error('[dev] Cloudflare bindings unavailable:', err?.message || err)
      return null
    })

  ;(globalThis as any).__env__ = proxy.then(p => p?.env || {})

  nitroApp.hooks.hook('request', async (event) => {
    const p = await proxy
    if (p) event.context.cloudflare = { ...event.context.cloudflare, env: p.env, context: p.ctx }
  })
  nitroApp.hooks.hook('close', async () => { await (await proxy)?.dispose() })
})
