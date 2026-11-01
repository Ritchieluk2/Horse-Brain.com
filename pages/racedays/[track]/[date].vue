<template>
  <div class="raceday-page" v-if="raceday">
    <!-- 1. Page Title -->
    <PageTitle 
      :title="raceday.track_name" 
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Racetracks', to: '/racetracks' },
        { label: raceday.track_name, to: `/racetracks/${raceday.track_id}` },
        { label: raceday.formatted_date }
      ]"
    />

        <!-- 2. Raceday Hero -->
    <section class="raceday-hero">
      <div class="container">
        <div class="raceday-hero__grid">
          
          <!-- Left Column: Details (Dark Background) -->
          <div class="raceday-hero__content">
            <div class="raceday-hero__header">
              <h1 class="raceday-hero__title">{{ raceday.track_name }}</h1>
              <span class="raceday-hero__date">{{ raceday.formatted_date }}</span>
            </div>
            
            <div class="raceday-hero__stats">
              <div class="hero-stat">
                <span class="hero-stat__label">Races</span>
                <span class="hero-stat__value">{{ raceday.overview.total_races }}</span>
              </div>
              <div class="hero-stat hero-stat--divider">
                <span class="hero-stat__label">First Post</span>
                <span class="hero-stat__value">{{ raceday.overview.first_post }}</span>
              </div>
              <div class="hero-stat hero-stat--divider">
                <span class="hero-stat__label">Going</span>
                <span class="hero-stat__value hero-stat__value--highlight">{{ raceday.weather.track_condition }}</span>
              </div>
            </div>

            <div class="raceday-hero__weather">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
              <span>{{ raceday.weather.condition }}, {{ raceday.weather.temperature }} • Wind {{ raceday.weather.wind }}</span>
            </div>

            <!-- Premium: the printable / fill-in program for this raceday -->
            <NuxtLink :to="`/program/${raceday.track_id}/${raceday.dateISO}`" class="btn btn--premium raceday-hero__program">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>
              </svg>
              Raceday Program
            </NuxtLink>
          </div>

          <!-- Right Column: Background Image & CTA -->
          <div class="raceday-hero__visual">
            <img :src="raceday.background" :alt="raceday.track_name" class="raceday-hero__bg" />
            <div class="raceday-hero__overlay"></div>
            
            <div class="raceday-hero__cta">
              <NuxtLink :to="`/racetracks/${raceday.track_id}`" class="btn btn--primary">
                View Track Profile
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. Main Content Grid (Races + Stats Sidebar) -->
    <section class="raceday-content">
      <div class="container">
        <div class="raceday-content__grid">
          
          <!-- Left Column: Races List -->
          <div class="races-list-column">
            <h2 class="section-title" v-reveal>Today's Card</h2>
            
            <div class="races-list" v-reveal.stagger>
              <article
                v-for="race in raceday.races"
                :key="race.id"
                class="race-row"
                :class="[
                  `race-row--${race.status}`, 
                  { 'race-row--expanded': isRaceExpanded(race.id) }
                ]"
              >
                <!-- Race Header (Always Visible) -->
                <button
                  class="race-row__header"
                  @click="toggleRace(race.id)"
                  :aria-expanded="isRaceExpanded(race.id)"
                >
                  <div class="race-row__main">
                    <div class="race-row__status">
                      <span class="race-row__status-badge" :class="`race-row__status-badge--${race.status}`">
                        {{ statusLabel(race.status) }}
                      </span>
                    </div>

                    <div class="race-row__track">
                      <span class="race-row__race-num">Race {{ race.race_num }}</span>
                      <span class="race-row__race-type">{{ race.race_type }}</span>
                    </div>

                    <div class="race-row__details">
                      <div class="race-row__detail">
                        <span class="race-row__detail-label">Post</span>
                        <span class="race-row__detail-value">{{ formatTime(race.post_time) }}</span>
                      </div>
                      <div class="race-row__detail">
                        <span class="race-row__detail-label">Distance</span>
                        <span class="race-row__detail-value">{{ race.distance }}</span>
                      </div>
                      <div class="race-row__detail">
                        <span class="race-row__detail-label">Purse</span>
                        <span class="race-row__detail-value">${{ (race.purse / 1000).toFixed(0) }}k</span>
                      </div>
                    </div>
                  </div>

                  <!-- Our Pick Panel (Compact in header) -->
                  <div class="race-row__pick" v-if="race.botPick">
                    <span class="race-row__pick-label">Our Pick</span>
                    <div class="race-row__pick-body">
                      <span class="race-row__pick-program" :data-pgm="race.botPick.program_number">{{ race.botPick.program_number }}</span>
                      <span class="race-row__pick-horse">{{ getHorseName(race, race.botPick.program_number) }}</span>
                    </div>
                  </div>

                  <span class="race-row__chevron" :class="{ 'race-row__chevron--open': isRaceExpanded(race.id) }">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </span>
                </button>

                <!-- Expanded Race Details -->
                <Transition name="accordion">
                  <div class="race-row__body" v-if="isRaceExpanded(race.id)">
                    <div class="race-row__body-inner">
                      <table class="participants-table">
                        <thead>
                          <tr>
                            <th class="participants-table__th">PGM</th>
                            <th class="participants-table__th">Horse</th>
                            <th class="participants-table__th">Jockey</th>
                            <th class="participants-table__th">Wt</th>
                            <th class="participants-table__th">Odds</th>
                            <th v-if="race.status === 'completed'" class="participants-table__th">Finish</th>
                          </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="participant in race.participants"
                                :key="participant.program_number"
                                class="participants-table__row"
                                :class="{ 
                                'participants-table__row--winner': participant.finish_position === 1,
                                'participants-table__row--pick': race.botPick && String(participant.program_number) === String(race.botPick.program_number)
                                }"
                            >
                                <td class="participants-table__cell participants-table__cell--program">
                                <span class="horse-num" :data-pgm="participant.program_number">{{ participant.program_number }}</span>
                                <span 
                                    v-if="race.botPick && String(participant.program_number) === String(race.botPick.program_number)" 
                                    class="pick-icon-inline"
                                    :class="`pick-icon-inline--${race.botPick.confidence}`"
                                    :title="`Our Pick with ${race.botPick.confidence} confidence`"
                                >
                                    <svg v-if="race.botPick.confidence === 'high'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    <svg v-else-if="race.botPick.confidence === 'medium'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                </span>
                                </td>
                                
                                <!-- UPDATED HORSE NAME CELL -->
                                <td class="participants-table__cell participants-table__cell--horse">
                                <NuxtLink 
                                    v-if="participant.horse_equibase_refid"
                                    :to="`/horses/${participant.horse_equibase_refid}`"
                                    class="horse-link"
                                >
                                    {{ participant.horse_name }}
                                </NuxtLink>
                                <span v-else>{{ participant.horse_name }}</span>
                                </td>

                                <td class="participants-table__cell participants-table__cell--jockey">{{ participant.jockey_name }}</td>
                                <td class="participants-table__cell">{{ participant.weight }}</td>
                                <td class="participants-table__cell participants-table__cell--odds">{{ formatOdds(participant.odds) }}</td>
                                <td v-if="race.status === 'completed'" class="participants-table__cell participants-table__cell--finish">
                                <span v-if="participant.finish_position" class="place-num" :data-place="participant.finish_position">{{ participant.finish_position }}</span>
                                </td>
                            </tr>
                            </tbody>
                      </table>
                      <div class="race-row__links">
                        <NuxtLink :to="`/picks/${raceday.track_id}/${raceday.dateISO}/${race.race_num}`" class="btn btn--outline btn--small">Full Analysis</NuxtLink>
                        <ProgramLink small :track="raceday.track_id" :date="raceday.dateISO" :race="race.race_num" label="In the Program" />
                      </div>
                    </div>
                  </div>
                </Transition>
              </article>
            </div>
          </div>

          <!-- Right Column: Reporting + Statistics (Glassmorphism Sidebar) -->
          <aside class="reporting-column">
            <div class="reporting-card reporting-card--glass" v-reveal>
              <span class="reporting-card__frame" aria-hidden="true"></span>
              <i class="reporting-card__corner reporting-card__corner--tl" aria-hidden="true"></i>
              <i class="reporting-card__corner reporting-card__corner--br" aria-hidden="true"></i>
              
              <div class="reporting-card__header">
                <h2 class="reporting-card__title">HorseBrain Performance</h2>
                <span class="reporting-card__tag">Verified Data</span>
              </div>

              <p class="reporting-card__context">
                How our algorithm performs at <strong>{{ raceday.track_name }}</strong> under <strong>{{ raceday.weather.track_condition }}</strong> conditions, compared to the site-wide average.
              </p>

              <div class="reporting-card__metrics">
                <div class="metric">
                  <div class="metric__value-row">
                    <span class="metric__value">{{ raceday.botStats.track_weather_win_rate }}%</span>
                    <span class="metric__delta metric__delta--positive">+{{ (raceday.botStats.track_weather_win_rate - raceday.botStats.average_win_rate).toFixed(1) }}%</span>
                  </div>
                  <span class="metric__label">Win Rate</span>
                  <div class="metric__bar">
                    <div class="metric__bar-fill" :style="{ width: `${raceday.botStats.track_weather_win_rate}%` }"></div>
                  </div>
                  <span class="metric__context">vs {{ raceday.botStats.average_win_rate }}% avg</span>
                </div>

                <div class="metric">
                  <div class="metric__value-row">
                    <span class="metric__value">+{{ raceday.botStats.track_weather_roi }}%</span>
                    <span class="metric__delta metric__delta--positive">ROI</span>
                  </div>
                  <span class="metric__label">Return on Investment</span>
                  <div class="metric__bar">
                    <div class="metric__bar-fill metric__bar-fill--roi" :style="{ width: `${Math.min(raceday.botStats.track_weather_roi * 3, 100)}%` }"></div>
                  </div>
                  <span class="metric__context">vs {{ raceday.botStats.average_roi }}% avg</span>
                </div>
              </div>

              <div class="reporting-card__summary">
                <div class="summary-stat">
                  <span class="summary-stat__value">{{ raceday.botStats.total_picks }}</span>
                  <span class="summary-stat__label">Total Picks Analyzed</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </section>

    <!-- 4. Final CTA -->
    <section class="final-cta">
      <div class="container">
        <div class="final-cta__inner" v-reveal>
          <div class="final-cta__text">
            <h2 class="final-cta__title">Looking for more insights?</h2>
            <p class="final-cta__subtitle">
              Return to the full race schedule or explore the next race day at {{ raceday.track_name }}.
            </p>
          </div>
          <div class="final-cta__actions">
            <NuxtLink to="/racetracks" class="btn btn--secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              All Racetracks
            </NuxtLink>
            <NuxtLink 
              :to="nextRaceday ? nextRaceday.path : `/racetracks/${raceday.track_id}`" 
              class="btn btn--primary"
            >
              {{ nextRaceday ? `Next Race Day (${nextRaceday.shortDate})` : 'View Track Profile' }}
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
  <div v-else class="track-not-found">
    <div class="container">
      <h2>Raceday not found</h2>
      <p>The specific race day you're looking for doesn't exist or has no scheduled races.</p>
      <NuxtLink to="/racetracks" class="btn btn--primary">Back to Racetracks</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageTitle from '~/components/snippets/PageTitle.vue'
import { useRacedays } from '~/composables/useRacedays'
import ProgramLink from '~/components/program/ProgramLink.vue'

const route = useRoute()
const { getRaceday, getAdjacentRacedays } = useRacedays()

const raceday = computed(() =>
  getRaceday(route.params.track, route.params.date)
)

const adjacent = computed(() => getAdjacentRacedays(raceday.value))
const nextRaceday = computed(() => adjacent.value.next)
const previousRaceday = computed(() => adjacent.value.previous)

const expandedRaceIds = ref([])

watch(raceday, (rd) => {
  if (!rd) { expandedRaceIds.value = []; return }

  const live = rd.races.find(r => r.status === 'live')
  const next = rd.races.find(r => r.status === 'upcoming')

  if (!live && !next) {
    expandedRaceIds.value = rd.races.length ? [rd.races[0].id] : []
    return
  }

  expandedRaceIds.value = [live?.id, next?.id].filter(Boolean)
}, { immediate: true })

const isRaceExpanded = (id) => expandedRaceIds.value.includes(id)

const toggleRace = (id) => {
  expandedRaceIds.value = isRaceExpanded(id)
    ? expandedRaceIds.value.filter(x => x !== id)
    : [...expandedRaceIds.value, id]
}

const getHorseName = (race, pgm) => {
  const p = race.participants.find(
    x => String(x.program_number) === String(pgm)
  )
  return p ? p.horse_name : 'Unknown'
}

const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: true
})

const formatOdds = (odds) => {
  const d = parseFloat(odds)
  if (!Number.isFinite(d)) return '—'
  const f = Math.round(d * 2) / 2
  const whole = Math.floor(f)
  return f === whole ? `${whole}-1` : `${Math.round(f * 2)}-2`
}

const statusLabel = (s) =>
  ({ completed: 'Final', live: 'Live', upcoming: 'Upcoming' }[s] || s)

useHead(() => ({
  title: raceday.value
    ? `${raceday.value.track_name} — ${raceday.value.formatted_date} | HorseBrain`
    : 'Raceday Not Found | HorseBrain'
}))
</script>

<style lang="scss" scoped>
// Race rows + participants table → components/_race-row.scss
// .metric / .summary-stat / .reporting-card → components/_stats.scss
// .final-cta → components/_cta.scss, .track-not-found → _states.scss
.raceday-page { background-color: var(--bg-page); }

// ---- Hero: shared split-hero, CTA sits on the photo -----------------
.raceday-hero {
  @include split-hero(420px);

  .container { position: relative; z-index: 2; }

  // Stacked layouts: the hero continues the PageTitle band (same dark
  // background), so it doesn't need its own full top padding
  &__content { @include down(lg) { padding-top: var(--space-3); } }

  &__header {
    margin-bottom: var(--space-6);

    // Below lg the hero sits directly under <PageTitle>, which already
    // shows the track name + date (title and breadcrumb). Avoid saying it twice.
    @include down(lg) { display: none; }
  }

  &__title {
    margin-bottom: var(--space-2);
    font-size: var(--fs-4xl);
    color: var(--color-white);
  }

  &__date {
    font-size: var(--fs-md);
    letter-spacing: 0.02em;
    color: var(--text-on-dark-muted);
  }

  &__stats {
    @include stat-row;
    margin-bottom: var(--space-6);
  }

  &__weather {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-md);
    background: rgb(255 255 255 / 0.06);
    font-size: var(--fs-sm);
    color: rgb(255 255 255 / 0.9);
    text-align: left;

    svg { color: var(--color-baby-blue); }
  }

  // photo column carries the "View Track Profile" button
  &__visual {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: var(--space-6);

    @include up(lg) { padding-bottom: var(--space-8); }
  }

  &__bg { transition: transform var(--dur-slow) ease; }

  &__overlay {
    background: linear-gradient(to bottom, rgb(29 28 33 / 0.1) 0%, rgb(29 28 33 / 0.5) 50%, rgb(29 28 33 / 0.85) 100%);
  }

  &__cta { position: relative; z-index: 3; }

  &__program { margin-top: var(--space-5); }

  @include hover { .raceday-hero__bg { transform: scale(1.03); } }
}

.hero-stat {
  @include stat-item;

  &__value--highlight { color: var(--color-baby-blue); }
}

// ---- Card + sidebar layout ---------------------------------------------
.raceday-content { padding-block: var(--section-pad-sm); }

.raceday-content__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-8);

  @include up(lg) {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }
}

.races-list-column .section-title {
  text-align: left;
  margin-bottom: var(--space-6);
}

// Frosted cream performance card; sticky beside the card on desktop
.reporting-card--glass {
  max-width: 600px;
  margin-inline: auto;
  background: rgb(245 241 232 / 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-color: rgb(255 255 255 / 0.5);
  box-shadow: 0 8px 32px rgb(29 28 33 / 0.06), inset 0 1px 0 rgb(255 255 255 / 0.8);

  @include up(lg) {
    position: sticky;
    top: calc(var(--header-h) + var(--space-6));
    max-width: none;
  }

  .reporting-card__corner { opacity: 0.6; }

  .reporting-card__metrics {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    margin-bottom: var(--space-6);
  }

  .reporting-card__summary {
    display: flex;
    justify-content: center;
    padding-top: var(--space-5);
    border-top: 1px solid var(--border-color);
  }
}
</style>