<template>
  <div class="account-programs-page">
    <PageTitle title="Program History" :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'My Account', to: '/account' }, { label: 'Program History' }]" />
    <AccountNav />

    <section class="section section--alt account">
      <div class="container account__grid account__grid--wide">

        <div v-if="importedPrograms" class="form-alert form-alert--success account__welcome program-account__notice" role="status">
          <p>
            <strong>Programs moved to your account.</strong>
            {{ importedPrograms === 1 ? 'The program' : `${importedPrograms} programs` }} you filled in on this browser
            {{ importedPrograms === 1 ? 'is' : 'are' }} now saved below.
          </p>
          <button type="button" class="btn btn--text btn--small" @click="importedPrograms = 0">Dismiss</button>
        </div>

        <div v-if="error" class="form-alert form-alert--error account__welcome" role="alert">
          <p>We couldn’t load your programs. <button type="button" class="text-link" @click="refreshList()">Try again</button></p>
        </div>

        <!-- Empty state -->
        <article v-else-if="!pending && !programs.length" class="account-card account-card--wide history-empty">
          <h2 class="account-card__title">No programs yet</h2>
          <p>
            Open the Raceday Program for any race day, mark your contenders and log your bets.
            Each program you fill in shows up here, with what you staked, what came back and your
            profit or loss.
          </p>
          <div class="btn-group">
            <NuxtLink to="/TodayRaces" class="btn btn--primary">Today’s Races</NuxtLink>
            <NuxtLink to="/Racetracks" class="btn btn--outline">Browse Racetracks</NuxtLink>
          </div>
        </article>

        <template v-else-if="programs.length">
          <!-- All-time totals -->
          <article class="account-card account-card--wide" aria-labelledby="history-totals-title">
            <header class="account-card__head">
              <h2 id="history-totals-title" class="account-card__title">{{ trackFilter ? trackName(trackFilter) : 'All racedays' }}</h2>
              <span class="account-card__meta">
                {{ shown.length }} raceday{{ shown.length === 1 ? '' : 's' }}<template v-if="range"> · {{ range }}</template>
              </span>
            </header>

            <dl class="history-totals">
              <div><dt>Staked</dt><dd>{{ formatMoney(totals.staked) }}</dd></div>
              <div><dt>Returned</dt><dd>{{ formatMoney(totals.returned) }}</dd></div>
              <div><dt>Profit / loss</dt><dd :class="netClass(totals.net)">{{ formatMoney(totals.net, { sign: true }) }}</dd></div>
              <div><dt>Return on stake</dt><dd :class="netClass(totals.net)">{{ totals.roi === null ? '—' : `${totals.roi > 0 ? '+' : ''}${totals.roi}%` }}</dd></div>
              <div><dt>Won – lost</dt><dd>{{ totals.won }}–{{ totals.lost }}</dd></div>
              <div><dt>Open bets</dt><dd>{{ totals.pending }}</dd></div>
            </dl>
            <p class="account-card__note">
              Profit, loss and return count settled bets only ({{ totals.won + totals.lost }} of {{ totals.count }}).
              <template v-if="totals.followedCount">
                {{ totals.followedCount }} bet{{ totals.followedCount === 1 ? '' : 's' }} followed HorseBrain picks:
                <strong :class="netClass(totals.followedNet)">{{ formatMoney(totals.followedNet, { sign: true }) }}</strong>.
              </template>
            </p>
          </article>

          <!-- Filter -->
          <div v-if="trackOptions.length > 1" class="history-filter account__welcome">
            <label class="form-label" for="history-track">Track</label>
            <select id="history-track" v-model="trackFilter" class="form-select">
              <option value="">All tracks</option>
              <option v-for="t in trackOptions" :key="t" :value="t">{{ trackName(t) }}</option>
            </select>
          </div>

          <!-- One row per raceday -->
          <ol class="history-list account__welcome" role="list">
            <li v-for="p in shown" :key="`${p.trackId}-${p.date}`" class="history-row">
              <div class="history-row__when">
                <span class="history-row__date">{{ fmtDate(p.date) }}</span>
                <span class="history-row__track">{{ trackName(p.trackId) }}</span>
              </div>

              <dl class="history-row__figures">
                <div><dt>Races</dt><dd>{{ p.summary.racesPlayed }}</dd></div>
                <div><dt>Bets</dt><dd>{{ p.summary.count }}<small v-if="p.summary.pending"> · {{ p.summary.pending }} open</small></dd></div>
                <div><dt>Staked</dt><dd>{{ formatMoney(p.summary.staked) }}</dd></div>
                <div><dt>Returned</dt><dd>{{ p.summary.won + p.summary.lost ? formatMoney(p.summary.returned) : '—' }}</dd></div>
                <div class="history-row__net"><dt>P / L</dt><dd :class="netClass(p.summary.net)">{{ p.summary.won + p.summary.lost ? formatMoney(p.summary.net, { sign: true }) : '—' }}</dd></div>
              </dl>

              <div class="history-row__actions">
                <NuxtLink :to="`/program/${p.trackId}/${p.date}`" class="btn btn--dark btn--small">Open Program</NuxtLink>
                <button
                  type="button"
                  class="btn btn--text btn--small history-row__delete"
                  :disabled="deleting === key(p)"
                  @click="confirmDelete === key(p) ? remove(p) : (confirmDelete = key(p))"
                  @blur="confirmDelete = confirmDelete === key(p) ? '' : confirmDelete"
                >{{ confirmDelete === key(p) ? 'Tap again to delete' : 'Delete' }}</button>
              </div>
            </li>
          </ol>
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
import { ref, computed } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import AccountNav from '~/components/account/AccountNav.vue'
import tracksData from '~/data/tracks.json'
import { formatMoney } from '#shared/program-rules.js'

definePageMeta({ middleware: 'auth' })

const { importedPrograms } = useAuth()

const { data, pending, error, refresh: refreshList } = await useFetch('/api/programs', {
  key: 'account-programs',
  default: () => ({ programs: [] })
})
const programs = computed(() => data.value?.programs || [])

// ---- Lookup + formatting ------------------------------------------------
const TRACKS = Object.fromEntries((tracksData.tracks || []).map(t => [t.id, t.name]))
const trackName = (id) => TRACKS[id] || id
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
const netClass = (n) => (n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-even')
const key = (p) => `${p.trackId}:${p.date}`

// ---- Filter + totals ----------------------------------------------------
const trackFilter = ref('')
const trackOptions = computed(() => [...new Set(programs.value.map(p => p.trackId))].sort((a, b) => trackName(a).localeCompare(trackName(b))))
const shown = computed(() => programs.value.filter(p => !trackFilter.value || p.trackId === trackFilter.value))

// Add up the per-day summaries (each already counts its own bets)
const totals = computed(() => {
  const t = { count: 0, staked: 0, settledStake: 0, returned: 0, won: 0, lost: 0, pending: 0, followedCount: 0, followedNet: 0 }
  for (const { summary: s } of shown.value) {
    for (const k of Object.keys(t)) t[k] += Number(s[k]) || 0
  }
  const net = t.returned - t.settledStake
  return { ...t, net, roi: t.settledStake ? Math.round((net / t.settledStake) * 100) : null }
})

const range = computed(() => {
  if (shown.value.length < 2) return ''
  const dates = shown.value.map(p => p.date).sort()
  return `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}`
})

// ---- Delete -------------------------------------------------------------
const confirmDelete = ref('')
const deleting = ref('')
async function remove(p) {
  deleting.value = key(p)
  try {
    await $fetch(`/api/programs/${p.trackId}/${p.date}`, { method: 'DELETE' })
    data.value = { programs: programs.value.filter(x => key(x) !== key(p)) }
  } catch {
    // leave it listed; the button stays usable
  } finally {
    deleting.value = ''
    confirmDelete.value = ''
  }
}

useHead({ title: 'Program History | HorseBrain', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
