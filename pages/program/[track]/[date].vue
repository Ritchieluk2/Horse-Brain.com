<template>
  <div v-if="!raceday" class="not-found container">
    <h2>Program not found</h2>
    <p>We don't have a Raceday Program for that track and date.</p>
    <NuxtLink to="/" class="btn btn--primary">Back to the schedule</NuxtLink>
  </div>

  <div v-else class="program-page">
    <!-- 1. Cover --------------------------------------------------------->
    <section class="program-cover">
      <div class="container">
        <div class="program-cover__inner">
          <span class="program-cover__frame" aria-hidden="true"></span>
          <i class="program-cover__corner program-cover__corner--tl" aria-hidden="true"></i>
          <i class="program-cover__corner program-cover__corner--br" aria-hidden="true"></i>

          <nav class="program-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><NuxtLink to="/">Home</NuxtLink></li>
              <li><NuxtLink :to="`/racetracks/${raceday.track_id}`">{{ raceday.track_name }}</NuxtLink></li>
              <li><NuxtLink :to="raceday.path">{{ raceday.shortDate }}</NuxtLink></li>
              <li><span aria-current="page">Program</span></li>
            </ol>
          </nav>

          <img v-if="raceday.circle" :src="raceday.circle" :alt="`${raceday.track_name} logo`" class="track-icon track-icon--circle program-cover__icon" />

          <div class="program-cover__eyebrow">
            <span class="program-cover__kicker">Raceday Program</span>
            <span class="program-cover__premium">Premium · free during preview</span>
          </div>

          <h1 class="program-cover__title">{{ raceday.track_name }}</h1>
          <p class="program-cover__date">{{ raceday.formatted_date }}</p>

          <dl class="program-cover__facts">
            <div><dt>Races</dt><dd>{{ raceday.overview.total_races }}</dd></div>
            <div><dt>First post</dt><dd>{{ raceday.overview.first_post }}</dd></div>
            <div><dt>Going</dt><dd>{{ raceday.going }}</dd></div>
            <div v-if="raceday.weather"><dt>Weather</dt><dd>{{ raceday.weather.condition }}, {{ raceday.weather.temperature }}</dd></div>
          </dl>

          <div class="program-cover__actions">
            <button type="button" class="btn btn--premium" @click="printProgram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>
              </svg>
              Print program
            </button>
            <NuxtLink :to="raceday.path" class="btn btn--secondary">Raceday overview</NuxtLink>
          </div>

          <p class="program-cover__how">
            Mark your contenders, log bets as you place them, and settle them after each race.
            Or print it and fill it in at the track.
            <template v-if="signedIn">Everything you enter is saved <strong>to your account</strong>.</template>
            <template v-else>Everything you enter is saved <strong>on this device only</strong> unless you
              <NuxtLink :to="{ path: '/sign-up', query: { redirect: route.fullPath } }">create a free account</NuxtLink>.</template>
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Sticky race bar + running total ---------------------------------->
    <nav class="program-bar" aria-label="Races">
      <div class="container program-bar__inner">
        <ol class="program-bar__races">
          <li v-for="race in raceday.races" :key="race.race_num">
            <a
              :href="`#race-${race.race_num}`"
              class="program-bar__race"
              :class="`program-bar__race--${race.status}`"
              @click.prevent="goTo(race.race_num)"
            >
              <span class="program-bar__race-num">R{{ race.race_num }}</span>
              <span class="program-bar__race-time">{{ postTime(race) }}</span>
            </a>
          </li>
          <li>
            <a href="#program-summary" class="program-bar__race program-bar__race--summary" @click.prevent="goTo('summary')">
              <span class="program-bar__race-num">Day</span>
              <span class="program-bar__race-time">Summary</span>
            </a>
          </li>
        </ol>
        <p class="program-bar__total" aria-live="polite">
          <span class="program-bar__total-label">Day</span>
          <strong :class="netClass(totals.net)">{{ formatMoney(totals.net, { sign: true }) }}</strong>
          <span class="program-bar__total-sub">{{ formatMoney(totals.staked) }} staked</span>
        </p>
      </div>
    </nav>

    <!-- 3. My day: scoreboard + budget ---------------------------------------->
    <section class="program-day">
      <div class="container">
        <ProgramAccountBar :program="program" />
        <div class="program-day__grid">
          <div class="program-score" v-reveal.stagger>
            <div class="program-score__item">
              <span class="program-score__label">Staked</span>
              <span class="program-score__value">{{ formatMoney(totals.staked) }}</span>
            </div>
            <div class="program-score__item">
              <span class="program-score__label">Returned</span>
              <span class="program-score__value">{{ formatMoney(totals.returned) }}</span>
            </div>
            <div class="program-score__item">
              <span class="program-score__label">Profit / loss</span>
              <span class="program-score__value" :class="netClass(totals.net)">{{ formatMoney(totals.net, { sign: true }) }}</span>
            </div>
            <div class="program-score__item">
              <span class="program-score__label">Won – lost</span>
              <span class="program-score__value">{{ totals.won }}–{{ totals.lost }}<small v-if="totals.pending"> · {{ totals.pending }} open</small></span>
            </div>
          </div>

          <div class="program-budget" v-reveal>
            <label class="program-budget__field">
              <span class="program-budget__label">Today's budget</span>
              <span class="program-money program-money--large">
                <span aria-hidden="true">$</span>
                <input
                  v-model.number="program.record.budget"
                  class="program-input"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="5"
                  placeholder="Set a limit"
                />
              </span>
            </label>
            <template v-if="program.record.budget">
              <div
                class="program-budget__meter"
                role="meter"
                :aria-valuenow="totals.staked"
                aria-valuemin="0"
                :aria-valuemax="program.record.budget"
                :aria-label="`${formatMoney(totals.staked)} of ${formatMoney(program.record.budget)} budget staked`"
              >
                <span class="program-budget__fill" :class="{ 'is-over': program.overBudget.value }" :style="{ width: `${program.budgetUsed.value}%` }"></span>
              </div>
              <p class="program-budget__status" :class="{ 'is-over': program.overBudget.value }">
                <template v-if="program.overBudget.value">
                  You've gone {{ formatMoney(totals.staked - program.record.budget) }} past the budget you set. It may be a good moment to stop for the day.
                </template>
                <template v-else>
                  {{ formatMoney(Math.max(0, program.record.budget - totals.staked)) }} left of {{ formatMoney(program.record.budget) }}
                </template>
              </p>
            </template>
            <p v-else class="program-budget__status">Optional. Decide what you can afford to lose before the first race.</p>
          </div>
        </div>

        <p v-if="program.mode.value === 'guest' && !program.storageOk.value" class="program-day__warning" role="status">
          This browser isn't letting us save, so your entries will be lost when you close the page.
        </p>
      </div>
    </section>

    <!-- 4. Race sheets -------------------------------------------------------->
    <section class="program-races">
      <div class="container">
        <ProgramRace
          v-for="race in raceday.races"
          :key="race.race_num"
          v-reveal
          :race="race"
          :program="program"
          :track-id="raceday.track_id"
          :date="raceday.dateISO"
        />
      </div>
    </section>

    <!-- 5. Day summary ------------------------------------------------------>
    <section id="program-summary" class="program-summary">
      <div class="container">
        <div class="program-summary__card" v-reveal>
          <h2 class="program-summary__title">Day Summary</h2>
          <p class="program-summary__budget-print" aria-hidden="true">
            Today's budget: <span>{{ program.record.budget ? formatMoney(program.record.budget) : '' }}</span>
          </p>
          <table class="program-summary__table">
            <thead>
              <tr>
                <th scope="col">Race</th>
                <th scope="col">Bets</th>
                <th scope="col">Staked</th>
                <th scope="col">Returned</th>
                <th scope="col">P / L</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="race in raceday.races" :key="race.race_num">
                <th scope="row">Race {{ race.race_num }}</th>
                <td>{{ raceSum(race).count || '' }}</td>
                <td>{{ raceSum(race).count ? formatMoney(raceSum(race).staked) : '' }}</td>
                <td>{{ raceSum(race).won + raceSum(race).lost ? formatMoney(raceSum(race).returned) : '' }}</td>
                <td :class="netClass(raceSum(race).net)">{{ raceSum(race).won + raceSum(race).lost ? formatMoney(raceSum(race).net, { sign: true }) : '' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Day</th>
                <td>{{ totals.count || '' }}</td>
                <td>{{ totals.count ? formatMoney(totals.staked) : '' }}</td>
                <td>{{ totals.won + totals.lost ? formatMoney(totals.returned) : '' }}</td>
                <td :class="netClass(totals.net)">{{ totals.won + totals.lost ? formatMoney(totals.net, { sign: true }) : '' }}</td>
              </tr>
            </tfoot>
          </table>

          <p v-if="followed.count" class="program-summary__followed">
            Bets that followed HorseBrain: <strong>{{ followed.count }}</strong>
            <template v-if="followed.won + followed.lost">
              · {{ followed.won }} won · <strong :class="netClass(followed.net)">{{ formatMoney(followed.net, { sign: true }) }}</strong>
            </template>
          </p>

          <div class="program-summary__actions">
            <button type="button" class="btn btn--outline btn--small" @click="printProgram">Print program</button>
            <button
              v-if="totals.count || hasNotes"
              type="button"
              class="btn btn--text btn--small program-summary__clear"
              @click="confirmClear ? clearAll() : (confirmClear = true)"
              @blur="confirmClear = false"
            >{{ confirmClear ? 'Tap again to clear everything' : 'Clear my bets & notes' }}</button>
          </div>
        </div>

        <p class="program-disclaimer">
          HorseBrain picks are statistical estimates, not guarantees, and past performance does not
          predict future results. Only bet what you can afford to lose. If gambling stops being fun,
          call the National Problem Gambling Helpline at <a href="tel:1-800-522-4700">1-800-522-4700</a>.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRacedays } from '~/composables/useRacedays'
import { useRacedayProgram, formatMoney } from '~/composables/useRacedayProgram'
import ProgramRace from '~/components/program/ProgramRace.vue'
import ProgramAccountBar from '~/components/program/ProgramAccountBar.vue'

const route = useRoute()
const { getRaceday } = useRacedays()
const { signedIn } = useAuth()

const raceday = computed(() => getRaceday(route.params.track, route.params.date))

// The composable is created once per page visit (track + date come from the URL)
const program = useRacedayProgram(String(route.params.track || ''), String(route.params.date || ''))

const totals = computed(() => program.totals.value)
const followed = computed(() => program.followedTotals.value)
const raceSum = (race) => program.raceTotals(race.race_num)
const hasNotes = computed(() => Object.values(program.record.races).some(r => r.notes))

const netClass = (n) => (n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-even')

function postTime(race) {
  const d = new Date(race.post_time)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function goTo(id) {
  const el = document.getElementById(id === 'summary' ? 'program-summary' : `race-${id}`)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${el.id}`)
}

function printProgram() {
  window.print()
}

const confirmClear = ref(false)
function clearAll() {
  program.resetAll()
  confirmClear.value = false
}

useHead(() => ({
  title: raceday.value
    ? `Raceday Program · ${raceday.value.track_name}, ${raceday.value.shortDate} | HorseBrain`
    : 'Program not found | HorseBrain'
}))
</script>

<!-- Styles: assets/scss/components/_program.scss -->
