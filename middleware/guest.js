// Sign-in / sign-up: send people who are already signed in onward.
//   definePageMeta({ middleware: 'guest' })
import { safeRedirect } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { signedIn } = useAuth()
  if (signedIn.value) return navigateTo(safeRedirect(to.query.redirect))
})
