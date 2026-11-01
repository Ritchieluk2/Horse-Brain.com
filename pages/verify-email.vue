<template>
  <div class="verify-email-page">
    <PageTitle title="Confirm Email" />

    <section class="auth auth--single">
      <div class="container auth__grid">
        <div class="auth__card" role="status">
          <p v-if="state === 'checking'" class="auth__text">Confirming your email…</p>

          <template v-else-if="state === 'done'">
            <StatusIcon kind="success" />
            <h2 class="auth__title">Email confirmed</h2>
            <p v-if="isChange" class="auth__text">Done. Your HorseBrain account now uses <strong>{{ email }}</strong>; sign in with it from now on.</p>
            <p v-else class="auth__text">Thanks. <strong>{{ email }}</strong> is confirmed for your HorseBrain account.</p>
            <div class="form-actions">
              <NuxtLink v-if="signedIn" to="/account" class="btn btn--primary btn--large">Go to My Account</NuxtLink>
              <NuxtLink v-else to="/sign-in" class="btn btn--primary btn--large">Sign In</NuxtLink>
            </div>
          </template>

          <template v-else>
            <StatusIcon kind="error" />
            <h2 class="auth__title">{{ errorMessage ? 'Email not changed' : 'This link has expired' }}</h2>
            <p v-if="errorMessage" class="auth__text">{{ errorMessage }}</p>
            <p v-else-if="isChange" class="auth__text">
              Email-change links work for 24 hours and only once, and stop working if the change is
              cancelled. You can start the change again from your account settings.
            </p>
            <p v-else class="auth__text">
              Confirmation links work for 24 hours and only once. If you asked for more than one email,
              only the newest link works. Your email may also already be confirmed.
            </p>
            <div class="form-actions">
              <NuxtLink v-if="isChange" :to="signedIn ? '/account/settings' : { path: '/sign-in', query: { redirect: '/account/settings' } }" class="btn btn--primary btn--large">Go to Account Settings</NuxtLink>
              <NuxtLink v-else-if="signedIn" to="/account" class="btn btn--primary btn--large">Send a New Link from My Account</NuxtLink>
              <NuxtLink v-else :to="{ path: '/sign-in', query: { redirect: '/account' } }" class="btn btn--primary btn--large">Sign In to Send a New Link</NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import StatusIcon from '~/components/account/StatusIcon.vue'

const route = useRoute()
const { verifyEmail, confirmEmailChange, signedIn } = useAuth()
// ?change=1 → confirming a NEW address after an email change
const isChange = route.query.change === '1'

const state = ref('checking')   // checking | done | invalid
const email = ref('')
const errorMessage = ref('')

// Runs in the browser (POST), so email link scanners that only fetch
// the page don't use the token up.
onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) { state.value = 'invalid'; return }
  try {
    const res = isChange ? await confirmEmailChange(token) : await verifyEmail(token)
    email.value = res.email
    state.value = 'done'
  } catch (err) {
    errorMessage.value = err?.status === 409 || /cancelled/.test(err?.message || '') ? err.message : ''
    state.value = 'invalid'
  }
})

useHead({ title: 'Confirm Email | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }, { name: 'referrer', content: 'no-referrer' }] })
</script>
