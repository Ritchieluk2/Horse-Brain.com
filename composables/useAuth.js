// =============================================================
//  useAuth: the signed-in user, shared across the app.
//
//    const { user, signedIn, signIn, signUp, signOut } = useAuth()
//
//  `user` is the public user record from server/utils/users.ts
//  (no password data). It's loaded once per page load by
//  plugins/auth.js, during SSR when possible, so pages and the
//  header know who's signed in on first paint.
//
//  Errors thrown by signIn/signUp are normalised to:
//    { message, fieldErrors: { field: message }, status }
// =============================================================
import { computed } from 'vue'
import { importGuestPrograms } from '~/composables/useRacedayProgram'

export function useAuth() {
  const user = useState('hb:user', () => null)
  const loaded = useState('hb:user-loaded', () => false)
  // false when the site is served without its API (e.g. the static
  // GitHub Pages preview), so pages can say accounts aren't available
  const available = useState('hb:auth-available', () => true)

  const signedIn = computed(() => !!user.value)
  // How many browser-saved programs were just moved into the account
  const importedPrograms = useState('hb:programs-imported', () => 0)

  // After any sign-in: bring this browser's guest programs into the account.
  // Never blocks or fails the sign-in itself.
  async function adoptGuestData() {
    try { importedPrograms.value += await importGuestPrograms() } catch { /* try again next time */ }
  }

  async function refresh() {
    // useRequestFetch forwards the browser's cookie during SSR
    const fetcher = useRequestFetch()
    try {
      const res = await fetcher('/api/auth/me')
      user.value = res?.user || null
      available.value = true
    } catch {
      user.value = null
      available.value = false
    } finally {
      loaded.value = true
    }
    return user.value
  }

  async function call(url, body) {
    try {
      const res = await $fetch(url, { method: 'POST', body })
      user.value = res?.user || null
      if (user.value) await adoptGuestData()
      return user.value
    } catch (err) {
      throw normaliseError(err)
    }
  }

  const signUp = (form) => call('/api/auth/sign-up', form)
  const signIn = (email, password) => call('/api/auth/sign-in', { email, password })

  // ---- Email flows (each throws a normalised error like signIn) ----
  const post = async (url, body) => {
    try { return await $fetch(url, { method: 'POST', body }) } catch (err) { throw normaliseError(err) }
  }

  const requestPasswordReset = (email) => post('/api/auth/forgot-password', { email })
  const resendVerification = () => post('/api/auth/verify-email/resend')

  async function checkResetToken(token) {
    try { return (await $fetch('/api/auth/reset-password', { query: { token } })).valid } catch { return false }
  }

  async function resetPassword(token, password) {
    const res = await post('/api/auth/reset-password', { token, password })
    user.value = res?.user || null
    if (user.value) await adoptGuestData()
    return user.value
  }

  async function verifyEmail(token) {
    const res = await post('/api/auth/verify-email', { token })
    // Update the header/account page if this browser is signed in
    if (user.value) await refresh()
    return res
  }

  // ---- Account settings (each returns the updated user) ----
  async function send(url, method, body) {
    try {
      const res = await $fetch(url, { method, body })
      if (res?.user) user.value = res.user
      return res
    } catch (err) { throw normaliseError(err) }
  }

  const updateProfile = (profile) => send('/api/account/profile', 'PATCH', profile)
  const changePassword = (currentPassword, newPassword) => send('/api/account/password', 'POST', { currentPassword, newPassword })
  const requestEmailChange = (newEmail, currentPassword) => send('/api/account/email', 'POST', { newEmail, currentPassword })
  const cancelEmailChange = () => send('/api/account/email', 'DELETE')

  async function confirmEmailChange(token) {
    const res = await post('/api/auth/confirm-email-change', { token })
    if (user.value) await refresh()
    return res
  }

  async function signOut({ redirect = '/' } = {}) {
    try { await $fetch('/api/auth/sign-out', { method: 'POST' }) } catch { /* cookie may already be gone */ }
    user.value = null
    if (redirect) await navigateTo(redirect)
  }

  return {
    user, loaded, available, signedIn, refresh, signUp, signIn, signOut, adoptGuestData, importedPrograms,
    requestPasswordReset, checkResetToken, resetPassword, verifyEmail, resendVerification,
    updateProfile, changePassword, requestEmailChange, cancelEmailChange, confirmEmailChange
  }
}

function normaliseError(err) {
  const status = err?.statusCode || err?.response?.status || 0
  if (!status) {
    return { status: 0, message: 'We couldn’t reach HorseBrain. Check your connection and try again.', fieldErrors: {} }
  }
  if (status === 404 || status === 405) {
    return { status, message: 'Accounts aren’t available on this preview of the site yet.', fieldErrors: {} }
  }
  return {
    status,
    message: err?.data?.statusMessage || err?.statusMessage || 'Something went wrong. Please try again.',
    fieldErrors: err?.data?.data?.fieldErrors || {}
  }
}

// Only allow same-site paths as a post-sign-in destination
export function safeRedirect(target, fallback = '/account') {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : fallback
}
