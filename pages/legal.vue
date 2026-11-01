<template>
  <div class="legal-page">
    <PageTitle title="Terms, Privacy & Disclaimer" :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'Legal' }]" />

    <section class="section">
      <div class="container container--narrow legal">
        <div class="form-alert form-alert--info">
          <p><strong>Draft for the preview site.</strong></p>
          <p>These documents are placeholders written in plain language and have not been reviewed by a lawyer. They will be replaced before launch.</p>
        </div>

        <nav class="legal__toc" aria-label="On this page">
          <a href="#terms">Terms of Use</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#disclaimer">Disclaimer</a>
          <a href="#responsible-gambling">Responsible gambling</a>
        </nav>

        <article id="terms" class="legal__doc">
          <h2>Terms of Use</h2>
          <p class="legal__version">Version {{ LEGAL_VERSIONS.terms }}</p>
          <p>HorseBrain publishes horse-racing analysis and picks produced by statistical and machine-learning models. By creating an account you agree to use the site for your own personal, lawful use, to keep your password private, and to give accurate details about yourself.</p>
          <p>You must be {{ MINIMUM_AGE }} or older to hold an account, and you are responsible for following the wagering laws where you live. HorseBrain does not accept wagers or hold funds.</p>
          <p>We may change or withdraw features, and we may suspend accounts that misuse the service. You can close your account at any time by emailing <a class="text-link" href="mailto:info@horse-brain.com">info@horse-brain.com</a>.</p>
        </article>

        <article id="privacy" class="legal__doc">
          <h2>Privacy Policy</h2>
          <p class="legal__version">Version {{ LEGAL_VERSIONS.terms }}</p>
          <p><strong>What we collect:</strong> your name, email address, and, if you choose to add them, phone number and mailing address; the dates you accepted these documents; and the programs, bets and notes you save.</p>
          <p><strong>Why:</strong> to run your account, show you your own history and statistics, and contact you about your account. We only send news if you opt in.</p>
          <p><strong>What we don’t do:</strong> we don’t sell your personal information. Passwords are stored only as salted hashes, never in readable form.</p>
          <p>You can ask for a copy of your data, or for it to be deleted, by emailing <a class="text-link" href="mailto:info@horse-brain.com">info@horse-brain.com</a>.</p>
        </article>

        <article id="disclaimer" class="legal__doc">
          <h2>Disclaimer</h2>
          <p class="legal__version">Version {{ LEGAL_VERSIONS.disclaimer }}</p>
          <p>HorseBrain picks, probabilities and statistics are for information and entertainment only. They are not financial advice and are not a guarantee of any result. Horse racing is unpredictable and models can be wrong.</p>
          <p><strong>Past performance is not indicative of future results.</strong> We publish our full track record, losses included, so you can judge it for yourself. Any decision to wager is yours alone.</p>
        </article>

        <article id="responsible-gambling" class="legal__doc">
          <h2>Responsible gambling</h2>
          <p class="legal__version">Version {{ LEGAL_VERSIONS.responsibleGambling }}</p>
          <p>Set a budget before the first race and stick to it. Never chase losses or bet money you need for other things. HorseBrain’s simulated betting lets you follow picks without spending anything.</p>
          <p>If gambling stops being fun, help is free and confidential: call the National Problem Gambling Helpline at <a class="text-link" href="tel:18005224700">1-800-522-4700</a> or visit <a class="text-link" href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer">ncpgambling.org</a>.</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from '~/components/snippets/PageTitle.vue'
import { LEGAL_VERSIONS, MINIMUM_AGE } from '#shared/account-rules.js'

useHead({ title: 'Terms, Privacy & Disclaimer | HorseBrain' })
</script>

<style lang="scss" scoped>
/* NEW(claude): plain long-form legal layout */
.legal { display: grid; gap: var(--space-8); }

.legal__toc {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-color);

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-weight: 600;
    color: var(--text-link);
  }
}

.legal__doc {
  scroll-margin-top: calc(var(--header-h) + var(--space-5));

  h2 { margin-bottom: var(--space-1); font-size: var(--fs-2xl); }
  p { margin-bottom: var(--space-4); }
}

.legal__version {
  @include label-caps;
  color: var(--text-secondary);
}
</style>
