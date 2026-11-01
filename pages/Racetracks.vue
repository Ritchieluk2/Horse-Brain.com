<template>
  <div class="racetracks-page">
    <PageTitle title="Racetracks" />

    <CurrentlyRacingTicker />

    <section class="all-tracks-section">
      <div class="container">
        <div class="section-header" v-reveal>
          <div class="section-header__text">
            <h2 class="section-title">All Supported Racetracks</h2>
            <p class="section-subtitle">Every track we cover, its next race day, and how our picks have performed there.</p>
          </div>

          <div class="sort-controls">
            <label for="track-sort">Sort by:</label>
            <select id="track-sort" v-model="sortBy" class="sort-select">
              <option value="alphabetical">Alphabetical</option>
              <option value="nextRace">Next race day</option>
              <option value="winRate">Our win rate</option>
            </select>
          </div>
        </div>

        <!-- Site-wide baseline every track panel compares against -->
        <p class="tracks-average" v-reveal>
          <span class="tracks-average__label">HorseBrain, all tracks</span>
          <span><strong>{{ average.winRate.toFixed(1) }}%</strong> win rate</span>
          <span><strong>{{ signed(average.roi) }}%</strong> ROI</span>
          <span><strong>{{ average.picks.toLocaleString() }}</strong> picks</span>
        </p>

        <div class="track-rows" v-reveal.stagger>
          <article v-for="row in sortedRows" :key="row.track.id" class="track-row">
            <!-- Left: the track, like a Race Schedule card -->
            <div class="track-row__visual">
              <img :src="row.track.background" alt="" class="track-row__bg" loading="lazy" />
              <div class="track-row__overlay" aria-hidden="true"></div>

              <div class="track-row__content">
                <img :src="row.track.logo" :alt="`${row.track.name} logo`" class="track-row__logo" loading="lazy" />

                <div class="track-row__details">
                  <span class="track-row__dateplate" :class="{ 'is-none': !row.next }">
                    {{ row.next ? `Next: ${row.next.fullDate}` : 'No race day scheduled' }}
                  </span>
                  <h3 class="track-row__name">
                    <NuxtLink :to="`/racetracks/${row.track.id}`">{{ row.track.name }}</NuxtLink>
                  </h3>
                  <p class="track-row__location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ row.track.location }}
                  </p>

                  <dl class="track-row__stats">
                    <div v-if="row.next"><dt>Races</dt><dd>{{ row.next.overview.total_races }}</dd></div>
                    <div v-if="row.next"><dt>First post</dt><dd>{{ row.next.overview.first_post }}</dd></div>
                    <div><dt>Surface</dt><dd>{{ row.track.surface }}</dd></div>
                    <div><dt>Since</dt><dd>{{ row.track.established }}</dd></div>
                  </dl>

                  <div class="track-row__actions">
                    <NuxtLink :to="`/racetracks/${row.track.id}`" class="btn btn--primary btn--small">Track Profile</NuxtLink>
                    <NuxtLink v-if="row.next" :to="row.next.path" class="btn btn--secondary btn--small">{{ row.next.shortDate }} Card</NuxtLink>
                    <ProgramLink v-if="row.next" small :track="row.track.id" :date="row.next.dateISO" label="Program" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: our record at this track vs the all-track average -->
            <aside class="track-perf" :aria-label="`HorseBrain performance at ${row.track.name}`">
              <span class="track-perf__frame" aria-hidden="true"></span>
              <i class="track-perf__corner track-perf__corner--tl" aria-hidden="true"></i>
              <i class="track-perf__corner track-perf__corner--br" aria-hidden="true"></i>

              <div class="track-perf__header">
                <span class="track-perf__label">HorseBrain here</span>
                <span class="track-perf__verdict" :class="`is-${row.verdict.tone}`">{{ row.verdict.text }}</span>
              </div>

              <div v-for="m in row.metrics" :key="m.key" class="track-perf__metric">
                <div class="track-perf__metric-top">
                  <span class="track-perf__metric-name">{{ m.name }}</span>
                  <span class="track-perf__metric-value">{{ m.display }}</span>
                  <span class="track-perf__delta" :class="m.delta >= 0 ? 'is-up' : 'is-down'">
                    {{ m.delta >= 0 ? '▲' : '▼' }} {{ Math.abs(m.delta).toFixed(1) }} pts
                  </span>
                </div>
                <!-- this track (fill) against the all-track average (tick) -->
                <div class="track-perf__bar" role="img" :aria-label="`${m.name} ${m.display}, all-track average ${m.avgDisplay}`">
                  <span class="track-perf__fill" data-fill :style="{ width: `${m.pct}%` }"></span>
                  <span class="track-perf__avg" :style="{ left: `${m.avgPct}%` }" aria-hidden="true"></span>
                </div>
                <span class="track-perf__avg-label">Avg {{ m.avgDisplay }}</span>
              </div>

              <div class="track-perf__footer">
                <span><strong>{{ row.track.botStats.totalPicks }}</strong> picks</span>
                <span class="confidence" :class="`confidence--${row.track.botStats.avgConfidence}`">{{ confidenceLabel(row.track.botStats.avgConfidence) }} avg confidence</span>
              </div>
            </aside>
          </article>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter-cta">
      <div class="container">
        <div class="newsletter-cta__content" v-reveal>
          <h2 class="newsletter-cta__title">Get Picks for Your Track</h2>
          <p class="newsletter-cta__text">
            Our top algorithmic picks for every track we cover, in your inbox each morning before first post.
          </p>
          <form class="newsletter-cta__form" @submit.prevent="subscribed = true">
            <label for="tracks-email" class="visually-hidden">Email address</label>
            <input
              id="tracks-email"
              v-model="email"
              type="email"
              placeholder="Enter your email address"
              class="newsletter-cta__input"
              required
            />
            <button type="submit" class="btn btn--primary">Subscribe</button>
          </form>
          <p class="newsletter-cta__privacy" role="status">
            {{ subscribed ? "Thanks! Sign-ups go live with the newsletter launch." : 'No spam. Unsubscribe anytime. Just data.' }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import CurrentlyRacingTicker from '~/components/CurrentlyRacingTicker.vue'
import ProgramLink from '~/components/program/ProgramLink.vue'
import tracksData from '~/data/tracks.json'
import { useRacedays } from '~/composables/useRacedays'

const { getNextRacedayForTrack } = useRacedays()

const sortBy = ref('alphabetical')
const email = ref('')
const subscribed = ref(false)

const tracks = tracksData.tracks

// All-track baseline, weighted by number of picks at each track
const average = computed(() => {
  const picks = tracks.reduce((n, t) => n + (t.botStats?.totalPicks || 0), 0) || 1
  const w = (key) => tracks.reduce((n, t) => n + (t.botStats?.[key] || 0) * (t.botStats?.totalPicks || 0), 0) / picks
  return { winRate: w('winRate'), roi: w('roi'), picks }
})

// Bars share one scale per metric so tracks can be compared row to row
const scale = computed(() => ({
  winRate: Math.max(...tracks.map(t => t.botStats?.winRate || 0), average.value.winRate) * 1.15,
  roi: Math.max(...tracks.map(t => Math.max(0, t.botStats?.roi || 0)), average.value.roi) * 1.15
}))

const signed = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}`
const confidenceLabel = (c) => ({ high: 'High', medium: 'Medium', low: 'Low' }[c] || c)
const pct = (v, max) => Math.max(0, Math.min(100, (v / max) * 100))

const rows = computed(() => tracks.map(track => {
  const s = track.botStats || {}
  const avg = average.value
  const winDelta = (s.winRate || 0) - avg.winRate
  const roiDelta = (s.roi || 0) - avg.roi
  const tone = winDelta >= 1 ? 'up' : winDelta <= -1 ? 'down' : 'even'
  return {
    track,
    next: getNextRacedayForTrack(track.id),
    verdict: {
      tone,
      text: tone === 'up' ? 'Above our average' : tone === 'down' ? 'Below our average' : 'On our average'
    },
    metrics: [
      {
        key: 'win', name: 'Win rate', display: `${(s.winRate || 0).toFixed(1)}%`, delta: winDelta,
        pct: pct(s.winRate || 0, scale.value.winRate), avgPct: pct(avg.winRate, scale.value.winRate),
        avgDisplay: `${avg.winRate.toFixed(1)}%`
      },
      {
        key: 'roi', name: 'ROI', display: `${signed(s.roi || 0)}%`, delta: roiDelta,
        pct: pct(s.roi || 0, scale.value.roi), avgPct: pct(avg.roi, scale.value.roi),
        avgDisplay: `${signed(avg.roi)}%`
      }
    ]
  }
}))

const sortedRows = computed(() => {
  const list = [...rows.value]
  if (sortBy.value === 'nextRace') {
    // soonest race day first; tracks with none go last
    return list.sort((a, b) => (a.next?.dateISO || '9999').localeCompare(b.next?.dateISO || '9999'))
  }
  if (sortBy.value === 'winRate') {
    return list.sort((a, b) => (b.track.botStats?.winRate || 0) - (a.track.botStats?.winRate || 0))
  }
  return list.sort((a, b) => a.track.name.localeCompare(b.track.name))
})
</script>

<style lang="scss" scoped>
// Newsletter band → components/_cta.scss (.newsletter-cta)
.racetracks-page { background-color: var(--bg-page); }

.all-tracks-section { padding-block: var(--section-pad); }

// Title left, sort control right (stacks on phones)
.section-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
  text-align: left;

  @include up(md) { flex-direction: row; align-items: flex-end; justify-content: space-between; }

  .section-title { text-align: left; margin-bottom: var(--space-1); }
  .section-subtitle { margin: 0; text-align: left; }
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;

  label {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
  }
}

.sort-select {
  min-height: 44px;
  padding: 8px 36px 8px 14px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background-color: var(--surface);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: border-color var(--dur-fast) ease;

  &:focus { outline: none; border-color: var(--color-baby-blue); box-shadow: 0 0 0 3px rgb(133 171 255 / 0.3); }
}

// All-track baseline strip
.tracks-average {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-5);
  margin: 0 0 var(--space-6);
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-brass);
  background: var(--premium-bg);
  font-size: var(--fs-sm);
  color: var(--color-espresso);

  strong { @include heading-font; font-size: var(--fs-md); }
}

.tracks-average__label { @include label-caps(var(--fs-2xs), 0.1em); color: var(--color-brass-ink); }

// ---- One full-width row per track ---------------------------------------
.track-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.track-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  @include mixed-cut(var(--radius-lg));
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);

  @include up(lg) { grid-template-columns: minmax(0, 1fr) 340px; }
}

// Photo side (Race Schedule card language)
.track-row__visual {
  position: relative;
  min-height: 300px;
  isolation: isolate;
  color: var(--color-white);

  @include up(md) { min-height: 320px; }
}

.track-row__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out);
}

.track-row__overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to top, rgb(29 28 33 / 0.92) 0%, rgb(29 28 33 / 0.55) 55%, rgb(29 28 33 / 0.25) 100%);

  @include up(md) {
    background: linear-gradient(to right, rgb(29 28 33 / 0.92) 0%, rgb(29 28 33 / 0.7) 45%, rgb(29 28 33 / 0.2) 100%);
  }
}

.track-row:hover .track-row__bg { transform: scale(1.03); }

.track-row__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-5);
  height: 100%;
  padding: var(--space-5);

  @include up(md) { padding: var(--space-6) var(--space-7); }
}

.track-row__logo {
  align-self: flex-start;
  max-width: 150px;
  max-height: 52px;
  padding: 4px 10px;
  object-fit: contain;
  border: 1px solid rgb(255 255 255 / 0.15);
  border-radius: var(--radius-plate);
  background: rgb(255 255 255 / 0.9);
}

.track-row__dateplate {
  display: inline-block;
  margin-bottom: var(--space-3);
  padding: 6px 14px;
  background: var(--color-fern);
  color: var(--color-white);
  @include label-caps(var(--fs-2xs), 0.12em);

  &.is-none { background: rgb(255 255 255 / 0.16); color: var(--text-on-dark-muted); }
}

.track-row__name {
  margin: 0 0 var(--space-1);
  font-size: clamp(1.8rem, 1.2rem + 2.4vw, 3rem);
  line-height: 1.05;

  a { color: var(--color-white); @include hover { text-decoration: underline; text-underline-offset: 6px; } }
}

.track-row__location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 var(--space-4);
  font-size: var(--fs-sm);
  color: var(--text-on-dark-muted);

  svg { color: var(--color-baby-blue); }
}

.track-row__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  margin: 0 0 var(--space-5);

  dt { @include label-caps(var(--fs-2xs), 0.1em); color: var(--text-on-dark-muted); margin-bottom: 2px; }
  dd { margin: 0; @include heading-font; font-size: var(--fs-md); color: var(--color-white); }
}

.track-row__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
}

// Performance side panel (cream paper + the frame, like the Our Pick panel)
.track-perf {
  @include frame(16px);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  @include paper;
  border-top: 1px solid var(--border-color);

  @include up(lg) { border-top: 0; border-left: 1px solid var(--border-color); padding: var(--space-6); }

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  &__label { @include label-caps(var(--fs-2xs), 0.12em); color: var(--color-espresso); }

  &__verdict {
    padding: 3px 10px;
    border-radius: var(--radius-label);
    @include label-caps(var(--fs-2xs), 0.06em);

    &.is-up { background: var(--confidence-high-bg); color: var(--color-fern); }
    &.is-down { background: var(--status-live-bg); color: var(--color-live-ink); }
    &.is-even { background: var(--confidence-low-bg); color: var(--confidence-low); }
  }

  &__metric { display: flex; flex-direction: column; gap: 6px; }

  &__metric-top { display: flex; align-items: baseline; gap: var(--space-3); }
  &__metric-name { @include label-caps(var(--fs-2xs), 0.08em); color: var(--text-secondary); min-width: 5.5em; }
  &__metric-value { @include heading-font; font-size: var(--fs-xl); color: var(--color-espresso); font-variant-numeric: tabular-nums; }

  &__delta {
    margin-left: auto;
    font-size: var(--fs-xs);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    &.is-up { color: var(--color-fern); }
    &.is-down { color: var(--color-live-ink); }
  }

  &__bar {
    position: relative;
    height: 8px;
    border-radius: 4px;
    background: rgb(69 32 26 / 0.1);
  }

  &__fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 4px;
    background: linear-gradient(to right, var(--color-fern), var(--color-fern-bright));
  }

  // the all-track average: a short espresso tick across the bar
  &__avg {
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 2px;
    margin-left: -1px;
    border-radius: 1px;
    background: var(--color-espresso);
  }

  &__avg-label { font-size: var(--fs-2xs); color: var(--text-secondary); font-variant-numeric: tabular-nums; }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-top: auto;
    padding-top: var(--space-3);
    border-top: 1px solid rgb(139 119 90 / 0.2);
    font-size: var(--fs-sm);
    color: var(--color-espresso);
  }
}

// Newsletter band follows straight on from the list
.newsletter-cta { margin-top: 0; }
</style>
