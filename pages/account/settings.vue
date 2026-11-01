<template>
  <div class="account-settings-page">
    <PageTitle title="Account Settings" :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'My Account', to: '/account' }, { label: 'Settings' }]" />
    <AccountNav />

    <section v-if="user" class="section section--alt account">
      <div class="container account__grid account__grid--narrow">

        <!-- ── Personal details ───────────────────────────── -->
        <article class="account-card" aria-labelledby="set-profile-title">
          <header class="account-card__head">
            <h2 id="set-profile-title" class="account-card__title">Personal details</h2>
          </header>

          <form ref="profileEl" class="form" novalidate @submit.prevent="saveProfile">
            <div v-if="profileState.error" class="form-alert form-alert--error" role="alert"><p>{{ profileState.error }}</p></div>

            <div class="form-row">
              <div class="form-field">
                <label class="form-label" for="set-first">First name</label>
                <input id="set-first" v-model="profile.firstName" class="form-input" autocomplete="given-name" maxlength="50" v-bind="aria(profileErrors, 'firstName', 'set')">
                <p v-if="profileErrors.firstName" id="set-err-firstName" class="form-error">{{ profileErrors.firstName }}</p>
              </div>
              <div class="form-field">
                <label class="form-label" for="set-last">Last name</label>
                <input id="set-last" v-model="profile.lastName" class="form-input" autocomplete="family-name" maxlength="50" v-bind="aria(profileErrors, 'lastName', 'set')">
                <p v-if="profileErrors.lastName" id="set-err-lastName" class="form-error">{{ profileErrors.lastName }}</p>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="set-phone">Phone <span class="form-optional">optional</span></label>
              <input id="set-phone" v-model.trim="profile.phone" class="form-input" type="tel" autocomplete="tel" inputmode="tel" placeholder="(859) 555-0123" v-bind="aria(profileErrors, 'phone', 'set')">
              <p v-if="profileErrors.phone" id="set-err-phone" class="form-error">{{ profileErrors.phone }}</p>
            </div>

            <fieldset class="form-fieldset">
              <legend>Mailing address <span class="form-optional">optional</span></legend>
              <p class="form-fieldset__note">US addresses only for now. Clear every field to remove it.</p>
              <AddressFields :address="profile.address" :errors="profileErrors" id-prefix="set" />
            </fieldset>

            <label class="form-check">
              <input v-model="profile.marketingOptIn" type="checkbox">
              <span class="form-check__text">Email me HorseBrain news and track-record updates</span>
            </label>

            <div class="account-form__actions">
              <button type="submit" class="btn btn--primary" :disabled="profileState.pending || !profileDirty">
                {{ profileState.pending ? 'Saving…' : 'Save Changes' }}
              </button>
              <p v-if="profileState.saved && !profileDirty" class="account-form__saved" role="status">Saved.</p>
            </div>
          </form>
        </article>

        <!-- ── Email ──────────────────────────────────────── -->
        <article class="account-card" aria-labelledby="set-email-title">
          <header class="account-card__head">
            <h2 id="set-email-title" class="account-card__title">Email</h2>
            <span class="account-card__meta">
              {{ user.email }}
              <span class="account__badge" :class="user.emailVerifiedAt ? 'is-ok' : 'is-pending'">{{ user.emailVerifiedAt ? 'Confirmed' : 'Not confirmed' }}</span>
            </span>
          </header>

          <div v-if="user.pendingEmail" class="form-alert form-alert--info account-pending" role="status">
            <p>
              <strong>Waiting for confirmation</strong>
              We sent a link to <b>{{ user.pendingEmail.email }}</b>. Your email changes when you click it.
            </p>
            <button type="button" class="btn btn--outline btn--small" :disabled="emailState.pending" @click="cancelChange">Cancel Change</button>
          </div>

          <p class="account-card__intro">
            To change the email you sign in with, enter the new address and your current password.
            We’ll send a link to the new address; nothing changes until you click it.
          </p>

          <form class="form" novalidate @submit.prevent="startEmailChange">
            <div v-if="emailState.error" class="form-alert form-alert--error" role="alert"><p>{{ emailState.error }}</p></div>
            <div v-if="emailState.sentTo" class="form-alert form-alert--success" role="status">
              <p><strong>Check your inbox.</strong> Click the link we sent to {{ emailState.sentTo }} to finish. We’ve also let your current address know.</p>
            </div>

            <div class="form-field">
              <label class="form-label" for="set-new-email">New email</label>
              <input id="set-new-email" v-model.trim="emailForm.newEmail" class="form-input" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" v-bind="aria(emailErrors, 'newEmail', 'set')">
              <p v-if="emailErrors.newEmail" id="set-err-newEmail" class="form-error">{{ emailErrors.newEmail }}</p>
            </div>
            <div class="form-field">
              <label class="form-label" for="set-email-pw">Current password</label>
              <PasswordInput id="set-email-pw" v-model="emailForm.password" name="current-password" autocomplete="current-password"
                :invalid="!!emailErrors.emailPassword" :describedby="emailErrors.emailPassword ? 'set-err-emailPassword' : ''" />
              <p v-if="emailErrors.emailPassword" id="set-err-emailPassword" class="form-error">{{ emailErrors.emailPassword }}</p>
            </div>

            <div class="account-form__actions">
              <button type="submit" class="btn btn--primary" :disabled="emailState.pending">
                {{ emailState.pending ? 'Sending…' : 'Send Confirmation Link' }}
              </button>
            </div>
          </form>
        </article>

        <!-- ── Password ───────────────────────────────────── -->
        <article class="account-card" aria-labelledby="set-pw-title">
          <header class="account-card__head">
            <h2 id="set-pw-title" class="account-card__title">Password</h2>
          </header>
          <p class="account-card__intro">Changing your password signs you out on every other device.</p>

          <form class="form" novalidate @submit.prevent="savePassword">
            <div v-if="pwState.error" class="form-alert form-alert--error" role="alert"><p>{{ pwState.error }}</p></div>
            <div v-if="pwState.saved" class="form-alert form-alert--success" role="status">
              <p><strong>Password changed.</strong> You’re still signed in here, and we’ve emailed you a confirmation.</p>
            </div>

            <div class="form-field">
              <label class="form-label" for="set-pw-current">Current password</label>
              <PasswordInput id="set-pw-current" v-model="pwForm.current" name="current-password" autocomplete="current-password"
                :invalid="!!pwErrors.currentPassword" :describedby="pwErrors.currentPassword ? 'set-err-currentPassword' : ''" />
              <p v-if="pwErrors.currentPassword" id="set-err-currentPassword" class="form-error">{{ pwErrors.currentPassword }}</p>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label class="form-label" for="set-pw-new">New password</label>
                <PasswordInput id="set-pw-new" v-model="pwForm.next" name="new-password" autocomplete="new-password"
                  :invalid="!!pwErrors.newPassword" :describedby="pwErrors.newPassword ? 'set-err-newPassword set-pw-hint' : 'set-pw-hint'" />
                <p id="set-pw-hint" class="form-hint">At least {{ PASSWORD_MIN }} characters.</p>
                <p v-if="pwErrors.newPassword" id="set-err-newPassword" class="form-error">{{ pwErrors.newPassword }}</p>
              </div>
              <div class="form-field">
                <label class="form-label" for="set-pw-confirm">Confirm new password</label>
                <PasswordInput id="set-pw-confirm" v-model="pwForm.confirm" name="confirm-password" autocomplete="new-password"
                  :invalid="!!pwErrors.confirm" :describedby="pwErrors.confirm ? 'set-err-confirm' : ''" />
                <p v-if="pwErrors.confirm" id="set-err-confirm" class="form-error">{{ pwErrors.confirm }}</p>
              </div>
            </div>

            <div class="account-form__actions">
              <button type="submit" class="btn btn--primary" :disabled="pwState.pending">
                {{ pwState.pending ? 'Saving…' : 'Change Password' }}
              </button>
              <NuxtLink class="text-link" to="/forgot-password">Forgot your current password?</NuxtLink>
            </div>
          </form>
        </article>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import AccountNav from '~/components/account/AccountNav.vue'
import AddressFields from '~/components/account/AddressFields.vue'
import PasswordInput from '~/components/account/PasswordInput.vue'
import { validateProfile, validateEmail, validatePassword, profileFormFrom, PASSWORD_MIN } from '#shared/account-rules.js'

definePageMeta({ middleware: 'auth' })

const { user, updateProfile, changePassword, requestEmailChange, cancelEmailChange } = useAuth()

// aria-invalid + aria-describedby for a field with an error
const aria = (errs, key, prefix) => errs[key]
  ? { 'aria-invalid': 'true', 'aria-describedby': `${prefix}-err-${key.replace(/\./g, '-')}` }
  : {}

const focusFirstInvalid = async (root) => {
  await nextTick()
  root?.querySelector('[aria-invalid="true"]')?.focus()
}

// ---- Personal details -------------------------------------------------
const profile = reactive(profileFormFrom(user.value))
const profileErrors = ref({})
const profileState = reactive({ pending: false, saved: false, error: '' })
const profileEl = ref(null)

// Compare cleaned values, so retyping the same thing doesn't count as a change
const snapshot = (v) => JSON.stringify(validateProfile(v).value)
const savedSnapshot = ref(snapshot(profile))
const profileDirty = computed(() => snapshot(profile) !== savedSnapshot.value)

async function saveProfile() {
  profileState.error = ''
  profileState.saved = false
  const { errors } = validateProfile(profile)
  profileErrors.value = errors
  if (Object.keys(errors).length) return focusFirstInvalid(profileEl.value)

  profileState.pending = true
  try {
    const res = await updateProfile(JSON.parse(JSON.stringify(profile)))
    Object.assign(profile, profileFormFrom(res.user))
    savedSnapshot.value = snapshot(profile)
    profileState.saved = true
  } catch (err) {
    profileErrors.value = err.fieldErrors || {}
    profileState.error = Object.keys(profileErrors.value).length ? '' : err.message
    focusFirstInvalid(profileEl.value)
  } finally {
    profileState.pending = false
  }
}

// ---- Email -------------------------------------------------------------
const emailForm = reactive({ newEmail: '', password: '' })
const emailErrors = ref({})
const emailState = reactive({ pending: false, sentTo: '', error: '' })

async function startEmailChange() {
  emailState.error = ''
  emailState.sentTo = ''
  const errs = {}
  const e = validateEmail(emailForm.newEmail)
  if (e) errs.newEmail = e
  else if (emailForm.newEmail.toLowerCase() === user.value.email) errs.newEmail = 'That’s already your email address.'
  if (!emailForm.password) errs.emailPassword = 'Enter your current password.'
  emailErrors.value = errs
  if (Object.keys(errs).length) return

  emailState.pending = true
  try {
    await requestEmailChange(emailForm.newEmail, emailForm.password)
    emailState.sentTo = emailForm.newEmail.toLowerCase()
    emailForm.newEmail = ''
    emailForm.password = ''
  } catch (err) {
    emailErrors.value = err.fieldErrors || {}
    if (!Object.keys(emailErrors.value).length) emailState.error = err.message
  } finally {
    emailForm.password = emailErrors.value.emailPassword ? '' : emailForm.password
    emailState.pending = false
  }
}

async function cancelChange() {
  emailState.pending = true
  emailState.sentTo = ''
  try { await cancelEmailChange() } catch (err) { emailState.error = err.message } finally { emailState.pending = false }
}

// ---- Password ----------------------------------------------------------
const pwForm = reactive({ current: '', next: '', confirm: '' })
const pwErrors = ref({})
const pwState = reactive({ pending: false, saved: false, error: '' })

async function savePassword() {
  pwState.error = ''
  pwState.saved = false
  const errs = {}
  if (!pwForm.current) errs.currentPassword = 'Enter your current password.'
  const p = validatePassword(pwForm.next, user.value.email)
  if (p) errs.newPassword = p
  else if (pwForm.next !== pwForm.confirm) errs.confirm = 'The two passwords don’t match.'
  pwErrors.value = errs
  if (Object.keys(errs).length) return

  pwState.pending = true
  try {
    await changePassword(pwForm.current, pwForm.next)
    Object.assign(pwForm, { current: '', next: '', confirm: '' })
    pwState.saved = true
  } catch (err) {
    pwErrors.value = err.fieldErrors || {}
    if (!Object.keys(pwErrors.value).length) pwState.error = err.message
    pwForm.current = ''
  } finally {
    pwState.pending = false
  }
}

useHead({ title: 'Account Settings | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
