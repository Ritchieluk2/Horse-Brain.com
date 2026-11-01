<template>
  <div class="track-record-page">
    <!-- Page Title -->
    <PageTitle 
      title="Our Track Record"
      :breadcrumbs="breadcrumbs"
    />

    <!-- Key Stats Section -->
    <section class="key-stats">
      <div class="container">
        <div class="section-header" v-reveal>
          <h2 class="section-title">Verified Performance, By the Numbers</h2>
          <p class="section-subtitle">
            Every figure below is audited, timestamped, and updated after each race day. 
            We operate like a financial institution — our results speak for themselves.
          </p>
        </div>

        <div class="stats-grid" v-reveal.stagger ref="statsGrid">
          <div
            v-for="stat in trackRecordStats"
            :key="stat.label"
            class="stat-card"
            :class="{ 'is-settled': stat.isSettled }"
          >
            <span class="stat-card__frame" aria-hidden="true"></span>
            <i class="stat-card__corner stat-card__corner--tl" aria-hidden="true"></i>
            <i class="stat-card__corner stat-card__corner--br" aria-hidden="true"></i>

            <div class="stat-card__value">
              <template v-for="(char, cIndex) in stat.chars" :key="cIndex">
                <span v-if="char.type === 'static'" class="char-static">{{ char.value }}</span>
                <span v-else class="char-roll" :style="{ transitionDelay: `${cIndex * 0.08}s` }">
                  <span 
                    class="char-roll__column" 
                    :class="{ 'is-rolled': stat.isSettled }"
                    :style="{ '--roll-dist': char.target }"
                  >
                    <span v-for="n in (char.target + 1)" :key="n - 1">{{ n - 1 }}</span>
                  </span>
                </span>
              </template>
            </div>

            <span class="stat-card__label">{{ stat.label }}</span>
            <p class="stat-card__context" v-if="stat.context">{{ stat.context }}</p>
          </div>
        </div>

        <p class="key-stats__footnote">
          <em>
            Figures reflect performance from January 2024 through the present. 
            All picks are published before post time and results are recorded automatically.
          </em>
        </p>
      </div>
    </section>

    <!-- About Our Process -->
    <section class="process-section">
      <div class="container">
        <div class="process-grid">
          <div class="process-content" v-reveal>
            <span class="process-tag">Our Methodology</span>
            <h2 class="section-title">About Our Process</h2>
            <p class="process-lead">
              HorseBrain is built on the principle that rigorous, transparent analysis 
              outperforms gut instinct and tipster hype. Our process is modeled after 
              the quantitative research practices of institutional finance.
            </p>

            <div class="process-steps" v-reveal.stagger>
              <div class="process-step">
                <div class="process-step__number">01</div>
                <div class="process-step__content">
                  <h3>Data Ingestion</h3>
                  <p>
                    We collect structured data from Equibase covering every race, 
                    horse, jockey, and trainer across all major North American tracks. 
                    This includes historical performances, workout times, pedigree data, 
                    and real-time odds movements.
                  </p>
                </div>
              </div>

              <div class="process-step">
                <div class="process-step__number">02</div>
                <div class="process-step__content">
                  <h3>Feature Engineering</h3>
                  <p>
                    Raw data is transformed into predictive features: jockey win rates 
                    at specific tracks, horse form over distance classes, track condition 
                    preferences, pace scenarios, and class movements. Each feature is 
                    validated against historical outcomes.
                  </p>
                </div>
              </div>

              <div class="process-step">
                <div class="process-step__number">03</div>
                <div class="process-step__content">
                  <h3>Model Training</h3>
                  <p>
                    Our ensemble models are trained on historical track data to draw 
                    statistical inferences about finishing probabilities. Models are 
                    continuously retrained and back-tested to prevent overfitting and 
                    ensure robustness across changing track conditions.
                  </p>
                </div>
              </div>

              <div class="process-step">
                <div class="process-step__number">04</div>
                <div class="process-step__content">
                  <h3>Publication & Audit</h3>
                  <p>
                    Every pick is timestamped and published before post time. Results 
                    are recorded automatically and displayed transparently. We never 
                    revise past picks or hide losses — our track record is our 
                    reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside class="process-sidebar">
            <div class="process-sidebar__card" v-reveal>
              <span class="process-sidebar__label">Model Accuracy by Confidence</span>
              <div class="confidence-breakdown">
                <div class="confidence-row">
                  <span class="confidence-row__label">High Confidence</span>
                  <div class="confidence-row__bar">
                    <div class="confidence-row__fill" style="width: 72%"></div>
                  </div>
                  <span class="confidence-row__value">72%</span>
                </div>
                <div class="confidence-row">
                  <span class="confidence-row__label">Medium Confidence</span>
                  <div class="confidence-row__bar">
                    <div class="confidence-row__fill" style="width: 48%"></div>
                  </div>
                  <span class="confidence-row__value">48%</span>
                </div>
                <div class="confidence-row">
                  <span class="confidence-row__label">Low Confidence</span>
                  <div class="confidence-row__bar">
                    <div class="confidence-row__fill" style="width: 31%"></div>
                  </div>
                  <span class="confidence-row__value">31%</span>
                </div>
              </div>
              <p class="process-sidebar__note">
                Win rates across 1,240+ analyzed races, Jan 2024 – present.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Machine Learning Section -->
    <section class="ml-section">
      <div class="container">
        <div class="ml-grid">
          <div class="ml-content" v-reveal>
            <span class="ml-tag">The Engine</span>
            <h2 class="section-title">Machine Learning</h2>
            <p class="ml-lead">
              Training models on historic track data to draw statistical inferences 
              about future outcomes.
            </p>
            <p>
              Our machine learning pipeline processes thousands of variables per race. 
              Gradient-boosted decision trees, neural networks, and Bayesian models 
              each contribute predictions that are combined through a meta-learner. 
              The result is a probability distribution over finishing positions for 
              every horse in every race.
            </p>
            <p>
              We don't chase hot horses or follow public sentiment. The models are 
              trained exclusively on historical data, validated through walk-forward 
              backtesting, and recalibrated after every race day. This disciplined 
              approach is what separates signal from noise.
            </p>

            <ul class="ml-features">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Walk-forward validation prevents overfitting
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Ensemble methods reduce single-model bias
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Continuous retraining on fresh data
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Track-specific models account for surface quirks
              </li>
            </ul>
          </div>

          <div class="ml-visual" v-reveal>
            <div class="ml-visual__frame">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" 
                alt="Data visualization representing machine learning analytics" 
                class="ml-visual__image"
              />
              <div class="ml-visual__overlay"></div>
            </div>
            <div class="ml-visual__caption">
              <span class="ml-visual__caption-label">Model Architecture</span>
              <span class="ml-visual__caption-text">
                Ensemble of gradient-boosted trees, neural nets, and Bayesian models
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Transparency Commitment -->
    <section class="transparency-section">
      <div class="container">
        <div class="transparency-card" v-reveal>
          <span class="transparency-card__frame" aria-hidden="true"></span>
          <i class="transparency-card__corner transparency-card__corner--tl" aria-hidden="true"></i>
          <i class="transparency-card__corner transparency-card__corner--br" aria-hidden="true"></i>

          <div class="transparency-card__header">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h2 class="transparency-card__title">Our Commitment to Transparency & Accuracy</h2>
          </div>

          <div class="transparency-card__body">
            <p class="transparency-card__lead">
              We believe trust is earned through openness, not marketing. That's why 
              every prediction we make is published, timestamped, and tracked against 
              actual outcomes — whether it wins or loses.
            </p>

            <div class="transparency-pillars" v-reveal.stagger>
              <div class="pillar">
                <div class="pillar__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3>Published Before Post</h3>
                <p>
                  Every pick is locked in and published before the race begins. 
                  We never revise predictions after the fact.
                </p>
              </div>

              <div class="pillar">
                <div class="pillar__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3>Results Recorded Automatically</h3>
                <p>
                  Outcomes are captured by our system the moment a race finishes. 
                  No manual entry, no cherry-picking.
                </p>
              </div>

              <div class="pillar">
                <div class="pillar__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3>Losses Are Visible</h3>
                <p>
                  We don't hide our losing picks. A transparent track record 
                  includes the full picture — wins and losses alike.
                </p>
              </div>

              <div class="pillar">
                <div class="pillar__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3>Academic Rigor</h3>
                <p>
                  Our methodology is built on peer-reviewed statistical practices. 
                  We prioritize long-term accuracy over short-term hype.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Disclaimer Section -->
    <section class="disclaimer-section">
      <div class="container">
        <div class="disclaimer-card">
          <div class="disclaimer-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 class="disclaimer-card__title">Important Disclaimer</h2>
          <div class="disclaimer-card__body">
            <p>
              <strong>HorseBrain does not provide financial advice.</strong> The content 
              on this website represents the results of machine learning inference and 
              statistical modeling. We are a research platform, not a financial advisor, 
              broker, or betting service.
            </p>
            <p>
              All picks, predictions, and performance figures are provided for 
              informational and educational purposes only. <strong>We are not responsible 
              for any betting outcomes, financial losses, or decisions made based on the 
              information presented here.</strong>
            </p>
            <p>
              Past performance is not indicative of future results. Horse racing involves 
              inherent risk and uncertainty. If you choose to place wagers based on our 
              analysis, you do so entirely at your own risk.
            </p>
            <p class="disclaimer-card__emphasis">
              Please gamble responsibly. If you or someone you know has a gambling problem, 
              help is available. Call the National Problem Gambling Helpline at 
              <a href="tel:1-800-522-4700">1-800-522-4700</a> or visit 
              <a href="https://www.ncpgambling.org" target="_blank" rel="noopener">ncpgambling.org</a>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <div class="container">
        <div class="final-cta__inner" v-reveal>
          <div class="final-cta__text">
            <h2 class="final-cta__title">See the picks for yourself</h2>
            <p class="final-cta__subtitle">
              Browse today's featured picks or explore the full race schedule.
            </p>
          </div>
          <div class="final-cta__actions">
            <NuxtLink to="/todays-picks" class="btn btn--secondary">
              View Today's Picks
            </NuxtLink>
            <NuxtLink to="/" class="btn btn--primary">
              Full Schedule
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'

const breadcrumbs = [
  { label: 'Home', to: '/' },
  { label: 'Our Track Record' }
]

const statsGrid = ref(null)
const statsObserver = ref(null)

const trackRecordStats = ref([
  { 
    label: 'Win Rate (Top Pick)', 
    target: 68.4, 
    format: 'percent', 
    isSettled: false, 
    chars: [],
    context: 'Across all confidence levels, Jan 2024 – present'
  },
  { 
    label: 'ROI (Return on Investment)', 
    target: 14.2, 
    format: 'plus-percent', 
    isSettled: false, 
    chars: [],
    context: 'On a flat $100 bet per top pick'
  },
  { 
    label: 'Total Races Analyzed', 
    target: 1240, 
    format: 'comma', 
    isSettled: false, 
    chars: [],
    context: 'Across 6 supported tracks'
  },
  { 
    label: '$100 Base Profit', 
    target: 45, 
    format: 'dollar-k-plus', 
    isSettled: false, 
    chars: [],
    context: 'Cumulative profit on $100 base bets'
  }
])

const getFormattedString = (value, format) => {
  const safeValue = Number.isFinite(value) ? value : 0
  switch (format) {
    case 'percent': return `${safeValue.toFixed(1)}%`
    case 'plus-percent': return `+${safeValue.toFixed(1)}%`
    case 'comma': return Math.round(safeValue).toLocaleString('en-US')
    case 'dollar-k-plus': return `$${Math.round(safeValue)}k+`
    default: return String(Math.round(safeValue))
  }
}

const parseChars = (target, format) => {
  const finalStr = getFormattedString(target, format)
  const chars = []
  for (const char of finalStr) {
    if (/\d/.test(char)) {
      chars.push({ type: 'roll', target: parseInt(char, 10) })
    } else {
      chars.push({ type: 'static', value: char })
    }
  }
  return chars
}

const initCountUpAnimation = () => {
  if (!statsGrid.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    trackRecordStats.value.forEach(stat => { stat.isSettled = true })
    return
  }

  statsObserver.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        trackRecordStats.value.forEach(stat => { stat.isSettled = true })
        statsObserver.value.disconnect()
        statsObserver.value = null
      }
    },
    { threshold: 0.25 }
  )

  statsObserver.value.observe(statsGrid.value)
}

onMounted(() => {
  trackRecordStats.value.forEach(stat => {
    stat.chars = parseChars(stat.target, stat.format)
  })
  initCountUpAnimation()
})

onBeforeUnmount(() => {
  if (statsObserver.value) {
    statsObserver.value.disconnect()
  }
})

useHead({
  title: 'Our Track Record | HorseBrain',
  meta: [
    { 
      name: 'description', 
      content: 'Verified performance statistics for HorseBrain\'s machine learning predictions. Transparent, audited results across all supported racetracks.'
    }
  ]
})
</script>

<style lang="scss" scoped>
// .stat-card / odometer → components/_stats.scss; tags → _badges.scss;
// .final-cta → _cta.scss. Page layout only here.
.track-record-page { background-color: var(--bg-page); }

// ---- Key stats (espresso band, 2×2 large odometers) --------------------
.key-stats {
  padding-block: var(--section-pad) var(--section-pad-sm);
  background-color: var(--bg-dark-warm);
  color: var(--text-on-dark);
  text-align: center;

  .section-title { color: var(--color-white); }
  .section-subtitle { max-width: 720px; color: var(--text-on-dark-muted); }

  // Only two columns here even on desktop — bigger numbers
  .stats-grid {
    max-width: 900px;
    margin: var(--space-8) auto;
    @include up(lg) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  .stat-card__value { font-size: clamp(2.5rem, 1.5rem + 4vw, 5.5rem); }

  &__footnote {
    max-width: 600px;
    margin: 0 auto;
    font-size: var(--fs-sm);
    color: var(--text-on-dark-faint);
  }
}

// ---- Process ---------------------------------------------------------------
.process-section { padding-block: var(--section-pad); }

.process-grid,
.ml-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-8);
}

.process-grid { @include up(lg) { grid-template-columns: 1.5fr 1fr; gap: var(--space-9); align-items: start; } }
.ml-grid      { @include up(lg) { grid-template-columns: 1fr 1fr; gap: var(--space-9); align-items: center; } }

.process-content .section-title,
.ml-content .section-title { text-align: left; }

.process-tag, .ml-tag { margin-bottom: var(--space-4); }

.process-lead,
.ml-lead {
  margin-bottom: var(--space-6);
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-espresso);
  @include up(md) { font-size: 1.2rem; }
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
  margin-top: var(--space-8);
}

.process-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  @include up(sm) { flex-direction: row; gap: var(--space-6); }

  &__number {
    flex-shrink: 0;
    width: 56px;
    @include heading-font;
    font-size: var(--fs-2xl);
    line-height: 1;
    color: var(--color-blue-ink);
    opacity: 0.8;
  }

  &__content {
    flex: 1;
    h3 { font-size: var(--fs-lg); color: var(--color-espresso); margin-bottom: var(--space-2); }
    p { font-size: 0.95rem; color: var(--text-secondary); }
  }
}

.process-sidebar__card {
  padding: var(--space-6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-cut);
  background: linear-gradient(135deg, var(--color-cream), var(--color-cream-deep));
  box-shadow: 0 4px 12px rgb(29 28 33 / 0.06);

  @include up(md) { padding: var(--space-7); }
  @include up(lg) { position: sticky; top: calc(var(--header-h) + var(--space-6)); }
}

.process-sidebar__label {
  display: block;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-strong);
  @include label-caps;
  color: var(--color-espresso);
}

.confidence-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.confidence-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px;
  grid-template-areas: 'label value' 'bar bar';
  align-items: center;
  gap: 6px var(--space-3);

  @include up(sm) {
    grid-template-columns: 130px minmax(0, 1fr) 48px;
    grid-template-areas: 'label bar value';
  }

  &__label { grid-area: label; font-size: var(--fs-sm); font-weight: 600; color: var(--color-espresso); }

  &__bar {
    grid-area: bar;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: rgb(69 32 26 / 0.08);
  }

  &__fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(to right, var(--color-fern), var(--color-fern-bright));
    transition: width 1s ease;
  }

  &__value {
    grid-area: value;
    @include heading-font;
    text-align: right;
    color: var(--color-espresso);
  }
}

.process-sidebar__note {
  font-size: var(--fs-xs);
  font-style: italic;
  line-height: 1.4;
  color: var(--text-secondary);
}

// ---- Machine learning ------------------------------------------------------
.ml-section {
  padding-block: var(--section-pad);
  background-color: var(--bg-alt);
}

.ml-content p { margin-bottom: var(--space-5); line-height: 1.7; color: var(--text-secondary); }

.ml-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: var(--space-7) 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-espresso);

    svg { margin-top: 3px; color: var(--color-fern); }
  }
}

.ml-visual__frame {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-cut);
  box-shadow: 0 8px 24px rgb(29 28 33 / 0.12), 0 2px 6px rgb(29 28 33 / 0.08);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    border: 1px solid rgb(199 169 107 / 0.4);
    border-radius: inherit;
    pointer-events: none;
  }
}

.ml-visual__image { width: 100%; height: 100%; object-fit: cover; }

.ml-visual__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgb(29 28 33 / 0.6) 100%);
  pointer-events: none;
}

.ml-visual__caption {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: var(--space-4);

  &-label { @include label-caps; color: var(--color-fern); }
  &-text { font-size: var(--fs-sm); font-style: italic; color: var(--text-secondary); }
}

// ---- Transparency commitment --------------------------------------------------
.transparency-section { padding-block: var(--section-pad); }

.transparency-card {
  @include card(var(--space-6));
  @include ornament-frame(22px);

  @include up(md) { padding: var(--space-9); }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--border-color);

    @include up(md) { flex-direction: row; align-items: center; gap: var(--space-5); }

    svg { color: var(--color-fern); }
  }

  &__title { font-size: var(--fs-2xl); color: var(--color-espresso); }

  &__lead {
    margin-bottom: var(--space-8);
    font-size: var(--fs-md);
    font-weight: 500;
    color: var(--color-espresso);
  }
}

.transparency-pillars {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-7);

  @include up(md) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.pillar {
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: var(--space-4);
    border-radius: var(--radius-md);
    background: rgb(54 107 36 / 0.08);
    color: var(--color-fern);
  }

  h3 { font-size: var(--fs-md); color: var(--color-espresso); margin-bottom: var(--space-2); }
  p { font-size: var(--fs-sm); color: var(--text-secondary); }
}

// ---- Responsible-gambling disclaimer ------------------------------------------
.disclaimer-section {
  padding-block: var(--section-pad-sm);
  background-color: var(--bg-alt);
}

.disclaimer-card {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-7) var(--space-5);
  text-align: center;
  border: 2px solid rgb(194 59 59 / 0.2);
  border-radius: var(--radius-cut);
  background-color: var(--surface);

  @include up(md) { padding: var(--space-8); }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: var(--space-5);
    border-radius: 50%;
    background: rgb(194 59 59 / 0.08);
    color: var(--color-negative);
  }

  &__title { margin-bottom: var(--space-6); font-size: var(--fs-2xl); color: var(--color-espresso); }

  &__body {
    text-align: left;

    p {
      max-width: none;
      margin-bottom: var(--space-4);
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--text-secondary);

      strong { color: var(--color-espresso); }
      &:last-child { margin-bottom: 0; }
    }
  }

  &__emphasis {
    margin-top: var(--space-6);
    padding: var(--space-4) var(--space-5);
    border-left: 3px solid var(--color-negative);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    background: rgb(194 59 59 / 0.06);

    a {
      font-weight: 700;
      color: var(--color-blue-ink);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
}
</style>