<template>
  <div class="account-insights-page">
    <PageTitle title="Insights" :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'My Account', to: '/account' }, { label: 'Insights' }]" />
    <AccountNav />

    <section class="section section--alt account">
      <div class="container account__grid">

        <!-- Filters: one row above everything they change -->
        <div class="insights-filters account__welcome">
          <div class="form-field">
            <label class="form-label" for="ins-period">Period</label>
            <select id="ins-period" v-model="period" class="form-select">
              <option v-for="p in PERIODS" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
          <div v-if="ins.tracks?.length > 1" class="form-field">
            <label class="form-label" for="ins-track">Track</label>
            <select id="ins-track" v-model="track" class="form-select">
              <option value="">All tracks</option>
              <option v-for="t in ins.tracks" :key="t" :value="t">{{ trackName(t) }}</option>
            </select>
          </div>
          <p v-if="pending" class="insights-filters__status" role="status">Updating…</p>
        </div>

        <div v-if="error" class="form-alert form-alert--error account__welcome" role="alert">
          <p>We couldn’t load your insights. <button type="button" class="text-link" @click="refresh()">Try again</button></p>
        </div>

        <!-- Nothing to analyse yet -->
        <article v-else-if="!ins.racedays" class="account-card account-card--wide history-empty">
          <h2 class="account-card__title">{{ hasAnyHistory ? 'Nothing in this period' : 'No insights yet' }}</h2>
          <p v-if="hasAnyHistory">There are no bets for this period{{ track ? ' at this track' : '' }}. Try a longer period or all tracks.</p>
          <p v-else>
            Insights are built from the bets you log in your Raceday Programs. Log a few bets, settle them
            after each race, and your results will start to show here.
          </p>
          <div v-if="!hasAnyHistory" class="btn-group">
            <NuxtLink to="/TodayRaces" class="btn btn--primary">Today’s Races</NuxtLink>
          </div>
        </article>

        <template v-else>
          <!-- Small sample: say so up front -->
          <div v-if="ins.sample.small" class="form-alert form-alert--info account__welcome" role="note">
            <p>
              <strong>Early days.</strong>
              These figures are based on {{ ins.sample.settled }} settled bet{{ ins.sample.settled === 1 ? '' : 's' }}.
              With fewer than {{ SMALL_SAMPLE }}, a single result can swing the percentages a lot, so treat them as a rough guide.
            </p>
          </div>

          <!-- 1. Headline -->
          <article class="account-card account-card--wide" aria-labelledby="ins-head-title">
            <header class="account-card__head">
              <h2 id="ins-head-title" class="account-card__title">{{ scopeTitle }}</h2>
              <span class="account-card__meta">{{ rangeText }}</span>
            </header>

            <div class="insights-headline">
              <div class="insights-hero">
                <span class="insights-hero__label">Profit / loss</span>
                <span class="insights-hero__value" :class="netClass(ins.totals.net)">{{ formatMoney(ins.totals.net, { sign: true }) }}</span>
                <span class="insights-hero__sub">on {{ formatMoney(ins.totals.settledStake) }} settled</span>
              </div>
              <dl class="history-totals insights-stats">
                <div><dt>Return on stake</dt><dd :class="netClass(ins.totals.net)">{{ pct(ins.totals.roi, true) }}</dd></div>
                <div><dt>Strike rate</dt><dd>{{ pct(ins.totals.strikeRate) }}</dd></div>
                <div><dt>Won – lost</dt><dd>{{ ins.totals.won }}–{{ ins.totals.lost }}</dd></div>
                <div><dt>Staked</dt><dd>{{ formatMoney(ins.totals.staked) }}</dd></div>
                <div><dt>Returned</dt><dd>{{ formatMoney(ins.totals.returned) }}</dd></div>
                <div><dt>Racedays · races</dt><dd>{{ ins.racedays }} · {{ ins.racesPlayed }}</dd></div>
              </dl>
            </div>
            <p class="account-card__note">
              Profit, return and strike rate count settled bets only ({{ ins.sample.settled }} of {{ ins.totals.count }}).
              <template v-if="ins.sample.pending">{{ ins.sample.pending }} open bet{{ ins.sample.pending === 1 ? ' is' : 's are' }} left out until you settle {{ ins.sample.pending === 1 ? 'it' : 'them' }}.</template>
            </p>
          </article>

          <!-- 2. Running total -->
          <article class="account-card account-card--wide" aria-labelledby="ins-chart-title">
            <header class="account-card__head">
              <h2 id="ins-chart-title" class="account-card__title">Running profit / loss</h2>
              <span class="account-card__meta">by raceday</span>
            </header>
            <RunningTotalChart v-if="ins.days.length > 1" :days="ins.days" :track-name="trackName" />
            <p v-else class="account-card__intro">The chart appears once you have two or more racedays in this period.</p>

            <details class="insights-table-toggle">
              <summary>Raceday by raceday</summary>
              <div class="insights-table-wrap">
                <table class="insights-table">
                  <thead><tr><th scope="col">Date</th><th scope="col">Track</th><th scope="col" class="num">Bets</th><th scope="col" class="num">Staked</th><th scope="col" class="num">Day</th><th scope="col" class="num">Running</th></tr></thead>
                  <tbody>
                    <tr v-for="d in [...ins.days].reverse()" :key="`${d.trackId}-${d.date}`">
                      <td><NuxtLink class="text-link" :to="`/program/${d.trackId}/${d.date}`">{{ fmtDate(d.date) }}</NuxtLink></td>
                      <td>{{ trackName(d.trackId) }}</td>
                      <td class="num">{{ d.bets }}</td>
                      <td class="num">{{ formatMoney(d.staked) }}<span v-if="d.overBudget" class="insights-flag" title="Over this day’s budget"> over budget</span></td>
                      <td class="num" :class="netClass(d.net)">{{ d.settled ? formatMoney(d.net, { sign: true }) : '—' }}</td>
                      <td class="num" :class="netClass(d.cumulative)">{{ formatMoney(d.cumulative, { sign: true }) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </article>

          <!-- 3. HorseBrain picks vs your own -->
          <article class="account-card account-card--wide" aria-labelledby="ins-source-title">
            <header class="account-card__head">
              <h2 id="ins-source-title" class="account-card__title">Following HorseBrain vs your own picks</h2>
            </header>
            <div class="insights-compare">
              <div v-for="side in sources" :key="side.key" class="insights-compare__side">
                <h3 class="insights-compare__title">{{ side.title }}</h3>
                <p class="insights-compare__hint">{{ side.hint }}</p>
                <template v-if="side.s.count">
                  <span class="insights-compare__net" :class="netClass(side.s.net)">{{ formatMoney(side.s.net, { sign: true }) }}</span>
                  <dl class="insights-compare__stats">
                    <div><dt>Bets</dt><dd>{{ side.s.count }}</dd></div>
                    <div><dt>Strike rate</dt><dd>{{ pct(side.s.strikeRate) }}</dd></div>
                    <div><dt>Return</dt><dd :class="netClass(side.s.net)">{{ pct(side.s.roi, true) }}</dd></div>
                  </dl>
                </template>
                <p v-else class="insights-compare__empty">No bets yet.</p>
              </div>
            </div>
            <p class="account-card__note">
              A bet counts as “HorseBrain” when you add it with <strong>+ Bet</strong> from one of our picks in the Raceday Program.
            </p>
          </article>

          <!-- 4. By bet type -->
          <article class="account-card account-card--wide" aria-labelledby="ins-type-title">
            <header class="account-card__head">
              <h2 id="ins-type-title" class="account-card__title">By bet type</h2>
            </header>
            <BreakdownTable :rows="ins.byType" label="Bet type" :label-of="r => r.label" />
          </article>

          <!-- 5. By track + by month -->
          <article class="account-card" aria-labelledby="ins-track-title">
            <header class="account-card__head">
              <h2 id="ins-track-title" class="account-card__title">By track</h2>
            </header>
            <BreakdownTable :rows="ins.byTrack" label="Track" :label-of="r => trackName(r.key)" compact />
          </article>
          <article class="account-card" aria-labelledby="ins-month-title">
            <header class="account-card__head">
              <h2 id="ins-month-title" class="account-card__title">By month</h2>
            </header>
            <BreakdownTable :rows="[...ins.byMonth].reverse()" label="Month" :label-of="r => fmtMonth(r.key)" compact />
          </article>

          <!-- 6. Highlights, good and bad together -->
          <article class="account-card account-card--wide" aria-labelledby="ins-high-title">
            <header class="account-card__head">
              <h2 id="ins-high-title" class="account-card__title">Highlights</h2>
            </header>
            <dl class="insights-highlights">
              <div v-if="ins.best">
                <dt>Best raceday</dt>
                <dd><span class="is-up">{{ formatMoney(ins.best.net, { sign: true }) }}</span> · {{ trackName(ins.best.trackId) }}, {{ fmtDate(ins.best.date) }}</dd>
              </div>
              <div v-if="ins.worst">
                <dt>Toughest raceday</dt>
                <dd><span :class="netClass(ins.worst.net)">{{ formatMoney(ins.worst.net, { sign: true }) }}</span> · {{ trackName(ins.worst.trackId) }}, {{ fmtDate(ins.worst.date) }}</dd>
              </div>
              <div v-if="ins.biggestWin">
                <dt>Biggest single return</dt>
                <dd>
                  {{ formatMoney(ins.biggestWin.payout) }} from a {{ formatMoney(ins.biggestWin.stake) }} {{ ins.biggestWin.label }}
                  ({{ ins.biggestWin.selection.join('–') }}) · {{ trackName(ins.biggestWin.trackId) }} R{{ ins.biggestWin.race }}, {{ fmtDate(ins.biggestWin.date) }}
                </dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd v-if="ins.budget.daysWithBudget">
                  You set a budget on {{ ins.budget.daysWithBudget }} of {{ ins.budget.racedays }} racedays
                  and went over it on {{ ins.budget.daysOver }}.
                </dd>
                <dd v-else>
                  You haven’t set a daily budget yet. Setting one in each Raceday Program helps keep a day at the
                  races fun.
                </dd>
              </div>
            </dl>
          </article>
        </template>

        <p class="program-disclaimer account__welcome">
          Your figures come from the bets and payouts you enter. Past results don’t predict future ones.
          Only bet what you can afford to lose. If gambling stops being fun, call the National Problem
          Gambling Helpline at <a href="tel:1-800-522-4700">1-800-522-4700</a>.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import AccountNav from '~/components/account/AccountNav.vue'
import RunningTotalChart from '~/components/account/RunningTotalChart.vue'
import BreakdownTable from '~/components/account/BreakdownTable.vue'
import tracksData from '~/data/tracks.json'
import { formatMoney } from '#shared/program-rules.js'
import { PERIODS, SMALL_SAMPLE } from '#shared/insights-rules.js'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()

// Filters live in the URL so a view can be bookmarked or shared
const period = ref(PERIODS.some(p => p.id === route.query.period) ? route.query.period : 'all')
const track = ref(typeof route.query.track === 'string' ? route.query.track : '')
watch([period, track], ([p, t]) => {
  router.replace({ query: { ...(p !== 'all' ? { period: p } : {}), ...(t ? { track: t } : {}) } })
})

const { data, pending, error, refresh } = await useFetch('/api/insights', {
  query: computed(() => ({ period: period.value, ...(track.value ? { track: track.value } : {}) })),
  key: 'account-insights'
})
const ins = computed(() => data.value || { racedays: 0, tracks: [] })
const hasAnyHistory = computed(() => (ins.value.tracks || []).length > 0)

// ---- Formatting ------------------------------------------------------
const TRACKS = Object.fromEntries((tracksData.tracks || []).map(t => [t.id, t.name]))
const trackName = (id) => TRACKS[id] || id
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const fmtMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
const netClass = (n) => (n > 0 ? 'is-up' : n < 0 ? 'is-down' : '')
const pct = (v, sign = false) => (v === null || v === undefined ? '—' : `${sign && v > 0 ? '+' : ''}${v}%`)

const scopeTitle = computed(() => {
  const p = PERIODS.find(x => x.id === period.value)?.label || 'All time'
  return track.value ? `${trackName(track.value)} · ${p}` : p
})
const rangeText = computed(() => {
  const r = ins.value.range
  if (!r) return ''
  return r.first === r.last ? fmtDate(r.first) : `${fmtDate(r.first)} – ${fmtDate(r.last)}`
})

const sources = computed(() => [
  { key: 'hb', title: 'HorseBrain picks', hint: 'Bets you added from our picks', s: ins.value.followed },
  { key: 'own', title: 'Your own picks', hint: 'Bets you entered yourself', s: ins.value.own }
])

useHead({ title: 'Insights | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
