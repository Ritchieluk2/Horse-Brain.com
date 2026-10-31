<template>
  <div class="contact-page">
    <!-- 1. Page Title -->
    <PageTitle 
      title="Contact Us"
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Contact Us' }
      ]"
    />

    <!-- 2. Newsletter Signup (Primary Action) -->
    <section class="newsletter-cta newsletter-cta--hero">
      <div class="container">
        <div class="newsletter-cta__content">
          <h2 class="newsletter-cta__title">Stay Ahead of the Post</h2>
          <p class="newsletter-cta__text">
            Join our newsletter to receive our top algorithmic picks, track record updates, and exclusive insights directly in your inbox every morning before first post.
          </p>
          <form class="newsletter-cta__form" @submit.prevent="handleSubscribe">
            <input 
              type="email" 
              v-model="email"
              placeholder="Enter your email address" 
              class="newsletter-cta__input" 
              required 
            />
            <button type="submit" class="btn btn--primary btn--large">
              Subscribe to Picks
            </button>
          </form>
          <p class="newsletter-cta__privacy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            No spam. Unsubscribe anytime. Just data.
          </p>
        </div>
      </div>
    </section>

    <!-- 3. Contact Info (Alt Styling: Dark Background) -->
    <section class="contact-info-section">
      <div class="container">
        <div class="contact-info__header">
          <h2 class="section-title">Get in Touch</h2>
          <p class="section-subtitle">
            Have questions about our methodology, data sources, or partnership opportunities? We'd love to hear from you.
          </p>
        </div>

        <div class="contact-info__grid">
          <!-- Column 1: Email -->
          <article class="contact-card">
            <span class="contact-card__frame" aria-hidden="true"></span>
            <i class="contact-card__corner contact-card__corner--tl" aria-hidden="true"></i>
            <i class="contact-card__corner contact-card__corner--br" aria-hidden="true"></i>
            
            <div class="contact-card__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            
            <h3 class="contact-card__title">Email Us</h3>
            <p class="contact-card__text">
              For general inquiries, support, or questions about our machine learning models, reach out to our team.
            </p>
            
            <a href="mailto:info@horse-brain.com" class="contact-card__link">
              info@horse-brain.com
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </article>

          <!-- Column 2: GitHub -->
          <article class="contact-card">
            <span class="contact-card__frame" aria-hidden="true"></span>
            <i class="contact-card__corner contact-card__corner--tl" aria-hidden="true"></i>
            <i class="contact-card__corner contact-card__corner--br" aria-hidden="true"></i>
            
            <div class="contact-card__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            
            <h3 class="contact-card__title">Track Development</h3>
            <p class="contact-card__text">
              HorseBrain is built in the open. Follow our repository to see our progress, review our architecture, or contribute to the project.
            </p>
            
            <a href="https://github.com/OFSkean/horsebrain" target="_blank" rel="noopener noreferrer" class="contact-card__link">
              View on GitHub
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'

const email = ref('')

const handleSubscribe = () => {
  // TODO: Connect to your newsletter API (e.g., Mailchimp, ConvertKit)
  alert(`Thank you for subscribing with: ${email.value}! (This is a placeholder action)`)
  email.value = ''
}

useHead({
  title: 'Contact Us | HorseBrain',
  meta: [
    { 
      name: 'description', 
      content: 'Contact the HorseBrain team. Subscribe to our newsletter for daily algorithmic horse racing picks or reach out with questions.'
    }
  ]
})
</script>

<style lang="scss" scoped>
// Newsletter band → components/_cta.scss (.newsletter-cta--hero)
.contact-page { background-color: var(--bg-page); }

// ---- Contact cards on shadow grey ------------------------------------------
.contact-info-section {
  padding-block: var(--section-pad);
  background-color: var(--bg-dark);
  color: var(--text-on-dark);
}

.contact-info__header {
  margin-bottom: var(--space-8);
  text-align: center;

  @include up(md) { margin-bottom: var(--space-9); }

  .section-title { color: var(--color-white); }
  .section-subtitle { margin-bottom: 0; color: var(--text-on-dark-muted); }
}

.contact-info__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-7);
  max-width: 900px;
  margin: 0 auto;

  @include up(md) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.contact-card {
  position: relative;
  padding: var(--space-8) var(--space-6);
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: var(--radius-cut);
  background-color: rgb(255 255 255 / 0.03);
  text-align: center;
  transition: transform var(--dur) ease, background-color var(--dur) ease;
  @include ornament-frame(20px, var(--color-brass), 0.6);

  @include up(md) { padding: var(--space-8) var(--space-7); }

  &__frame { border-color: rgb(199 169 107 / 0.2); }

  @include hover {
    transform: translateY(-4px);
    background-color: rgb(255 255 255 / 0.06);
    .contact-card__frame { border-color: rgb(199 169 107 / 0.5); }
    .contact-card__corner { opacity: 1; }
    .contact-card__icon { background: rgb(199 169 107 / 0.2); transform: scale(1.05); }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: 0 auto var(--space-6);
    border: 1px solid rgb(199 169 107 / 0.3);
    border-radius: 50%;
    background: rgb(199 169 107 / 0.1);
    color: var(--color-brass);
    transition: background var(--dur) ease, transform var(--dur) ease;
  }

  &__title { margin-bottom: var(--space-4); font-size: var(--fs-xl); color: var(--color-white); }

  &__text { margin: 0 auto var(--space-7); color: var(--text-on-dark-muted); }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 44px;
    @include heading-font;
    font-size: var(--fs-md);
    color: var(--color-baby-blue);
    overflow-wrap: anywhere;
    transition: color var(--dur-fast) ease, gap var(--dur-fast) ease;

    @include hover { color: var(--color-white); gap: var(--space-3); }
  }
}
</style>