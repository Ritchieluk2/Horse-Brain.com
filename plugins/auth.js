// Load the signed-in user once per page load (on the server during SSR,
// or in the browser for client-only routes like /Racetracks).
// In the browser, also move any programs saved while signed out into
// the account (e.g. made in another tab before signing in).
export default defineNuxtPlugin(async (nuxtApp) => {
  const { loaded, refresh, signedIn, adoptGuestData } = useAuth()
  if (!loaded.value) await refresh()
  if (import.meta.client && signedIn.value) {
    nuxtApp.hook('app:mounted', () => { adoptGuestData() })
  }
})
