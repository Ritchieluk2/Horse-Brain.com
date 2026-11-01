<template>
  <div class="insights-table-wrap">
    <table class="insights-table" :class="{ 'is-compact': compact }">
      <thead>
        <tr>
          <th scope="col">{{ label }}</th>
          <th scope="col" class="num">Bets</th>
          <th v-if="!compact" scope="col" class="num">Strike rate</th>
          <th v-if="!compact" scope="col" class="num">Staked</th>
          <th scope="col" class="num">P / L</th>
          <th scope="col" class="num">Return</th>
          <th v-if="!compact" scope="col" class="insights-bar-col"><span class="visually-hidden">Return, as a bar</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.key">
          <th scope="row">{{ labelOf(r) }}</th>
          <td class="num">{{ r.count }}<small v-if="r.pending" class="insights-muted"> ({{ r.pending }} open)</small></td>
          <td v-if="!compact" class="num">{{ pct(r.strikeRate) }}</td>
          <td v-if="!compact" class="num">{{ formatMoney(r.staked) }}</td>
          <td class="num" :class="netClass(r.net)">{{ r.won + r.lost ? formatMoney(r.net, { sign: true }) : '—' }}</td>
          <td class="num" :class="netClass(r.net)">{{ pct(r.roi, true) }}</td>
          <td v-if="!compact" class="insights-bar-col" aria-hidden="true">
            <!-- Diverging bar: losses grow left of the centre line, profits right -->
            <span class="insights-bar">
              <span
                v-if="r.roi"
                class="insights-bar__fill"
                :class="r.roi > 0 ? 'is-up' : 'is-down'"
                :style="{ width: `${barWidth(r.roi)}%` }"
              />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
// One row per group (bet type, track, month) with the same columns everywhere.
// Return % = profit / settled stake. The bar is scaled to the largest |return| shown.
import { computed } from 'vue'
import { formatMoney } from '#shared/program-rules.js'

const props = defineProps({
  rows: { type: Array, required: true },
  label: { type: String, required: true },
  labelOf: { type: Function, default: (r) => r.key },
  compact: { type: Boolean, default: false }
})

const pct = (v, sign = false) => (v === null || v === undefined ? '—' : `${sign && v > 0 ? '+' : ''}${v}%`)
const netClass = (n) => (n > 0 ? 'is-up' : n < 0 ? 'is-down' : '')
const maxRoi = computed(() => Math.max(10, ...props.rows.map(r => Math.abs(r.roi || 0))))
const barWidth = (roi) => Math.max(2, (Math.abs(roi) / maxRoi.value) * 50)
</script>
