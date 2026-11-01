<template>
  <div class="racetracks-page">
    <!-- 404 State (Guarded) -->
    <div v-if="!track" class="not-found container">
      <h2>Track not found</h2>
      <p>The racetrack you're looking for doesn't exist or has been removed.</p>
      <NuxtLink to="/racetracks" class="btn btn--primary">Back to All Tracks</NuxtLink>
    </div>

    <!-- Main Content (Only renders if track is found) -->
    <template v-else>
      <PageTitle 
        :title="track.name" 
        :breadcrumbs="[
          { label: 'Home', to: '/' },
          { label: 'Racetracks', to: '/racetracks' },
          { label: track.name }
        ]"
      />

      <!-- Hero Section -->
      <section class="track-hero">
        <div class="container">
          <div class="track-hero__grid">
            <div class="track-hero__content">
              <div class="track-hero__header">
                <h1 class="track-hero__title">{{ track.name }}</h1>
                <span class="track-hero__location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ track.location }}
                </span>
              </div>
              
              <div class="track-hero__stats">
                <div class="hero-stat">
                  <span class="hero-stat__label">Established</span>
                  <span class="hero-stat__value">{{ track.established }}</span>
                </div>
                <div class="hero-stat hero-stat--divider">
                  <span class="hero-stat__label">Surface</span>
                  <span class="hero-stat__value">{{ track.surface }}</span>
                </div>
                <div class="hero-stat hero-stat--divider">
                  <span class="hero-stat__label">Track Length</span>
                  <span class="hero-stat__value">{{ track.trackLength }}</span>
                </div>
              </div>

              <p class="track-hero__description">{{ track.description }}</p>

              <div class="track-hero__notable" v-if="track.notableRaces?.length">
                <span class="track-hero__notable-label">Notable Races:</span>
                <div class="track-hero__notable-list">
                  <span v-for="race in track.notableRaces" :key="race" class="track-hero__notable-tag">
                    {{ race }}
                  </span>
                </div>
              </div>
            </div>

            <div class="track-hero__visual">
              <img :src="track.background" :alt="track.name" class="track-hero__bg" />
              <div class="track-hero__overlay"></div>
              <img :src="track.logo" :alt="`${track.name} Logo`" class="track-hero__logo" />
            </div>
          </div>
        </div>
      </section>

      <!-- Bot Statistics Card -->
      <section class="track-stats-section">
        <div class="container">
          <div class="stats-card" v-reveal>
            <span class="stats-card__frame" aria-hidden="true"></span>
            <i class="stats-card__corner stats-card__corner--tl" aria-hidden="true"></i>
            <i class="stats-card__corner stats-card__corner--br" aria-hidden="true"></i>
            
            <div class="stats-card__header">
              <h2 class="stats-card__title">HorseBrain Performance at {{ track.name }}</h2>
              <span class="stats-card__tag">Verified Data</span>
            </div>

            <div class="stats-card__metrics">
              <div class="metric">
                <div class="metric__value-row">
                  <span class="metric__value">{{ track.botStats.winRate }}%</span>
                  <span class="metric__delta" :class="track.botStats.performanceVsAvg >= 0 ? 'metric__delta--positive' : 'metric__delta--negative'">
                    {{ track.botStats.performanceVsAvg >= 0 ? '+' : '' }}{{ track.botStats.performanceVsAvg }}%
                  </span>
                </div>
                <span class="metric__label">Win Rate</span>
                <span class="metric__context">vs site average</span>
              </div>

              <div class="metric">
                <div class="metric__value-row">
                  <!-- FIXED: Conditional '+' sign for ROI -->
                  <span class="metric__value">{{ track.botStats.roi >= 0 ? '+' : '' }}{{ track.botStats.roi }}%</span>
                  <span class="metric__delta metric__delta--positive">ROI</span>
                </div>
                <span class="metric__label">Return on Investment</span>
                <span class="metric__context">on $100 base bets</span>
              </div>
            </div>

            <div class="stats-card__summary">
              <div class="summary-stat">
                <span class="summary-stat__value">{{ track.botStats.totalPicks }}</span>
                <span class="summary-stat__label">Total Picks</span>
              </div>
              <div class="summary-stat">
                <span class="summary-stat__value summary-stat__value--capitalize">{{ track.botStats.avgConfidence }}</span>
                <span class="summary-stat__label">Avg Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="final-cta">
        <div class="container">
          <div class="final-cta__inner" v-reveal>
            <div class="final-cta__text">
              <h2 class="final-cta__title">Ready to see the upcoming races?</h2>
              <p class="final-cta__subtitle">
                Browse the full race schedule or explore other supported tracks.
              </p>
            </div>
            <div class="final-cta__actions">
              <NuxtLink to="/racetracks" class="btn btn--secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                All Racetracks
              </NuxtLink>
              <ProgramLink v-if="nextRaceday" :track="nextRaceday.track_id" :date="nextRaceday.dateISO" :label="`${nextRaceday.shortDate} Program`" />
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
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageTitle from '~/components/snippets/PageTitle.vue'
import tracksData from '~/data/tracks.json'
import { useRacedays } from '~/composables/useRacedays'
import ProgramLink from '~/components/program/ProgramLink.vue'

const route = useRoute()

// Case-insensitive lookup to prevent null matches (e.g., "/racetracks/kee" matches "KEE")
const track = computed(() => {
  const targetId = String(route.params.id).toUpperCase()
  return tracksData.tracks.find(t => t.id.toUpperCase() === targetId) || null
})

// Next race day at this track, for its Raceday Program link
const { getNextRacedayForTrack } = useRacedays()
const nextRaceday = computed(() => (track.value ? getNextRacedayForTrack(track.value.id) : null))

useHead(() => ({
  title: track.value ? `${track.value.name} | HorseBrain` : 'Track Not Found | HorseBrain'
}))
</script>

<style lang="scss" scoped>
// Shared: .stats-card base + frame, .metric, .summary-stat → components/_stats.scss
//         .final-cta → _cta.scss · .not-found → _states.scss
.racetracks-page { background-color: var(--bg-page); }

// ---- Hero: shared split-hero (text left, track photo bleeding right) ----
.track-hero {
  @include split-hero(440px);

  // Stacked layouts: the hero continues the PageTitle band (same dark
  // background), so it doesn't need its own full top padding
  &__content { @include down(lg) { padding-top: var(--space-3); } }

  &__header { margin-bottom: var(--space-6); }

  &__title {
    margin-bottom: var(--space-3);
    font-size: var(--fs-4xl);
    color: var(--color-white);

    // Below lg <PageTitle> sits right above with the same name, so the
    // hero leads with the location instead
    @include down(lg) { display: none; }
  }

  &__location {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--fs-md);
    color: var(--text-on-dark-muted);

    svg { color: var(--color-baby-blue); }
  }

  &__stats {
    @include stat-row;
    margin-bottom: var(--space-6);
  }

  &__description {
    margin: 0 auto var(--space-6);
    max-width: 600px;
    font-size: var(--fs-md);
    line-height: var(--lh-body);
    color: rgb(255 255 255 / 0.85);

    @include up(lg) { margin-left: 0; }
  }

  &__notable {
    &-label {
      display: block;
      margin-bottom: var(--space-2);
      @include label-caps;
      color: var(--text-on-dark-faint);
    }

    &-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-2);

      @include up(lg) { justify-content: flex-start; }
    }

    &-tag {
      padding: 4px 12px;
      border: 1px solid rgb(199 169 107 / 0.45);
      border-radius: var(--radius-cut-sm);
      background: rgb(199 169 107 / 0.12);
      color: var(--color-brass-light);
      font-size: var(--fs-xs);
      font-weight: 600;
    }
  }

  // Track logo pill sits on the photo, bottom-left
  &__logo {
    position: absolute;
    left: var(--space-5);
    bottom: var(--space-5);
    z-index: 2;
    max-width: 150px;
    max-height: 64px;
    padding: 10px 20px;
    object-fit: contain;
    border-radius: var(--radius-pill);
    background: rgb(255 255 255 / 0.92);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.3);

    @include up(md) { max-width: 190px; max-height: 84px; padding: 14px 26px; }
    @include up(lg) { left: var(--space-8); bottom: var(--space-8); }
  }
}

.hero-stat { @include stat-item; }

// ---- HorseBrain performance card ------------------------------------------
.track-stats-section { padding-block: var(--section-pad); }

.stats-card {
  max-width: 820px;
  margin-inline: auto;

  &__metrics {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-7);
    margin-bottom: var(--space-7);

    @include up(md) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-8); }
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-color);
  }
}
</style>