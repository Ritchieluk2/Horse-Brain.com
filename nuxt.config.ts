import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
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

  routeRules: {
    '/Racetracks': { ssr: false }
  },

  nitro: {
    preset: 'cloudflare_module',   // ← was 'cloudflare_pages'
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
