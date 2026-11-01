<template>
  <div class="account-page">
    <PageTitle title="My Account" />
    <AccountNav />

    <section v-if="user" class="section section--alt account">
      <div class="container account__grid">
        <div v-if="route.query.welcome" class="form-alert form-alert--success account__welcome" role="status">
          <p><strong>Welcome to HorseBrain, {{ user.firstName }}.</strong></p>
          <p>Your account is ready. Your program history and insights will appear here as those features launch.</p>
        </div>
        <div v-else-if="route.query.reset" class="form-alert form-alert--success account__welcome" role="status">
          <p><strong>Your password has been changed.</strong></p>
          <p>You’re signed in here and signed out on every other device. We’ve emailed you a confirmation.</p>
        </div>

        <!-- Email not confirmed yet -->
        <div v-if="!user.emailVerifiedAt" class="form-alert form-alert--info account__welcome account__verify">
          <div>
            <p><strong>Please confirm your email.</strong></p>
            <p>Use the link we emailed to <span class="account__verify-email">{{ user.email }}</span>. Links work for 24 hours; you can send a new one any time.</p>
            <p v-if="resendMsg" class="account__verify-msg" role="status">{{ resendMsg }}</p>
          </div>
          <button type="button" class="btn btn--outline btn--small" :disabled="resending" @click="resend">
            {{ resending ? 'Sending…' : 'Resend Email' }}
          </button>
        </div>

        <!-- Profile -->
        <article class="account-card">
          <header class="account-card__head">
            <h2 class="account-card__title">Profile</h2>
            <span class="account-card__meta">Member since {{ fmtDate(user.createdAt) }}</span>
          </header>

          <dl class="account-details">
            <div><dt>Name</dt><dd>{{ user.firstName }} {{ user.lastName }}</dd></div>
            <div><dt>Email</dt><dd>{{ user.email }} <span class="account__badge" :class="user.emailVerifiedAt ? 'is-ok' : 'is-pending'">{{ user.emailVerifiedAt ? 'Confirmed' : 'Not confirmed' }}</span></dd></div>
            <div><dt>Phone</dt><dd>{{ user.phone ? formatPhone(user.phone) : 'Not added' }}</dd></div>
            <div>
              <dt>Mailing address</dt>
              <dd v-if="user.address">
                {{ user.address.line1 }}<template v-if="user.address.line2">, {{ user.address.line2 }}</template><br>
                {{ user.address.city }}, {{ user.address.region }} {{ user.address.postalCode }}
              </dd>
              <dd v-else>Not added</dd>
            </div>
            <div><dt>Email updates</dt><dd>{{ user.marketingOptIn ? 'Subscribed' : 'Not subscribed' }}</dd></div>
          </dl>
          <p class="account-card__note"><NuxtLink class="text-link" to="/account/settings">Edit your details</NuxtLink></p>
        </article>

        <!-- Agreements -->
        <article class="account-card">
          <header class="account-card__head">
            <h2 class="account-card__title">Agreements</h2>
          </header>
          <dl class="account-details">
            <div>
              <dt>Terms of Use &amp; Privacy</dt>
              <dd>Accepted {{ fmtDate(user.agreements.terms.acceptedAt) }} (version {{ user.agreements.terms.version }})</dd>
            </div>
            <div>
              <dt>Picks disclaimer</dt>
              <dd>Acknowledged {{ fmtDate(user.agreements.disclaimer.acceptedAt) }} (version {{ user.agreements.disclaimer.version }})</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>Confirmed {{ user.agreements.age.minimumAge }}+ on {{ fmtDate(user.agreements.age.confirmedAt) }}</dd>
            </div>
          </dl>
          <p class="account-card__note"><NuxtLink class="text-link" to="/legal">Read the documents</NuxtLink></p>
        </article>

        <!-- Coming soon -->
        <article class="account-card account-card--wide">
          <header class="account-card__head">
            <h2 class="account-card__title">Coming to your account</h2>
          </header>
          <ul class="account-soon" role="list">
            <li><strong>Program history</strong> Every Raceday Program you fill in is saved to your account. <NuxtLink class="text-link" to="/account/programs">See your history</NuxtLink></li>
            <li><strong>Insights</strong> Your return, strike rate by bet type and track, and how you did following HorseBrain picks. <NuxtLink class="text-link" to="/account/insights">See your insights</NuxtLink></li>
            <li><strong>Budget &amp; limits</strong> Daily and monthly limits, and a cool-off option.</li>
          </ul>
        </article>

        <div class="btn-group account__actions">
          <button type="button" class="btn btn--outline" @click="signOut()">Sign Out</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import PageTitle from '~/components/snippets/PageTitle.vue'
import AccountNav from '~/components/account/AccountNav.vue'
import { formatPhone } from '#shared/account-rules.js'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { user, signOut, resendVerification } = useAuth()

const resending = ref(false)
const resendMsg = ref('')
async function resend() {
  resending.value = true
  resendMsg.value = ''
  try {
    await resendVerification()
    resendMsg.value = 'Sent. Check your inbox (and spam folder).'
  } catch (err) {
    resendMsg.value = err.message
  } finally {
    resending.value = false
  }
}

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  : '—'

useHead({ title: 'My Account | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<!-- Styles: assets/scss/components/_account.scss -->
