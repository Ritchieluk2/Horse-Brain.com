<template>
  <div class="race-picks-page" v-if="raceday && race">
    <!-- 1. Page Title -->
    <PageTitle 
      :title="`Race ${race.race_num} Analysis`" 
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Racetracks', to: '/racetracks' },
        { label: raceday.track_name, to: `/racetracks/${raceday.track_id}` },
        { label: raceday.shortDate, to: raceday.path },
        { label: `Race ${race.race_num}` }
      ]"
    />

    <!-- 2. Race Header -->
    <section class="race-header">
      <div class="container">
        <div class="race-header__grid">
          <div class="race-header__content">
            <span class="race-header__track">{{ raceday.track_name }}</span>
            <h1 class="race-header__title">Race {{ race.race_num }}</h1>
            <p class="race-header__type">{{ race.race_type }}</p>
            
            <div class="race-header__meta">
              <div class="meta-item">
                <span class="meta-item__label">Post</span>
                <span class="meta-item__value">{{ formatTime(race.post_time) }}</span>
              </div>
              <div class="meta-item meta-item--divider">
                <span class="meta-item__label">Distance</span>
                <span class="meta-item__value">{{ race.distance }}</span>
              </div>
              <div class="meta-item meta-item--divider">
                <span class="meta-item__label">Surface</span>
                <span class="meta-item__value">{{ race.surface }}</span>
              </div>
              <div class="meta-item meta-item--divider">
                <span class="meta-item__label">Purse</span>
                <span class="meta-item__value">${{ (race.purse / 1000).toFixed(0) }}k</span>
              </div>
            </div>
          </div>

          <div class="race-header__visual">
            <img :src="raceday.background" :alt="raceday.track_name" class="race-header__bg" />
            <div class="race-header__overlay"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Per-Horse Predictions -->
    <section class="predictions-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Horse-by-Horse Analysis</h2>
          <p class="section-subtitle">Our algorithm's confidence rating and detailed analysis for every runner.</p>
        </div>

        <div class="predictions-grid">
          <article 
            v-for="prediction in race.predictions" 
            :key="prediction.program_number"
            class="prediction-card"
            :class="`prediction-card--${prediction.confidence}`"
          >
            <span class="prediction-card__frame" aria-hidden="true"></span>
            <i class="prediction-card__corner prediction-card__corner--tl" aria-hidden="true"></i>
            <i class="prediction-card__corner prediction-card__corner--br" aria-hidden="true"></i>

            <header class="prediction-card__header">
              <div class="prediction-card__program" :data-pgm="prediction.program_number">{{ prediction.program_number }}</div>
              <div class="prediction-card__horse-info">
                <h3 class="prediction-card__horse">{{ getHorseName(prediction.program_number) }}</h3>
                <span class="prediction-card__jockey">{{ getJockeyName(prediction.program_number) }}</span>
              </div>
              <div 
                class="prediction-card__confidence" 
                :class="`prediction-card__confidence--${prediction.confidence}`"
              >
                <svg v-if="prediction.confidence === 'high'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else-if="prediction.confidence === 'medium'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span class="prediction-card__confidence-label">{{ prediction.confidence }}</span>
              </div>
            </header>

            <p class="prediction-card__analysis">{{ prediction.analysis }}</p>

            <footer class="prediction-card__footer">
              <span class="prediction-card__odds">
                ML: {{ getOdds(prediction.program_number) }}
              </span>
              <span class="prediction-card__weight">
                {{ getWeight(prediction.program_number) }} lbs
              </span>
            </footer>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. Premium Picks Section -->
    <section class="premium-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Premium Expert Picks</h2>
          <p class="section-subtitle">Our algorithm's highest-conviction combinations for this race.</p>
        </div>

        <div class="premium-grid">
          <!-- Most Likely Winner -->
          <article class="premium-card premium-card--winner">
            <span class="premium-card__badge">Most Likely Winner</span>
            <div class="premium-card__body">
              <div class="premium-card__program" :data-pgm="race.premiumPicks.mostLikelyWinner.program_number">{{ race.premiumPicks.mostLikelyWinner.program_number }}</div>
              <div class="premium-card__info">
                <h3 class="premium-card__horse">{{ race.premiumPicks.mostLikelyWinner.horse_name }}</h3>
                <div class="premium-card__probability">
                  <div class="probability-bar">
                    <div 
                      class="probability-bar__fill" 
                      :style="{ width: `${race.premiumPicks.mostLikelyWinner.probability}%` }"
                    ></div>
                  </div>
                  <span class="probability-bar__label">
                    {{ race.premiumPicks.mostLikelyWinner.probability }}% win probability
                  </span>
                </div>
              </div>
            </div>
          </article>

          <!-- Best Value -->
          <article class="premium-card premium-card--value">
            <span class="premium-card__badge">Best Value</span>
            <div class="premium-card__body">
              <div class="premium-card__program" :data-pgm="race.premiumPicks.bestValue.program_number">{{ race.premiumPicks.bestValue.program_number }}</div>
              <div class="premium-card__info">
                <h3 class="premium-card__horse">{{ race.premiumPicks.bestValue.horse_name }}</h3>
                <span class="premium-card__odds-tag">{{ race.premiumPicks.bestValue.odds }}</span>
                <p class="premium-card__reason">{{ race.premiumPicks.bestValue.reason }}</p>
              </div>
            </div>
          </article>

          <!-- WPS -->
          <article class="premium-card premium-card--wps">
            <span class="premium-card__badge">WPS (Win / Place / Show)</span>
            <div class="premium-card__body premium-card__body--stacked">
              <div v-for="(pgm, idx) in race.premiumPicks.wps" :key="pgm" class="wps-row">
                <span class="wps-row__position" :data-place="idx + 1">{{ idx + 1 }}</span>
                <span class="wps-row__bet">{{ ['Win', 'Place', 'Show'][idx] }}</span>
                <span class="wps-row__program" :data-pgm="pgm">{{ pgm }}</span>
                <span class="wps-row__horse">{{ getHorseName(pgm) }}</span>
                <span
                  v-if="race.premiumPicks.wpsConfidence"
                  class="wps-row__confidence confidence"
                  :class="`confidence--${confTier(race.premiumPicks.wpsConfidence[idx])}`"
                  :title="`${confTier(race.premiumPicks.wpsConfidence[idx])} confidence`"
                >
                  <svg v-if="confTier(race.premiumPicks.wpsConfidence[idx]) === 'high'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <svg v-else-if="confTier(race.premiumPicks.wpsConfidence[idx]) === 'medium'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {{ race.premiumPicks.wpsConfidence[idx] }}%
                </span>
              </div>
            </div>
          </article>

          <!-- Exacta -->
          <article class="premium-card premium-card--exacta">
            <span class="premium-card__badge">Exacta</span>
            <div class="premium-card__body premium-card__body--horizontal">
              <div class="exacta-slot">
                <span class="exacta-slot__position" :data-place="1" title="1st" aria-label="1st">1</span>
                <span class="exacta-slot__program" :data-pgm="race.premiumPicks.exacta.top">{{ race.premiumPicks.exacta.top }}</span>
                <span class="exacta-slot__horse">{{ getHorseName(race.premiumPicks.exacta.top) }}</span>
              </div>
              <div class="exacta-arrow">→</div>
              <div class="exacta-slot">
                <span class="exacta-slot__position" :data-place="2" title="2nd" aria-label="2nd">2</span>
                <span class="exacta-slot__program" :data-pgm="race.premiumPicks.exacta.second">{{ race.premiumPicks.exacta.second }}</span>
                <span class="exacta-slot__horse">{{ getHorseName(race.premiumPicks.exacta.second) }}</span>
              </div>
            </div>
            <div class="premium-card__payout" v-if="race.status === 'completed'">
              Paid ${{ race.premiumPicks.exacta.payout }}
            </div>
          </article>

          <!-- Trifecta -->
          <article class="premium-card premium-card--trifecta">
            <span class="premium-card__badge">Trifecta</span>
            <div class="premium-card__body premium-card__body--horizontal">
              <div class="exacta-slot">
                <span class="exacta-slot__position" :data-place="1" title="1st" aria-label="1st">1</span>
                <span class="exacta-slot__program" :data-pgm="race.premiumPicks.trifecta.top">{{ race.premiumPicks.trifecta.top }}</span>
                <span class="exacta-slot__horse">{{ getHorseName(race.premiumPicks.trifecta.top) }}</span>
              </div>
              <div class="exacta-arrow">→</div>
              <div class="exacta-slot">
                <span class="exacta-slot__position" :data-place="2" title="2nd" aria-label="2nd">2</span>
                <span class="exacta-slot__program" :data-pgm="race.premiumPicks.trifecta.second">{{ race.premiumPicks.trifecta.second }}</span>
                <span class="exacta-slot__horse">{{ getHorseName(race.premiumPicks.trifecta.second) }}</span>
              </div>
              <div class="exacta-arrow">→</div>
              <div class="exacta-slot">
                <span class="exacta-slot__position" :data-place="3" title="3rd" aria-label="3rd">3</span>
                <span class="exacta-slot__program" :data-pgm="race.premiumPicks.trifecta.third">{{ race.premiumPicks.trifecta.third }}</span>
                <span class="exacta-slot__horse">{{ getHorseName(race.premiumPicks.trifecta.third) }}</span>
              </div>
            </div>
            <div class="premium-card__payout" v-if="race.status === 'completed'">
              Paid ${{ race.premiumPicks.trifecta.payout }}
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 5. Newsletter CTA -->
    <section class="newsletter-cta">
      <div class="container">
        <div class="newsletter-cta__content">
          <h2 class="newsletter-cta__title">Get Daily Picks in Your Inbox</h2>
          <p class="newsletter-cta__text">
            Subscribe to receive our top algorithmic picks every morning before first post.
          </p>
          <form class="newsletter-cta__form" @submit.prevent>
            <input type="email" placeholder="Enter your email address" class="newsletter-cta__input" required />
            <button type="submit" class="btn btn--primary">Subscribe</button>
          </form>
          <p class="newsletter-cta__privacy">No spam. Unsubscribe anytime. Just data.</p>
        </div>
      </div>
    </section>

    <!-- 6. Transparent Track Record -->
    <section class="track-record">
      <div class="container">
        <h2 class="section-title">100% Transparent Track Record</h2>
        <p class="section-subtitle">
          We operate like a financial institution. Here is our verified, historical performance.
        </p>

        <div class="track-record__ornament" aria-hidden="true">
          <span class="track-record__ornament-line"></span>
          <span class="track-record__ornament-diamond"></span>
          <span class="track-record__ornament-line"></span>
        </div>

        <div class="stats-grid" ref="statsGrid">
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
          </div>
        </div>

        <p class="track-record__disclaimer">
          <em>Past performance is not indicative of future results. Please bet responsibly.</em>
        </p>
      </div>
    </section>

    <!-- 7. Schedule CTA -->
    <section class="schedule-cta">
      <div class="container">
        <div class="schedule-cta__inner">
          <div class="schedule-cta__text">
            <h2 class="schedule-cta__title">Ready for the next race?</h2>
            <p class="schedule-cta__subtitle">
              Browse the full race schedule or explore more picks from {{ raceday.track_name }}.
            </p>
          </div>
          <div class="schedule-cta__actions">
            <NuxtLink :to="raceday.path" class="btn btn--secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to {{ raceday.shortDate }}
            </NuxtLink>
            <NuxtLink to="/" class="btn btn--primary">
              View Full Schedule
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- 404 State -->
  <div v-else class="race-not-found">
    <div class="container">
      <h2>Race not found</h2>
      <p>The race you're looking for doesn't exist or has no analysis available.</p>
      <NuxtLink to="/" class="btn btn--primary">Back to Home</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageTitle from '~/components/snippets/PageTitle.vue'
import { useRacedays } from '~/composables/useRacedays'

const route = useRoute()
const { getRaceday } = useRacedays()

const raceday = computed(() =>
  getRaceday(route.params.track, route.params.date)
)

const race = computed(() => {
  if (!raceday.value) return null
  const raceNum = parseInt(route.params.race, 10)
  return raceday.value.races.find(r => r.race_num === raceNum) || null
})

/* Helper functions */
const getHorseName = (pgm) => {
  if (!race.value) return 'Unknown'
  const p = race.value.participants.find(x => String(x.program_number) === String(pgm))
  return p ? p.horse_name : 'Unknown'
}

const getJockeyName = (pgm) => {
  if (!race.value) return '—'
  const p = race.value.participants.find(x => String(x.program_number) === String(pgm))
  return p ? p.jockey_name : '—'
}

const getOdds = (pgm) => {
  if (!race.value) return '—'
  const p = race.value.participants.find(x => String(x.program_number) === String(pgm))
  if (!p) return '—'
  const d = parseFloat(p.odds)
  if (!Number.isFinite(d)) return '—'
  const f = Math.round(d * 2) / 2
  const whole = Math.floor(f)
  return f === whole ? `${whole}-1` : `${Math.round(f * 2)}-2`
}

const getWeight = (pgm) => {
  if (!race.value) return '—'
  const p = race.value.participants.find(x => String(x.program_number) === String(pgm))
  return p ? p.weight : '—'
}

const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: true
})

/* Track Record Odometer (same logic as homepage) */
const statsObserver = ref(null)
const statsGrid = ref(null)

const trackRecordStats = ref([
  { label: 'Win Rate (Top Pick)', target: 68.4, format: 'percent', isSettled: false, chars: [] },
  { label: 'ROI (Return on Investment)', target: 14.2, format: 'plus-percent', isSettled: false, chars: [] },
  { label: 'Total Races Analyzed', target: 1240, format: 'comma', isSettled: false, chars: [] },
  { label: '$100 Base Profit', target: 45, format: 'dollar-k-plus', isSettled: false, chars: [] }
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
    { threshold: 0.35 }
  )

  statsObserver.value.observe(statsGrid.value)
}

watch(race, () => {
  // Re-parse chars and re-init animation when race changes
  trackRecordStats.value.forEach(stat => {
    stat.chars = parseChars(stat.target, stat.format)
    stat.isSettled = false
  })
  setTimeout(() => initCountUpAnimation(), 100)
}, { immediate: true })

useHead(() => ({
  title: race.value
    ? `${raceday.value.track_name} Race ${race.value.race_num} Analysis | HorseBrain`
    : 'Race Not Found | HorseBrain'
}))

// Confidence tier from a percentage (WPS rows): >=65 high, >=45 medium, else low
const confTier = (p) => (p >= 65 ? 'high' : p >= 45 ? 'medium' : 'low')
</script>

<style lang="scss" scoped>
// Cards (prediction/premium), stats, CTA bands and 404 state are
// global — see assets/scss/components/. Page layout only here.
.race-picks-page { background-color: var(--bg-page); }

// ---- Race header: shared split-hero pattern ----------------------
.race-header {
  @include split-hero(360px);

  &__track {
    display: inline-block;
    margin-bottom: var(--space-3);
    @include label-caps(var(--fs-2xs), 0.14em);
    color: var(--color-baby-blue);
  }

  &__title {
    margin-bottom: var(--space-2);
    font-size: var(--fs-4xl);
    line-height: 1;
    color: var(--color-white);
  }

  &__type {
    margin: 0 auto var(--space-6);
    font-size: var(--fs-md);
    font-style: italic;
    color: var(--text-on-dark-muted);
    @include up(lg) { margin-left: 0; }
  }

  &__meta { @include stat-row; }
}

.meta-item { @include stat-item; }

// ---- Sections ------------------------------------------------------
.predictions-section { padding-block: var(--section-pad); }

.premium-section {
  padding-block: var(--section-pad);
  background-color: var(--bg-alt);
}
</style>