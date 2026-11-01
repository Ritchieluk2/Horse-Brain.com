import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Keep in step with wrangler.jsonc. 2025-07-15+ is required for Nitro's
  // Cloudflare dev emulation (local D1 in `npm run dev`).
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'HorseBrain — Race picks powered by machine learning',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#45201A' },
        { name: 'description', content: 'Transparent, machine-learning horse racing picks with a verified track record.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap' }
      ]
    }
  },

  // Cross-fade between pages using the browser's View Transitions API.
  // Unsupported browsers change page normally. Nuxt skips it for
  // prefers-reduced-motion. Timing lives in assets/scss/base/_motion.scss.
  experimental: {
    viewTransition: true
  },

  // DEV ONLY: works around a Nuxt 3.16+ dev-server bug where module
  // paths lose the project prefix ("__nuxt_vite_node__/module//node_modules/…")
  // and Vite's file-serving check answers 403. Applies to `nuxt dev` only,
  // never to builds or production. Remove once Nuxt fixes nuxt/nuxt#31311.
  $development: {
    vite: {
      server: {
        fs: { strict: false }
      }
    }
  },

  routeRules: {
    '/Racetracks': { ssr: false },
    // Never cache anything personal
    '/api/auth/**': { headers: { 'cache-control': 'no-store' } },
    '/account': { headers: { 'cache-control': 'no-store' } },
    '/account/**': { headers: { 'cache-control': 'no-store' } }
  },

  // Server-only settings. Override with env vars, e.g. NUXT_SESSION_SECRET.
  // See .env.example.
  runtimeConfig: {
    sessionSecret: '',  // 32+ chars; seals the sign-in cookie
    // Outgoing email (server/utils/email.ts). Locally these are read from
    // RESEND_API_KEY / EMAIL_FROM / EMAIL_REPLY_TO in .env.
    resendApiKey: '',
    emailFrom: '',
    emailReplyTo: '',
    siteUrl: ''         // base for links in emails; defaults to the request's own host
  },

  nitro: {
    // Cloudflare Workers (module format). In `npm run dev` this also
    // emulates the bindings in wrangler.jsonc, so the D1 database works
    // locally (.wrangler/state/v3). Requires `wrangler` (a devDependency).
    preset: 'cloudflare-module',
    cloudflare: {
      nodeCompat: true
    }
  },

  // One global stylesheet. Component <style> blocks stay scoped and
  // only hold page-specific layout.
  css: ['@/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Makes breakpoints + mixins (up(), down(), card(), …) available
          // in every <style lang="scss"> without an import.
          // Emits no CSS, so it is safe to inject everywhere.
          additionalData: '@use "@/assets/scss/abstracts" as *;\n'
        }
      }
    }
  }
})
