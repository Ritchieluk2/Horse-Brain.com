<template>
  <div class="sign-in-page">
    <PageTitle title="Sign In" />

    <section class="auth">
      <div class="container auth__grid">
        <div class="auth__card">
          <header class="auth__head">
            <span class="auth__eyebrow">Welcome back</span>
            <p>Pick up where you left off with your programs and bet history.</p>
          </header>

          <form class="form" novalidate @submit.prevent="submit">
            <div v-if="notice && !formError" class="form-alert form-alert--info" role="status">
              <p>{{ notice }}</p>
            </div>
            <div v-if="formError" ref="alertEl" class="form-alert form-alert--error" role="alert" tabindex="-1">
              <p>{{ formError }}</p>
            </div>

            <div class="form-field">
              <label class="form-label" for="si-email">Email</label>
              <input
                id="si-email"
                ref="emailEl"
                v-model.trim="email"
                class="form-input"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                autocapitalize="off"
                spellcheck="false"
                :aria-invalid="errors.email ? 'true' : undefined"
                :aria-describedby="errors.email ? 'si-email-err' : undefined"
                required
              >
              <p v-if="errors.email" id="si-email-err" class="form-error">{{ errors.email }}</p>
            </div>

            <div class="form-field">
              <label class="form-label" for="si-password">Password</label>
              <PasswordInput
                id="si-password"
                v-model="password"
                autocomplete="current-password"
                :invalid="!!errors.password"
                :describedby="errors.password ? 'si-password-err' : ''"
              />
              <p v-if="errors.password" id="si-password-err" class="form-error">{{ errors.password }}</p>
              <p class="form-hint">
                <NuxtLink class="text-link" :to="{ path: '/forgot-password', query: email ? { email } : {} }">Forgot your password?</NuxtLink>
              </p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn--primary btn--large" :disabled="pending">
                {{ pending ? 'Signing in…' : 'Sign In' }}
              </button>
              <p class="form-switch">
                New to HorseBrain?
                <NuxtLink :to="{ path: '/sign-up', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">
                  Create a free account
                </NuxtLink>
              </p>
            </div>
          </form>
        </div>

        <AuthAside />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import AuthAside from '~/components/account/AuthAside.vue'
import PasswordInput from '~/components/account/PasswordInput.vue'
import { validateEmail } from '#shared/account-rules.js'
import { safeRedirect } from '~/composables/useAuth'

definePageMeta({ middleware: 'guest' })

const route = useRoute()
const { signIn, available } = useAuth()

const email = ref('')
const password = ref('')
const errors = reactive({ email: '', password: '' })
const formError = ref('')
const pending = ref(false)
const alertEl = ref(null)
const emailEl = ref(null)

const notice = computed(() => {
  if (!available.value) return 'Accounts aren’t available on this preview of the site yet.'
  if (route.query.redirect) return 'Please sign in to continue.'
  return ''
})

onMounted(() => emailEl.value?.focus())

async function submit() {
  formError.value = ''
  errors.email = validateEmail(email.value)
  errors.password = password.value ? '' : 'Enter your password.'
  if (errors.email || errors.password) return

  pending.value = true
  try {
    await signIn(email.value, password.value)
    await navigateTo(safeRedirect(route.query.redirect))
  } catch (err) {
    formError.value = err.message
    password.value = ''
    await nextTick()
    alertEl.value?.focus()
  } finally {
    pending.value = false
  }
}

useHead({
  title: 'Sign In | HorseBrain',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>
