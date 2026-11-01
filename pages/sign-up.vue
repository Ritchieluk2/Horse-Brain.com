<template>
  <div class="sign-up-page">
    <PageTitle title="Create Account" />

    <section class="auth auth--wide">
      <div class="container auth__grid">
        <div class="auth__card">
          <header class="auth__head">
            <span class="auth__eyebrow">Free account</span>
            <p>It takes about a minute. Fields marked optional can be added later.</p>
          </header>

          <form ref="formEl" class="form" novalidate @submit.prevent="submit">
            <div v-if="!available" class="form-alert form-alert--info" role="status">
              <p>Accounts aren’t available on this preview of the site yet.</p>
            </div>
            <div v-if="formError" ref="alertEl" class="form-alert form-alert--error" role="alert" tabindex="-1">
              <p><strong>{{ formError }}</strong></p>
              <p v-if="errorCount > 1">{{ errorCount }} fields need attention.</p>
            </div>

            <!-- ── About you ─────────────────────────────── -->
            <fieldset class="form-fieldset">
              <legend>About you</legend>

              <div class="form-row">
                <div class="form-field">
                  <label class="form-label" for="su-first">First name</label>
                  <input id="su-first" v-model="form.firstName" class="form-input" name="firstName"
                    autocomplete="given-name" maxlength="50" v-bind="aria('firstName')" required>
                  <p v-if="errors.firstName" :id="errId('firstName')" class="form-error">{{ errors.firstName }}</p>
                </div>
                <div class="form-field">
                  <label class="form-label" for="su-last">Last name</label>
                  <input id="su-last" v-model="form.lastName" class="form-input" name="lastName"
                    autocomplete="family-name" maxlength="50" v-bind="aria('lastName')" required>
                  <p v-if="errors.lastName" :id="errId('lastName')" class="form-error">{{ errors.lastName }}</p>
                </div>
              </div>

              <div class="form-field">
                <label class="form-label" for="su-email">Email</label>
                <input id="su-email" v-model.trim="form.email" class="form-input" type="email" name="email"
                  autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"
                  v-bind="aria('email')" required>
                <p v-if="errors.email" :id="errId('email')" class="form-error">
                  {{ errors.email }}
                  <NuxtLink v-if="emailTaken" class="text-link" to="/sign-in">Go to sign in</NuxtLink>
                </p>
              </div>

              <div class="form-field">
                <label class="form-label" for="su-password">Password</label>
                <PasswordInput id="su-password" v-model="form.password" autocomplete="new-password"
                  :invalid="!!errors.password"
                  :describedby="errors.password ? `${errId('password')} su-password-hint` : 'su-password-hint'" />
                <p id="su-password-hint" class="form-hint">At least {{ PASSWORD_MIN }} characters. A short phrase is easier to remember than a jumble.</p>
                <p v-if="errors.password" :id="errId('password')" class="form-error">{{ errors.password }}</p>
              </div>

              <div class="form-field">
                <label class="form-label" for="su-phone">Phone <span class="form-optional">optional</span></label>
                <input id="su-phone" v-model.trim="form.phone" class="form-input" type="tel" name="phone"
                  autocomplete="tel" inputmode="tel" placeholder="(859) 555-0123" v-bind="aria('phone')">
                <p v-if="errors.phone" :id="errId('phone')" class="form-error">{{ errors.phone }}</p>
              </div>
            </fieldset>

            <!-- ── Address ───────────────────────────────── -->
            <fieldset class="form-fieldset">
              <legend>Mailing address <span class="form-optional">optional</span></legend>
              <p class="form-fieldset__note">US addresses only for now. If you start an address, please complete it.</p>

              <AddressFields :address="form.address" :errors="errors" id-prefix="su" />
            </fieldset>

            <!-- ── Agreements ────────────────────────────── -->
            <fieldset class="form-fieldset">
              <legend>Agreements</legend>

              <div class="form-checks">
                <label class="form-check" :class="{ 'is-invalid': errors['agreements.age'] }">
                  <input id="su-age" v-model="form.agreements.age" type="checkbox" name="age"
                    v-bind="aria('agreements.age')">
                  <span class="form-check__text">I am {{ MINIMUM_AGE }} years of age or older.</span>
                </label>
                <p v-if="errors['agreements.age']" :id="errId('agreements.age')" class="form-error">{{ errors['agreements.age'] }}</p>

                <label class="form-check" :class="{ 'is-invalid': errors['agreements.terms'] }">
                  <input id="su-terms" v-model="form.agreements.terms" type="checkbox" name="terms"
                    v-bind="aria('agreements.terms')">
                  <span class="form-check__text">
                    I agree to the <NuxtLink to="/legal#terms" target="_blank">Terms of Use</NuxtLink>
                    and <NuxtLink to="/legal#privacy" target="_blank">Privacy Policy</NuxtLink>.
                  </span>
                </label>
                <p v-if="errors['agreements.terms']" :id="errId('agreements.terms')" class="form-error">{{ errors['agreements.terms'] }}</p>

                <label class="form-check" :class="{ 'is-invalid': errors['agreements.disclaimer'] }">
                  <input id="su-disclaimer" v-model="form.agreements.disclaimer" type="checkbox" name="disclaimer"
                    v-bind="aria('agreements.disclaimer')">
                  <span class="form-check__text">
                    I understand HorseBrain picks are for information and entertainment only, are not
                    guaranteed, and that past performance does not predict future results.
                    (<NuxtLink to="/legal#disclaimer" target="_blank">Read the disclaimer</NuxtLink>)
                  </span>
                </label>
                <p v-if="errors['agreements.disclaimer']" :id="errId('agreements.disclaimer')" class="form-error">{{ errors['agreements.disclaimer'] }}</p>

                <label class="form-check">
                  <input v-model="form.marketingOptIn" type="checkbox" name="marketingOptIn">
                  <span class="form-check__text">
                    Email me HorseBrain news and track-record updates <span class="form-optional">optional</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div class="form-actions">
              <button type="submit" class="btn btn--primary btn--large" :disabled="pending">
                {{ pending ? 'Creating account…' : 'Create Account' }}
              </button>
              <p class="form-switch">
                Already have an account?
                <NuxtLink :to="{ path: '/sign-in', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">Sign in</NuxtLink>
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
import { ref, reactive, computed, nextTick } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import AuthAside from '~/components/account/AuthAside.vue'
import PasswordInput from '~/components/account/PasswordInput.vue'
import AddressFields from '~/components/account/AddressFields.vue'
import { validateSignUp, MINIMUM_AGE, PASSWORD_MIN } from '#shared/account-rules.js'
import { safeRedirect } from '~/composables/useAuth'

definePageMeta({ middleware: 'guest' })

const route = useRoute()
const { signUp, available } = useAuth()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  address: { line1: '', line2: '', city: '', region: '', postalCode: '' },
  agreements: { terms: false, disclaimer: false, age: false },
  marketingOptIn: false
})

const errors = ref({})
const formError = ref('')
const emailTaken = ref(false)
const pending = ref(false)
const formEl = ref(null)
const alertEl = ref(null)

const errorCount = computed(() => Object.keys(errors.value).length)

// Field key ('address.city') → DOM-safe id for aria-describedby
const errId = (key) => `su-err-${key.replace(/\./g, '-')}`
const aria = (key) => errors.value[key]
  ? { 'aria-invalid': 'true', 'aria-describedby': errId(key) }
  : {}

async function showErrors(fieldErrors, message) {
  errors.value = fieldErrors
  formError.value = message
  await nextTick()
  // Focus the first invalid control so keyboard and screen-reader users land on it
  const first = formEl.value?.querySelector('[aria-invalid="true"]')
  if (first) first.focus()
  else alertEl.value?.focus()
}

async function submit() {
  emailTaken.value = false
  const { ok, errors: clientErrors } = validateSignUp(form)
  if (!ok) return showErrors(clientErrors, 'Please fix the highlighted fields.')

  errors.value = {}
  formError.value = ''
  pending.value = true
  try {
    await signUp(JSON.parse(JSON.stringify(form)))
    await navigateTo(safeRedirect(route.query.redirect, '/account?welcome=1'))
  } catch (err) {
    emailTaken.value = err.status === 409
    await showErrors(err.fieldErrors, err.message)
  } finally {
    pending.value = false
  }
}

useHead({
  title: 'Create Account | HorseBrain',
  meta: [{ name: 'description', content: 'Create a free HorseBrain account to keep your raceday programs and bet history in one place.' }]
})
</script>
