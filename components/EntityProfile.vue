<template>
  <div class="entity-profile">
    <!-- 2. Hero Section: Bot Accuracy + Key Info -->
    <section class="profile-hero">
      <div class="container">
        <div class="profile-hero__grid">
          
          <!-- Left: Identity + Bot Accuracy -->
          <div class="profile-hero__content">
            <!-- Breadcrumbs double as the eyebrow (this page has no PageTitle band) -->
            <nav class="profile-hero__eyebrow profile-crumbs" aria-label="Breadcrumb">
              <ol>
                <li><NuxtLink to="/" class="profile-crumbs__link">Home</NuxtLink></li>
                <li><span class="profile-crumbs__section">{{ profile.type === 'horse' ? 'Horses' : 'Jockeys' }}</span></li>
                <li><span class="profile-crumbs__current" aria-current="page">{{ profile.type === 'horse' ? 'Horse Profile' : 'Jockey Profile' }}</span></li>
              </ol>
            </nav>
            <h1 class="profile-hero__name">{{ profile.name }}</h1>
            <p class="profile-hero__subtitle">{{ profile.subtitle }}</p>

            <!-- Bot Accuracy Card -->
            <div class="bot-accuracy">
              <div class="bot-accuracy__header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
                <span>HorseBrain's Record with {{ profile.name }}</span>
              </div>

              <div class="bot-accuracy__stats">
                <div class="bot-stat">
                  <span class="bot-stat__value">{{ profile.botAccuracy.win_rate }}%</span>
                  <span class="bot-stat__label">Win Rate</span>
                  <span 
                    class="bot-stat__delta"
                    :class="profile.botAccuracy.performance_vs_avg >= 0 ? 'bot-stat__delta--positive' : 'bot-stat__delta--negative'"
                  >
                    {{ profile.botAccuracy.performance_vs_avg >= 0 ? '+' : '' }}{{ profile.botAccuracy.performance_vs_avg }}% vs avg
                  </span>
                </div>
                <div class="bot-stat">
                  <span class="bot-stat__value">{{ profile.botAccuracy.roi >= 0 ? '+' : '' }}{{ profile.botAccuracy.roi }}%</span>
                  <span class="bot-stat__label">ROI</span>
                  <span class="bot-stat__context">on $100 base bets</span>
                </div>
                <div class="bot-stat">
                  <span class="bot-stat__value">{{ profile.botAccuracy.total_picks }}</span>
                  <span class="bot-stat__label">Total Picks</span>
                  <span class="bot-stat__context">{{ profile.botAccuracy.wins }} wins</span>
                </div>
              </div>

              <div class="bot-accuracy__confidence">
                <span class="bot-accuracy__confidence-label">Avg Confidence:</span>
                <span 
                  class="confidence-badge"
                  :class="`confidence-badge--${profile.botAccuracy.avg_confidence}`"
                >
                  {{ profile.botAccuracy.avg_confidence }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Career Stats -->
          <div class="profile-hero__visual">
            <div class="career-stats-card" v-reveal>
              <span class="career-stats-card__frame" aria-hidden="true"></span>
              <i class="career-stats-card__corner career-stats-card__corner--tl" aria-hidden="true"></i>
              <i class="career-stats-card__corner career-stats-card__corner--br" aria-hidden="true"></i>
              
              <h3 class="career-stats-card__title">Career Statistics</h3>
              <div class="career-stats-card__list">
                <div 
                  v-for="stat in profile.careerStats" 
                  :key="stat.label"
                  class="career-stat-row"
                >
                  <span class="career-stat-row__label">{{ stat.label }}</span>
                  <span class="career-stat-row__value">{{ stat.value }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. Racing History Accordion -->
    <section class="racing-history">
      <div class="container">
        <div class="section-header" v-reveal>
          <h2 class="section-title">Racing History</h2>
          <p class="section-subtitle">
            Complete performance record across all races. Click any entry to view full details.
          </p>
        </div>

        <div class="history-list" v-reveal.stagger>
          <article
            v-for="performance in profile.racingHistory"
            :key="performance.id"
            class="history-row"
            :class="[
              `history-row--finish-${finishCategory(performance.finish_position)}`,
              { 'history-row--expanded': expandedIds.includes(performance.id) }
            ]"
          >
            <!-- Header (Always Visible) -->
            <button
              class="history-row__header"
              @click="toggleRow(performance.id)"
              :aria-expanded="expandedIds.includes(performance.id)"
            >
              <div class="history-row__date-block">
                <span class="history-row__month">{{ formatMonth(performance.date) }}</span>
                <span class="history-row__day">{{ formatDay(performance.date) }}</span>
                <span class="history-row__year">{{ formatYear(performance.date) }}</span>
              </div>

              <div class="history-row__main">
                <span class="history-row__track">{{ performance.track_name }}</span>
                <span class="history-row__race">
                  Race {{ performance.race_num }} • {{ performance.race_type }}
                </span>
              </div>

              <div class="history-row__partner">
                <span class="history-row__partner-label">
                  {{ profile.type === 'horse' ? 'Jockey' : 'Horse' }}
                </span>
                <NuxtLink 
                  :to="`/${performance.partner_type}s/${performance.partner_id}`"
                  class="history-row__partner-name"
                  @click.stop
                >
                  {{ performance.partner_name }}
                </NuxtLink>
              </div>

              <div class="history-row__finish">
                <span class="history-row__finish-label">Finish</span>
                <span 
                  class="history-row__finish-value"
                  :class="`history-row__finish-value--${finishCategory(performance.finish_position)}`"
                  :data-place="performance.finish_position"
                >
                  {{ ordinal(performance.finish_position) }}
                </span>
              </div>

              <span 
                class="history-row__chevron" 
                :class="{ 'history-row__chevron--open': expandedIds.includes(performance.id) }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </button>

            <!-- Expanded Details -->
            <Transition name="accordion">
              <div class="history-row__body" v-if="expandedIds.includes(performance.id)">
                <div class="history-row__body-inner">
                  <div class="history-details">
                    <div class="history-detail">
                      <span class="history-detail__label">Post Time Odds</span>
                      <span class="history-detail__value">{{ formatOdds(performance.odds) }}</span>
                    </div>
                    <div class="history-detail">
                      <span class="history-detail__label">Purse</span>
                      <span class="history-detail__value">${{ performance.purse.toLocaleString() }}</span>
                    </div>
                    <div class="history-detail">
                      <span class="history-detail__label">Earnings</span>
                      <span class="history-detail__value history-detail__value--earnings">
                        ${{ performance.earnings.toLocaleString() }}
                      </span>
                    </div>
                  </div>

                  <div class="history-actions">
                    <NuxtLink 
                      :to="`/racedays/${performance.track_id}/${formatDateISO(performance.date)}`"
                      class="btn btn--outline btn--small"
                    >
                      View Full Race Card
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </Transition>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. Final CTA -->
    <section class="final-cta">
      <div class="container">
        <div class="final-cta__inner" v-reveal>
          <div class="final-cta__text">
            <h2 class="final-cta__title">Explore more insights</h2>
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
import { ref } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  }
})

const expandedIds = ref([])

const toggleRow = (id) => {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter(x => x !== id)
  } else {
    expandedIds.value.push(id)
  }
}

const finishCategory = (position) => {
  if (position === 1) return 'win'
  if (position === 2) return 'place'
  if (position === 3) return 'show'
  return 'other'
}

const ordinal = (n) => {
  if (!n) return '—'
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const formatMonth = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
}

const formatDay = (iso) => {
  const d = new Date(iso)
  return d.getDate()
}

const formatYear = (iso) => {
  const d = new Date(iso)
  return d.getFullYear()
}

const formatDateISO = (iso) => {
  return iso.slice(0, 10)
}

const formatOdds = (odds) => {
  if (!odds) return '—'
  const d = parseFloat(odds)
  if (!Number.isFinite(d)) return odds
  const f = Math.round(d * 2) / 2
  const whole = Math.floor(f)
  return f === whole ? `${whole}-1` : `${Math.round(f * 2)}-2`
}
</script>

<style lang="scss" scoped>
// .final-cta → components/_cta.scss. Profile-specific layout below.
.entity-profile { background-color: var(--bg-page); }

// ---- Hero: identity + HorseBrain record | career stats card ----------------
.profile-hero {
  padding-block: var(--section-pad-sm);
  padding-top: var(--space-8);   // first band under the header (no PageTitle)
  background-color: var(--bg-dark);
  color: var(--text-on-dark);
  border-bottom: 1px solid rgb(255 255 255 / 0.1);

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-7);

    @include up(lg) { grid-template-columns: 1.3fr 1fr; gap: var(--space-8); align-items: start; }
  }

  &__eyebrow {
    display: block;
    margin-bottom: var(--space-3);
    @include label-caps(var(--fs-2xs), 0.14em);
    color: var(--color-baby-blue);
  }

  &__name {
    margin-bottom: var(--space-2);
    font-size: var(--fs-4xl);
    line-height: 1;
    color: var(--color-white);
  }

  &__subtitle {
    margin-bottom: var(--space-7);
    font-size: var(--fs-md);
    color: var(--text-on-dark-muted);
  }
}

.bot-accuracy {
  padding: var(--space-5);
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: var(--radius-cut);
  background: rgb(255 255 255 / 0.04);
  backdrop-filter: blur(8px);

  @include up(md) { padding: var(--space-6); }

  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgb(255 255 255 / 0.1);
    font-size: var(--fs-sm);
    font-weight: 600;
    color: rgb(255 255 255 / 0.9);

    svg { color: var(--color-baby-blue); }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5) var(--space-4);
    margin-bottom: var(--space-5);

    @include up(sm) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  &__confidence {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-4);
    border-top: 1px solid rgb(255 255 255 / 0.1);

    &-label {
      @include label-caps(var(--fs-xs), 0.06em);
      color: var(--text-on-dark-muted);
    }
  }
}

.bot-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  &__value {
    @include heading-font;
    font-size: var(--fs-2xl);
    line-height: 1;
    color: var(--color-white);
  }

  &__label { @include label-caps; color: var(--text-on-dark-faint); }

  &__delta,
  &__context {
    font-size: var(--fs-xs);
    font-style: italic;
    color: var(--text-on-dark-muted);

    &--positive { font-style: normal; font-weight: 700; color: var(--color-fern-on-dark); }
    &--negative { font-style: normal; font-weight: 700; color: var(--color-live-light); }
  }
}

// Confidence badge on the dark hero (light-on-dark variants)
.confidence-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  @include label-caps(var(--fs-2xs), 0.08em);

  &--high {
    background-color: rgb(54 107 36 / 0.25);
    color: var(--color-fern-on-dark);
    box-shadow: inset 0 0 0 1px rgb(199 169 107 / 0.6);
  }
  &--medium { background-color: rgb(133 171 255 / 0.2); color: var(--color-baby-blue); }
  &--low { background-color: rgb(255 255 255 / 0.1); color: var(--text-on-dark-muted); }
}

.career-stats-card {
  position: relative;
  padding: var(--space-6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-cut);
  background-color: var(--color-cream);
  color: var(--color-espresso);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
  @include ornament-frame(20px, var(--color-brass), 0.6);

  @include up(md) { padding: var(--space-7); }

  &__title {
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-strong);
    font-size: var(--fs-lg);
    color: var(--color-espresso);
  }

  &__list { display: flex; flex-direction: column; gap: var(--space-3); }
}

.career-stat-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);

  &__label { @include label-caps(var(--fs-xs), 0.05em); color: var(--text-secondary); }

  &__value {
    @include heading-font;
    font-size: var(--fs-md);
    color: var(--color-espresso);
    text-align: right;
  }
}

// ---- Racing history accordion -----------------------------------------------
.racing-history { padding-block: var(--section-pad); }

.history-list { display: flex; flex-direction: column; gap: var(--space-3); }

.history-row {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-left-width: 4px;
  border-radius: var(--radius-cut-md);
  background-color: var(--surface);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--dur) ease, border-color var(--dur) ease;

  &--expanded {
    border-color: var(--color-baby-blue);
    box-shadow: 0 4px 12px rgb(133 171 255 / 0.15);
  }

  // finish-position colour code: gold / silver / bronze medals
  &--finish-win   { border-left-color: var(--gold); }
  &--finish-place { border-left-color: var(--silver); }
  &--finish-show  { border-left-color: var(--bronze); }
  &--finish-other { border-left-color: var(--text-secondary); }

  &__header {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      'date main'
      'date partner'
      'finish finish';
    align-items: center;
    gap: var(--space-2) var(--space-4);
    width: 100%;
    padding: var(--space-4) 56px var(--space-4) var(--space-4);
    color: inherit;
    text-align: left;
    transition: background-color var(--dur-fast) ease;

    @include hover { background: rgb(133 171 255 / 0.03); }
    &:focus-visible { outline-offset: -3px; }

    @include up(md) {
      display: flex;
      gap: var(--space-6);
      padding: var(--space-5) var(--space-6);
    }
  }

  &__date-block {
    grid-area: date;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    min-width: 60px;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--color-espresso);
    color: var(--color-white);
    line-height: 1;
  }

  &__month { margin-bottom: 2px; @include label-caps(0.65rem, 0.08em); color: var(--color-baby-blue); }
  &__day   { margin-bottom: 2px; @include heading-font; font-size: 1.5rem; }
  &__year  { font-size: var(--fs-2xs); opacity: 0.75; }

  &__main {
    grid-area: main;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__track { @include heading-font; font-size: var(--fs-md); color: var(--color-espresso); }
  &__race  { font-size: var(--fs-sm); color: var(--text-secondary); }

  &__partner {
    grid-area: partner;
    display: flex;
    flex-direction: column;
    gap: 2px;
    @include up(md) { min-width: 140px; }
  }

  &__partner-label,
  &__finish-label { @include label-caps(0.65rem, 0.06em); color: var(--text-secondary); }

  &__partner-name {
    align-self: flex-start;
    @include heading-font;
    font-size: 0.95rem;
    color: var(--color-blue-ink);
    transition: color var(--dur-fast) ease;
    @include hover { color: var(--color-espresso); text-decoration: underline; }
  }

  &__finish {
    grid-area: finish;
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-color);

    @include up(md) {
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 70px;
      padding-top: 0;
      border-top: 0;
    }
  }

  // Place number: circle — gold/silver/bronze for 1st-3rd via
  // [data-place] (components/_numbers.scss), flat espresso otherwise.
  &__finish-value {
    @include place-num(40px, 0.8rem);

    &[data-place='1'] { @include medal(gold); }
    &[data-place='2'] { @include medal(silver); }
    &[data-place='3'] { @include medal(bronze); }
  }

  &__chevron {
    position: absolute;
    top: var(--space-4);
    right: var(--space-3);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgb(133 171 255 / 0.12);
    color: var(--text-secondary);
    transition: transform var(--dur) ease, background var(--dur-fast) ease;

    @include up(md) { position: static; flex-shrink: 0; }

    &--open { transform: rotate(180deg); background: rgb(133 171 255 / 0.3); }
  }

  &__body { border-top: 1px solid var(--border-color); }

  &__body-inner {
    padding: var(--space-4);
    background: linear-gradient(to bottom, var(--color-inset-top), var(--color-inset));
    animation: hb-fade-down var(--dur) var(--ease-out);

    @include up(md) { padding: var(--space-5) var(--space-6) var(--space-6); }
  }
}

.history-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-cut-md);
  background: rgb(255 255 255 / 0.7);

  @include up(sm) { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: var(--space-5); }
}

.history-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label { @include label-caps; color: var(--text-secondary); }

  &__value {
    @include heading-font;
    font-size: var(--fs-md);
    color: var(--color-espresso);
    &--earnings { color: var(--color-fern); }
  }
}

.history-actions {
  display: flex;
  justify-content: flex-end;
  @include down(sm) { .btn { width: 100%; } }
}

// Breadcrumb eyebrow: HOME / HORSES / HORSE PROFILE
.profile-crumbs ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;

  li { display: inline-flex; align-items: center; gap: var(--space-2); }
  li + li::before { content: '/'; color: var(--text-on-dark-faint); }
}

.profile-crumbs__link {
  color: var(--text-on-dark-muted);
  transition: color var(--dur-fast) ease;
  @include hover { color: var(--color-white); }
}

.profile-crumbs__section { color: var(--text-on-dark-muted); }
.profile-crumbs__current { color: var(--color-baby-blue); }
</style>