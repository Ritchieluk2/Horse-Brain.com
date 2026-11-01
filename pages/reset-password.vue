<template>
  <div class="reset-password-page">
    <PageTitle title="Choose a New Password" :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'Sign In', to: '/sign-in' }, { label: 'New Password' }]" />

    <section class="auth auth--single">
      <div class="container auth__grid">
        <div class="auth__card">
          <p v-if="state === 'checking'" class="auth__text" role="status">Checking your link…</p>

          <!-- Expired / used / tampered -->
          <div v-else-if="state === 'invalid'" role="alert">
            <StatusIcon kind="error" />
            <h2 class="auth__title">This link has expired</h2>
            <p class="auth__text">
              Reset links work for 1 hour and only once. If you asked more than once, only the newest
              email’s link works.
            </p>
            <div class="form-actions">
              <NuxtLink to="/forgot-password" class="btn btn--primary btn--large">Send a New Link</NuxtLink>
            </div>
          </div>

          <!-- New password -->
          <form v-else class="form" novalidate @submit.prevent="submit">
            <header class="auth__head">
              <span class="auth__eyebrow">Almost done</span>
              <p>Choose a new password. You’ll be signed in here and signed out everywhere else.</p>
            </header>

            <div v-if="formError" ref="alertEl" class="form-alert form-alert--error" role="alert" tabindex="-1">
              <p>{{ formError }}</p>
              <p v-if="linkDead"><NuxtLink class="text-link" to="/forgot-password">Send a new link</NuxtLink></p>
            </div>

            <div class="form-field">
              <label class="form-label" for="rp-password">New password</label>
              <PasswordInput
                id="rp-password"
                v-model="password"
                autocomplete="new-password"
                :invalid="!!errors.password"
                :describedby="errors.password ? 'rp-password-err rp-password-hint' : 'rp-password-hint'"
              />
              <p id="rp-password-hint" class="form-hint">At least {{ PASSWORD_MIN }} characters.</p>
              <p v-if="errors.password" id="rp-password-err" class="form-error">{{ errors.password }}</p>
            </div>

            <div class="form-field">
              <label class="form-label" for="rp-confirm">Confirm new password</label>
              <PasswordInput
                id="rp-confirm"
                v-model="confirm"
                name="confirm"
                autocomplete="new-password"
                :invalid="!!errors.confirm"
                :describedby="errors.confirm ? 'rp-confirm-err' : ''"
              />
              <p v-if="errors.confirm" id="rp-confirm-err" class="form-error">{{ errors.confirm }}</p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn--primary btn--large" :disabled="pending">
                {{ pending ? 'Saving…' : 'Save New Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import PasswordInput from '~/components/account/PasswordInput.vue'
import StatusIcon from '~/components/account/StatusIcon.vue'
import { PASSWORD_MIN, validatePassword } from '#shared/account-rules.js'

const route = useRoute()
const { checkResetToken, resetPassword } = useAuth()
const token = typeof route.query.token === 'string' ? route.query.token : ''

const state = ref('checking')   // checking | invalid | ready
const password = ref('')
const confirm = ref('')
const errors = reactive({ password: '', confirm: '' })
const formError = ref('')
const linkDead = ref(false)
const pending = ref(false)
const alertEl = ref(null)

// Checked in the browser so link-preview bots never see a valid form
onMounted(async () => {
  state.value = token && await checkResetToken(token) ? 'ready' : 'invalid'
})

async function submit() {
  formError.value = ''
  linkDead.value = false
  errors.password = validatePassword(password.value)
  errors.confirm = !errors.password && password.value !== confirm.value ? 'The two passwords don’t match.' : ''
  if (errors.password || errors.confirm) return

  pending.value = true
  try {
    await resetPassword(token, password.value)
    await navigateTo('/account?reset=1')
  } catch (err) {
    if (err.fieldErrors?.password) {
      errors.password = err.fieldErrors.password
    } else {
      formError.value = err.message
      linkDead.value = err.status === 400
      await nextTick()
      alertEl.value?.focus()
    }
  } finally {
    pending.value = false
  }
}

useHead({ title: 'Choose a New Password | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }, { name: 'referrer', content: 'no-referrer' }] })
</script>
