// Pages that need a signed-in user:
//   definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware((to) => {
  const { signedIn } = useAuth()
  if (!signedIn.value) {
    return navigateTo({ path: '/sign-in', query: { redirect: to.fullPath } })
  }
})
