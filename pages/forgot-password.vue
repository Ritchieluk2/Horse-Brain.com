<template>
  <div class="forgot-password-page">
    <PageTitle title="Reset Password" :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'Sign In', to: '/sign-in' }, { label: 'Reset Password' }]" />

    <section class="auth auth--single">
      <div class="container auth__grid">
        <div class="auth__card">
          <!-- Sent -->
          <div v-if="sentTo" role="status">
            <StatusIcon />
            <h2 class="auth__title">Check your email</h2>
            <p class="auth__text">
              If there’s a HorseBrain account for <strong>{{ sentTo }}</strong>, we’ve sent a link to
              choose a new password. It works for 1 hour.
            </p>
            <p class="auth__text">Nothing after a few minutes? Check your spam or promotions folder, or try again.</p>
            <div class="form-actions">
              <button type="button" class="btn btn--outline" :disabled="cooldown > 0 || pending" @click="send">
                {{ cooldown > 0 ? `Send again in ${cooldown}s` : (pending ? 'Sending…' : 'Send again') }}
              </button>
              <p class="form-switch"><NuxtLink to="/sign-in">Back to sign in</NuxtLink></p>
            </div>
          </div>

          <!-- Ask for the email -->
          <form v-else class="form" novalidate @submit.prevent="send">
            <header class="auth__head">
              <span class="auth__eyebrow">Forgot your password?</span>
              <p>Enter the email you signed up with and we’ll send you a link to choose a new one.</p>
            </header>

            <div v-if="formError" class="form-alert form-alert--error" role="alert"><p>{{ formError }}</p></div>

            <div class="form-field">
              <label class="form-label" for="fp-email">Email</label>
              <input
                id="fp-email"
                v-model.trim="email"
                class="form-input"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                autocapitalize="off"
                spellcheck="false"
                :aria-invalid="emailError ? 'true' : undefined"
                :aria-describedby="emailError ? 'fp-email-err' : undefined"
                required
              >
              <p v-if="emailError" id="fp-email-err" class="form-error">{{ emailError }}</p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn--primary btn--large" :disabled="pending">
                {{ pending ? 'Sending…' : 'Send Reset Link' }}
              </button>
              <p class="form-switch">Remembered it? <NuxtLink to="/sign-in">Sign in</NuxtLink></p>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import StatusIcon from '~/components/account/StatusIcon.vue'
import { validateEmail } from '#shared/account-rules.js'

const route = useRoute()
const { requestPasswordReset } = useAuth()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const emailError = ref('')
const formError = ref('')
const pending = ref(false)
const sentTo = ref('')
const cooldown = ref(0)
let timer = null

function startCooldown() {
  cooldown.value = 60
  clearInterval(timer)
  timer = setInterval(() => { if (--cooldown.value <= 0) clearInterval(timer) }, 1000)
}
onBeforeUnmount(() => clearInterval(timer))

async function send() {
  formError.value = ''
  emailError.value = validateEmail(email.value)
  if (emailError.value) return

  pending.value = true
  try {
    await requestPasswordReset(email.value)
    sentTo.value = email.value.toLowerCase()
    startCooldown()
  } catch (err) {
    if (err.fieldErrors?.email) emailError.value = err.fieldErrors.email
    else formError.value = err.message
  } finally {
    pending.value = false
  }
}

useHead({ title: 'Reset Password | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
