<template>
  <figure class="pl-chart">
    <div ref="plotEl" class="pl-chart__plot" :style="{ height: `${H}px` }">
      <svg
        v-if="width"
        :width="width"
        :height="H"
        :viewBox="`0 0 ${width} ${H}`"
        role="img"
        :aria-label="summary"
        @pointermove="onMove"
        @pointerleave="active = null"
      >
        <!-- Grid + y labels (recessive) -->
        <g class="pl-chart__grid">
          <template v-for="t in yTicks" :key="t">
            <line :x1="PAD.l" :x2="width - PAD.r" :y1="y(t)" :y2="y(t)" :class="{ 'is-zero': t === 0 }" />
            <text :x="PAD.l - 8" :y="y(t)" dy="0.35em" text-anchor="end">{{ money(t) }}</text>
          </template>
          <text v-for="t in xTicks" :key="t.label" :x="t.x" :y="H - 6" text-anchor="middle">{{ t.label }}</text>
        </g>

        <!-- The running total -->
        <path class="pl-chart__line" :d="linePath" />
        <circle
          v-for="(p, i) in points"
          :key="i"
          class="pl-chart__dot"
          :class="{ 'is-active': active === i }"
          :cx="p.x"
          :cy="p.y"
          :r="active === i ? 6 : points.length > 40 ? 0 : 3.5"
        />

        <!-- Hover crosshair -->
        <line v-if="active !== null" class="pl-chart__cross" :x1="points[active].x" :x2="points[active].x" :y1="PAD.t" :y2="H - PAD.b" />
      </svg>

      <div
        v-if="active !== null"
        class="pl-chart__tip"
        :class="{ 'is-left': points[active].x > width * 0.6 }"
        :style="{ left: `${points[active].x}px`, top: `${points[active].y}px` }"
        role="status"
      >
        <span class="pl-chart__tip-date">{{ fmtDate(days[active].date) }} · {{ trackName(days[active].trackId) }}</span>
        <span>Day: <b :class="netClass(days[active].net)">{{ money(days[active].net, true) }}</b></span>
        <span>Running total: <b :class="netClass(days[active].cumulative)">{{ money(days[active].cumulative, true) }}</b></span>
      </div>
    </div>
    <figcaption class="visually-hidden">{{ summary }}</figcaption>
  </figure>
</template>

<script setup>
// Running profit / loss across racedays: one line, a zero baseline,
// hover for each day. Single series, so no legend; the card title names it.
// The same numbers are in the "Raceday by raceday" table for screen readers.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  days: { type: Array, required: true },          // [{ date, trackId, net, cumulative }] oldest first
  trackName: { type: Function, default: (id) => id }
})

const H = 260
const PAD = { t: 16, r: 16, b: 28, l: 64 }

const plotEl = ref(null)
const width = ref(0)
const active = ref(null)
let ro = null

onMounted(() => {
  const measure = () => { width.value = plotEl.value?.clientWidth || 0 }
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(plotEl.value)
})
onBeforeUnmount(() => ro?.disconnect())

const money = (n, sign = false) => {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k` : `$${abs.toFixed(abs % 1 ? 2 : 0)}`
  return n < 0 ? `-${s}` : sign && n > 0 ? `+${s}` : s
}
const netClass = (n) => (n > 0 ? 'is-up' : n < 0 ? 'is-down' : '')
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const toTime = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }

// ---- Scales -------------------------------------------------------------
const domainY = computed(() => {
  const vals = props.days.map(d => d.cumulative)
  let lo = Math.min(0, ...vals)
  let hi = Math.max(0, ...vals)
  if (lo === hi) { lo -= 10; hi += 10 }
  return niceDomain(lo, hi)
})

function niceDomain(lo, hi) {
  const span = hi - lo
  const step = [1, 2, 2.5, 5, 10].map(f => f * 10 ** Math.floor(Math.log10(span / 4))).find(s => span / s <= 5) || span / 4
  return { lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step, step }
}

const yTicks = computed(() => {
  const { lo, hi, step } = domainY.value
  const out = []
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 100) / 100)
  return out
})

const y = (v) => {
  const { lo, hi } = domainY.value
  return PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b)
}

const t0 = computed(() => props.days.length ? toTime(props.days[0].date) : 0)
const t1 = computed(() => props.days.length ? toTime(props.days[props.days.length - 1].date) : 1)
const x = (iso) => {
  const span = t1.value - t0.value
  const inner = width.value - PAD.l - PAD.r
  return PAD.l + (span ? ((toTime(iso) - t0.value) / span) * inner : inner / 2)
}

const points = computed(() => props.days.map(d => ({ x: x(d.date), y: y(d.cumulative) })))

// Steps: the total only changes on a raceday, so draw it flat between days
const linePath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  let d = `M${PAD.l},${y(0)} H${pts[0].x} V${pts[0].y}`
  for (let i = 1; i < pts.length; i++) d += ` H${pts[i].x} V${pts[i].y}`
  return d
})

// Month labels along the bottom, thinned to fit
const xTicks = computed(() => {
  if (!props.days.length || !width.value) return []
  const out = []
  const start = new Date(t0.value)
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))
  while (cur.getTime() <= t1.value) {
    const iso = cur.toISOString().slice(0, 10)
    out.push({ x: x(iso), label: cur.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) })
    cur.setUTCMonth(cur.getUTCMonth() + 1)
  }
  const maxLabels = Math.max(2, Math.floor((width.value - PAD.l - PAD.r) / 56))
  const every = Math.ceil(out.length / maxLabels)
  return out.filter((_, i) => i % every === 0)
})

// ---- Hover: nearest raceday to the pointer --------------------------------
function onMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const px = e.clientX - rect.left
  let best = null
  let bestDist = Infinity
  points.value.forEach((p, i) => {
    const dist = Math.abs(p.x - px)
    if (dist < bestDist) { best = i; bestDist = dist }
  })
  active.value = best
}

const summary = computed(() => {
  const last = props.days[props.days.length - 1]
  if (!last) return 'No settled racedays yet.'
  return `Running profit or loss over ${props.days.length} racedays, from ${fmtDate(props.days[0].date)} to ${fmtDate(last.date)}, ending at ${money(last.cumulative, true)}.`
})
</script>
