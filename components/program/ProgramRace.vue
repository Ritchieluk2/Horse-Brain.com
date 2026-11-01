<template>
  <article
    :id="`race-${race.race_num}`"
    class="program-race"
    :class="`program-race--${race.status}`"
  >
    <span class="program-race__frame" aria-hidden="true"></span>
    <i class="program-race__corner program-race__corner--tl" aria-hidden="true"></i>
    <i class="program-race__corner program-race__corner--br" aria-hidden="true"></i>

    <!-- Race header ------------------------------------------------------>
    <header class="program-race__header">
      <div class="program-race__id">
        <span class="program-race__num"><small>Race</small>{{ race.race_num }}</span>
        <div class="program-race__heading">
          <h2 class="program-race__title">{{ race.race_type }}</h2>
          <p class="program-race__meta">
            {{ race.distance }} · {{ race.surface }}<template v-if="race.purse"> · Purse {{ formatMoney(race.purse).replace('.00', '') }}</template>
          </p>
        </div>
      </div>
      <div class="program-race__post">
        <span class="status-badge" :class="`status-badge--${race.status}`">{{ statusLabel }}</span>
        <span class="program-race__time">Post {{ postTime }}</span>
      </div>
    </header>

    <!-- Official result (completed races) -->
    <div v-if="finishOrder.length" class="program-race__result">
      <span class="program-race__result-label">Result</span>
      <span v-for="(pgm, i) in finishOrder.slice(0, 3)" :key="pgm" class="program-race__result-item">
        <span class="place-num" :data-place="i + 1" :title="ordinal(i + 1)">{{ i + 1 }}</span>
        <span class="horse-num" :data-pgm="pgm">{{ pgm }}</span>
        <span class="horse-name">{{ horseName(pgm) }}</span>
      </span>
    </div>

    <div class="program-race__grid">
      <!-- The field ----------------------------------------------------->
      <section class="program-field" :aria-label="`Race ${race.race_num} field`">
        <table class="program-field__table">
          <thead>
            <tr>
              <th scope="col" class="program-field__mine"><span title="Mark your contenders">Mine</span></th>
              <th scope="col">#</th>
              <th scope="col">Horse / Jockey</th>
              <th scope="col" class="program-field__ml">ML</th>
              <th scope="col" class="program-field__hb"><span class="program-field__hb-long">HorseBrain</span><abbr class="program-field__hb-short" title="HorseBrain confidence">HB</abbr></th>
              <th v-if="finishOrder.length" scope="col" class="program-field__fin">Fin</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in field"
              :key="p.program_number"
              :class="{ 'is-mine': isContender(p.program_number), 'is-pick': isBotPick(p.program_number) }"
            >
              <td class="program-field__mine">
                <label class="program-check">
                  <input
                    type="checkbox"
                    :checked="isContender(p.program_number)"
                    @change="program.toggleContender(race.race_num, p.program_number)"
                  />
                  <span class="program-check__box" aria-hidden="true"></span>
                  <span class="visually-hidden">Mark #{{ p.program_number }} {{ p.horse_name }} as a contender</span>
                </label>
              </td>
              <td><span class="horse-num" :data-pgm="p.program_number">{{ p.program_number }}</span></td>
              <td class="program-field__horse">
                <NuxtLink
                  v-if="p.horse_equibase_refid"
                  :to="`/horses/${p.horse_equibase_refid}`"
                  class="horse-name horse-link"
                >{{ p.horse_name }}</NuxtLink>
                <span v-else class="horse-name">{{ p.horse_name }}</span>
                <span class="jockey-name program-field__jockey">{{ p.jockey_name }}</span>
              </td>
              <td class="program-field__ml">{{ formatOdds(p.odds) }}</td>
              <td class="program-field__hb">
                <span
                  v-if="confidenceOf(p.program_number)"
                  class="confidence"
                  :class="`confidence--${confidenceOf(p.program_number)}`"
                >{{ confidenceShort(confidenceOf(p.program_number)) }}</span>
                <span v-else class="program-field__none">—</span>
              </td>
              <td v-if="finishOrder.length" class="program-field__fin">
                <span
                  v-if="p.finish_position"
                  class="place-num"
                  :data-place="p.finish_position"
                  :title="ordinal(p.finish_position)"
                >{{ p.finish_position }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- HorseBrain picks (premium) ----------------------------------->
      <aside v-if="picks.length" class="program-picks" aria-label="HorseBrain picks">
        <span class="program-picks__badge">HorseBrain Picks</span>
        <ul class="program-picks__list">
          <li v-for="pick in picks" :key="pick.key" class="program-picks__row">
            <span class="program-picks__label">{{ pick.label }}</span>
            <span class="program-picks__horses">
              <template v-for="(pgm, i) in pick.selection" :key="i">
                <span v-if="i" class="program-picks__sep" aria-hidden="true">–</span>
                <span class="horse-num" :data-pgm="pgm" :title="horseName(pgm)">{{ pgm }}</span>
              </template>
              <span v-if="pick.selection.length === 1" class="program-picks__name horse-name">{{ horseName(pick.selection[0]) }}</span>
            </span>
            <button
              type="button"
              class="program-picks__add"
              :aria-label="`Add a ${pick.betLabel} bet on ${pick.selection.join('-')}`"
              @click="addFromPick(pick)"
            >+ Bet</button>
          </li>
        </ul>
        <NuxtLink :to="analysisLink" class="program-picks__more">Full race analysis →</NuxtLink>
      </aside>
    </div>

    <!-- My bets (screen) ------------------------------------------------>
    <section class="program-bets" :aria-label="`My bets, race ${race.race_num}`">
      <div class="program-bets__header">
        <h3 class="program-bets__title">My Bets</h3>
        <p v-if="raceTotals.count" class="program-bets__subtotal">
          {{ raceTotals.count }} {{ raceTotals.count === 1 ? 'bet' : 'bets' }}
          · {{ formatMoney(raceTotals.staked) }} staked
          <template v-if="raceTotals.won + raceTotals.lost">
            · <strong :class="netClass(raceTotals.net)">{{ formatMoney(raceTotals.net, { sign: true }) }}</strong>
          </template>
        </p>
      </div>

      <ol v-if="bets.length" class="program-bets__list">
        <li v-for="bet in bets" :key="bet.id" class="bet-row" :class="`bet-row--${bet.status}`">
          <div class="bet-row__what">
            <label class="bet-row__field bet-row__field--type">
              <span class="bet-row__label">Bet</span>
              <select
                class="program-input"
                :value="bet.type"
                @change="program.updateBet(race.race_num, bet.id, { type: $event.target.value })"
              >
                <option v-for="t in BET_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
              </select>
            </label>

            <template v-if="bet.type !== 'other'">
              <label
                v-for="(leg, i) in bet.selection"
                :key="i"
                class="bet-row__field bet-row__field--leg"
              >
                <span class="bet-row__label">{{ legLabel(bet.type, i) }}</span>
                <select v-model="bet.selection[i]" class="program-input">
                  <option value="" disabled>Horse…</option>
                  <option v-for="p in field" :key="p.program_number" :value="String(p.program_number)">
                    #{{ p.program_number }} {{ p.horse_name }}
                  </option>
                </select>
              </label>
            </template>
            <label v-else class="bet-row__field bet-row__field--wide">
              <span class="bet-row__label">Details</span>
              <input v-model="bet.label" class="program-input" type="text" placeholder="e.g. Superfecta box 7-9-2-8" />
            </label>
          </div>

          <div class="bet-row__money">
            <label class="bet-row__field bet-row__field--stake">
              <span class="bet-row__label">Stake</span>
              <span class="program-money">
                <span aria-hidden="true">$</span>
                <input
                  v-model.number="bet.stake"
                  class="program-input"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="1"
                />
              </span>
            </label>

            <fieldset class="bet-row__status">
              <legend class="bet-row__label">Result</legend>
              <label v-for="s in STATUSES" :key="s.id" class="bet-status" :class="`bet-status--${s.id}`">
                <input
                  type="radio"
                  :name="`status-${bet.id}`"
                  :value="s.id"
                  :checked="bet.status === s.id"
                  @change="program.updateBet(race.race_num, bet.id, { status: s.id })"
                />
                <span>{{ s.label }}</span>
              </label>
            </fieldset>

            <label v-if="bet.status === 'won'" class="bet-row__field bet-row__field--payout">
              <span class="bet-row__label">Returned</span>
              <span class="program-money">
                <span aria-hidden="true">$</span>
                <input
                  v-model.number="bet.payout"
                  class="program-input"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                />
              </span>
            </label>

            <span v-if="bet.status !== 'pending'" class="bet-row__net" :class="netClass(betNet(bet))">
              {{ formatMoney(betNet(bet), { sign: true }) }}
            </span>

            <button
              type="button"
              class="bet-row__remove"
              :aria-label="`Remove this ${betType(bet.type).label} bet`"
              @click="program.removeBet(race.race_num, bet.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <span v-if="bet.source === 'horsebrain'" class="bet-row__source">Following HorseBrain</span>
        </li>
      </ol>
      <p v-else class="program-bets__empty">No bets on this race yet. Add your own, or tap <strong>+ Bet</strong> on one of our picks.</p>

      <div class="program-bets__actions">
        <button type="button" class="btn btn--outline btn--small" @click="program.addBet(race.race_num)">+ Add a bet</button>
        <button
          v-if="finishOrder.length && pendingCount"
          type="button"
          class="btn btn--text btn--small"
          @click="checkResult"
        >Check against result</button>
        <p v-if="settledMessage" class="program-bets__message" role="status">{{ settledMessage }}</p>
      </div>
    </section>

    <!-- My bets (paper) — what prints: filled bets, then blank lines -->
    <table class="program-paper" aria-hidden="true">
      <thead>
        <tr><th>Bet</th><th>Horses</th><th>Stake</th><th>Result</th><th>Returned</th></tr>
      </thead>
      <tbody>
        <tr v-for="bet in bets" :key="bet.id">
          <td>{{ betType(bet.type).label }}</td>
          <td>{{ bet.type === 'other' ? bet.label : bet.selection.filter(Boolean).join(' – ') }}</td>
          <td>{{ bet.stake ? formatMoney(bet.stake) : '' }}</td>
          <td>{{ bet.status === 'pending' ? '' : STATUSES.find(s => s.id === bet.status)?.label }}</td>
          <td>{{ bet.status === 'won' && bet.payout ? formatMoney(bet.payout) : '' }}</td>
        </tr>
        <tr v-for="n in blankPaperRows" :key="`blank-${n}`" class="program-paper__blank">
          <td></td><td></td><td></td><td></td><td></td>
        </tr>
      </tbody>
    </table>

    <!-- Notes ------------------------------------------------------------>
    <label class="program-notes">
      <span class="program-notes__label">Notes</span>
      <textarea
        :value="notes"
        class="program-input program-notes__input"
        rows="2"
        placeholder="Paddock, scratches, track bias…"
        @input="program.race(race.race_num).notes = $event.target.value"
      ></textarea>
      <span class="program-notes__paper" aria-hidden="true">{{ notes }}</span>
    </label>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { BET_TYPES, betType, formatMoney } from '~/composables/useRacedayProgram'

const props = defineProps({
  race: { type: Object, required: true },
  program: { type: Object, required: true },
  trackId: { type: String, required: true },
  date: { type: String, required: true }
})

const STATUSES = [
  { id: 'pending',  label: 'Open' },
  { id: 'won',      label: 'Won' },
  { id: 'lost',     label: 'Lost' },
  { id: 'refunded', label: 'Refund' }
]

// ---- Race data ---------------------------------------------------------
const field = computed(() =>
  [...(props.race.participants || [])].sort((a, b) => Number(a.program_number) - Number(b.program_number))
)
const byPgm = computed(() => Object.fromEntries(field.value.map(p => [String(p.program_number), p])))
const horseName = (pgm) => byPgm.value[String(pgm)]?.horse_name || `#${pgm}`

const predictions = computed(() =>
  Object.fromEntries((props.race.predictions || []).map(p => [String(p.program_number), p]))
)
const confidenceOf = (pgm) => predictions.value[String(pgm)]?.confidence || null
const confidenceShort = (c) => ({ high: 'High', medium: 'Med', low: 'Low' }[c] || c)
const isBotPick = (pgm) => String(props.race.botPick?.program_number) === String(pgm)

const finishOrder = computed(() =>
  field.value
    .filter(p => p.finish_position)
    .sort((a, b) => a.finish_position - b.finish_position)
    .map(p => String(p.program_number))
)

const statusLabel = computed(() => ({ completed: 'Final', live: 'Live', upcoming: 'Upcoming' }[props.race.status] || props.race.status))
const postTime = computed(() => {
  const d = new Date(props.race.post_time)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
})
const analysisLink = computed(() => `/picks/${props.trackId}/${props.date}/${props.race.race_num}`)

// Morning line shown as fractional odds (8.00 → 8-1, 2.5 → 5-2)
function formatOdds(raw) {
  const d = parseFloat(raw)
  if (!Number.isFinite(d)) return '—'
  const f = Math.round(d * 2) / 2
  return Number.isInteger(f) ? `${f}-1` : `${f * 2}-2`
}

const ordinal = (n) => `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th')}`

// ---- HorseBrain picks → one-tap bets -----------------------------------
const picks = computed(() => {
  const pp = props.race.premiumPicks || {}
  const out = []
  const bot = props.race.botPick?.program_number
  if (bot) out.push({ key: 'top', label: 'Top pick', betType: 'win', betLabel: 'Win', selection: [String(bot)] })
  if (pp.bestValue?.program_number && String(pp.bestValue.program_number) !== String(bot)) {
    out.push({ key: 'value', label: 'Best value', betType: 'win', betLabel: 'Win', selection: [String(pp.bestValue.program_number)] })
  }
  if (pp.wps?.[1]) out.push({ key: 'place', label: 'To place', betType: 'place', betLabel: 'Place', selection: [String(pp.wps[1])] })
  if (pp.wps?.[2]) out.push({ key: 'show', label: 'To show', betType: 'show', betLabel: 'Show', selection: [String(pp.wps[2])] })
  if (pp.exacta?.top && pp.exacta?.second) {
    out.push({ key: 'exacta', label: 'Exacta', betType: 'exacta', betLabel: 'Exacta', selection: [String(pp.exacta.top), String(pp.exacta.second)] })
  }
  if (pp.trifecta?.top && pp.trifecta?.second && pp.trifecta?.third) {
    out.push({
      key: 'trifecta', label: 'Trifecta', betType: 'trifecta', betLabel: 'Trifecta',
      selection: [String(pp.trifecta.top), String(pp.trifecta.second), String(pp.trifecta.third)]
    })
  }
  // only keep picks whose horses are actually in the field
  return out.filter(p => p.selection.every(s => byPgm.value[s]))
})

function addFromPick(pick) {
  props.program.addBet(props.race.race_num, { type: pick.betType, selection: pick.selection, source: 'horsebrain' })
}

// ---- The user's layer -----------------------------------------------------
const entry = computed(() => props.program.peek(props.race.race_num))
const bets = computed(() => entry.value?.bets || [])
const notes = computed(() => entry.value?.notes || '')
const isContender = (pgm) => !!entry.value?.contenders?.includes(String(pgm))
const raceTotals = computed(() => props.program.raceTotals(props.race.race_num))
const pendingCount = computed(() => bets.value.filter(b => b.status === 'pending').length)
const blankPaperRows = computed(() => Math.max(0, 4 - bets.value.length))

const legLabel = (type, i) => (type === 'win' || type === 'place' || type === 'show') ? 'Horse' : ['1st', '2nd', '3rd'][i]

function betNet(bet) {
  const stake = Number(bet.stake) || 0
  if (bet.status === 'won') return (Number(bet.payout) || 0) - stake
  if (bet.status === 'lost') return -stake
  return 0
}
const netClass = (n) => (n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-even')

const settledMessage = ref('')
function checkResult() {
  const changed = props.program.settleFromResult(props.race.race_num, finishOrder.value)
  const winners = bets.value.filter(b => b.status === 'won' && !b.payout).length
  settledMessage.value = changed
    ? `${changed} ${changed === 1 ? 'bet' : 'bets'} settled.${winners ? ' Enter what you were paid for the winners.' : ''}`
    : 'Nothing to settle. Bets marked "Other" need settling by hand.'
}

</script>

<!-- Styles: assets/scss/components/_program.scss (global, so print rules sit alongside) -->
