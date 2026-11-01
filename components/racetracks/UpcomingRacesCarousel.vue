<template>
  <section
    ref="sectionEl"
    class="race-schedule"
    :style="{ height: runwayHeight }"
  >
    <div ref="stageEl" class="rolodex-stage">

      <!-- Section heading -->
      <header ref="stageHeaderEl" class="rolodex-stage__header">
        <h2 class="section-title">Race Schedule</h2>
        <p class="section-subtitle">Scroll through the next race days, or tap any card to open it.</p>
      </header>

      <!-- The viewport: cards are in a flex column, no overlap -->
      <div ref="viewportEl" class="rolodex-viewport" :style="{ height: `${viewportH}px` }">

        <!-- Position bubbles: one per race day; active one stretches into a pill -->
        <nav class="rolodex-dots" aria-label="Race days">
          <button
            v-for="(race, i) in visibleRaces"
            :key="`dot-${race.id}-${race.dateISO}`"
            type="button"
            class="rolodex-dots__dot"
            :class="{
              'is-active': activeIndex === i,
              'is-scroll': i <= autoMax
            }"
            :aria-label="`${race.name}, ${race.shortDate}`"
            :aria-current="activeIndex === i ? 'true' : null"
            @click="onCardClick(i)"
          ></button>
        </nav>

        <!-- LOCKED: Previous results. Never enters the active slot. -->
        <article
          v-if="previousRaceday"
          class="race-card race-card--locked"
          :style="lockedStyle"
        >
          <span class="race-card__frame" aria-hidden="true"></span>
          <i class="race-card__corner race-card__corner--tl" aria-hidden="true"></i>
          <i class="race-card__corner race-card__corner--br" aria-hidden="true"></i>
          <div class="race-card__compact">
            <span class="race-card__tag">Archived</span>
            <h3 class="race-card__name">{{ previousRaceday.track_name }}</h3>
            <span class="race-card__meta">
              {{ previousRaceday.shortDate }} &bull;
              {{ previousRaceday.overview.total_races }} Races &bull;
              {{ previousRaceday.overview.first_post }}
            </span>
            <NuxtLink :to="previousRaceday.path" class="race-card__action">
              Past Results &rarr;
            </NuxtLink>
          </div>
        </article>

        <!-- Scrollable race days -->
        <article
          v-for="(race, i) in visibleRaces"
          :key="race.id"
          class="race-card"
          :class="{ 'is-open': isOpen(i), 'is-clickable': !isOpen(i) }"
          :style="cardStyle(i)"
          :tabindex="isOpen(i) ? -1 : 0"
          :aria-label="isOpen(i) ? null : `Open ${race.name} race card`"
          @click="onCardClick(i)"
          @keydown.enter.prevent="onCardClick(i)"
        >
          <span class="race-card__frame" aria-hidden="true"></span>
          <i class="race-card__corner race-card__corner--tl" aria-hidden="true"></i>
          <i class="race-card__corner race-card__corner--br" aria-hidden="true"></i>

          <!-- Compact / table-row face -->
          <div class="race-card__compact">
            <span class="race-card__tag">{{ i === 0 ? 'Today' : 'Upcoming' }}</span>
            <h3 class="race-card__name">{{ race.name }}</h3>
            <span class="race-card__meta">{{ race.shortDate }} &bull; {{ race.races }} Races &bull; {{ race.post }}</span>
            <span class="race-card__action">Open Card &rarr;</span>
          </div>

          <!-- Featured / full face -->
          <div class="race-card__featured">
            <img
              :src="race.background"
              :alt="race.name"
              class="race-card__bg"
              @error="onImageError"
            />
            <div class="race-card__scrim"></div>

            <div class="race-card__content">
              <img
                :src="race.logo"
                :alt="race.name"
                class="race-card__logo"
                @error="onLogoError"
              />

              <div class="race-card__details">
                <span class="race-card__dateplate">{{ race.fullDate }}</span>
                <h3 class="race-card__headline">{{ race.name }}</h3>
                <div class="race-card__footer">
                <div class="race-card__stats">
                  <span><strong>{{ race.races }}</strong> Races</span>
                  <span><strong>{{ race.post }}</strong> First Post</span>
                  <span><strong>{{ race.condition }}</strong> Going</span>
                </div>
                
                <div class="race-card__actions">
                  <NuxtLink 
                    :to="race.to || `/racedays/${race.id}/${race.dateISO}`" 
                    class="btn btn--primary race-card__btn"
                  >
                    <span class="race-card__btn-long">View Full Card &amp; Picks</span>
                    <span class="race-card__btn-short">Card &amp; Picks</span>
                  </NuxtLink>
                  <!-- Premium: the printable / fill-in program for this race day -->
                  <NuxtLink
                    :to="`/program/${race.id}/${race.dateISO}`"
                    class="btn btn--premium race-card__btn"
                    :aria-label="`Raceday Program for ${race.name}, ${race.fullDate}`"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>
                    </svg>
                    <span class="race-card__btn-long">Raceday Program</span>
                    <span class="race-card__btn-short">Program</span>
                  </NuxtLink>
                </div>
                </div>
              </div>
            </div>
          </div>
        </article>

      </div>

      <!-- Footer controls (WITH LOAD MORE CTA) -->
      <div ref="controlsEl" class="rolodex-controls">
        <span class="rolodex-controls__counter">
          {{ String(Math.min(Math.round(progress) + 1, visibleRaces.length)).padStart(2, '0') }}
          / {{ String(visibleRaces.length).padStart(2, '0') }} RACE DAYS
        </span>
        
        <!-- THIS IS THE FINAL CTA: Only shows if there are more races to load -->
        <button v-if="hasMore" class="load-more" @click="loadMore">
          Load More Upcoming Races
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
// 1. IMPORTS MUST BE AT THE VERY TOP
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRacedays } from '~/composables/useRacedays'

// 2. NOW WE CAN CALL THE COMPOSABLE
const { upcomingRacedays, pastRacedays } = useRacedays()

/* ---------------------------------------------------------
   CONFIG
--------------------------------------------------------- */
const SCROLL_STEP = 800
// Scrolling drives only the first N race days; after that the section
// releases and the remaining cards are opened by clicking (card or dot).
const AUTO_SCROLL_CARDS = 3
const PAGE_SIZE = 5
const FALLBACK_BG = 'https://www.keeneland.com/sites/default/files/2022-07/home-racing.jpg'
const SNAP_ZONE = 0.28
const CARD_HEIGHT_CLOSED = 104
const CARD_HEIGHT_OPEN = 480
const CARD_GAP = 10

const sectionEl = ref(null)
const progress = ref(0)
const target = ref(0)
let rafId = null

/* Shaped to match what the template already expects. */
const CATALOG = computed(() =>
  upcomingRacedays.value.map(rd => ({
    id: rd.track_id,
    name: rd.track_name,
    logo: rd.logo,
    background: rd.background,
    shortDate: rd.shortDate,
    fullDate: rd.fullDate,
    dateISO: rd.dateISO,
    races: rd.overview.total_races,
    post: rd.overview.first_post,
    condition: rd.going,
    to: rd.path
  }))
)

/* Most recent archived raceday drives the locked "Previous Results" card. */
const previousRaceday = computed(() => pastRacedays.value[0] || null)

// 3. DECLARE visibleCount BEFORE hasMore
const visibleCount = ref(PAGE_SIZE)
const visibleRaces = computed(() => CATALOG.value.slice(0, visibleCount.value))
const maxProgress = computed(() => Math.max(visibleRaces.value.length - 1, 0))

// 4. NOW hasMore WORKS BECAUSE visibleCount EXISTS
const hasMore = computed(() => visibleCount.value < CATALOG.value.length)
const atEnd = computed(() => progress.value >= maxProgress.value - 0.08)

// Last index reachable by scrolling (0-based)
const autoMax = computed(() => Math.max(Math.min(AUTO_SCROLL_CARDS, visibleRaces.value.length) - 1, 0))

// Section is exactly as tall as the stage plus the scroll runway for the
// auto-scrolled cards — no longer locked to 100vh.
const stageH = ref(0)
const runwayHeight = computed(() =>
  stageH.value
    ? `${stageH.value + autoMax.value * SCROLL_STEP}px`
    : `calc(100vh + ${autoMax.value * SCROLL_STEP}px)`
)

// Click-driven focus beyond the scroll range
const manualIndex = ref(null)
const pendingManual = ref(null)
const headerOffset = ref(80)

const activeIndex = computed(() => clamp(Math.round(progress.value), 0, maxProgress.value))

const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n))

function readScroll() {
  if (!sectionEl.value) return
  // progress 0 = stage just pinned under the sticky header
  const top = sectionEl.value.getBoundingClientRect().top - headerOffset.value
  const scrollP = clamp(-top / SCROLL_STEP, 0, autoMax.value)
  const atRunwayEnd = scrollP >= autoMax.value - 0.02

  // a click asked for a card past the scroll range: apply once we arrive
  if (pendingManual.value !== null && atRunwayEnd) {
    manualIndex.value = pendingManual.value
    pendingManual.value = null
  }
  // scrolling back up into the runway hands control back to scroll
  if (manualIndex.value !== null && !atRunwayEnd && pendingManual.value === null) {
    manualIndex.value = null
  }
  target.value = manualIndex.value ?? scrollP
}

function snapProgress(raw) {
  const n = Math.floor(raw)
  const frac = raw - n
  const halfSnap = SNAP_ZONE / 2
  const transitionWidth = 1 - SNAP_ZONE
  
  if (frac < halfSnap) return n
  if (frac > 1 - halfSnap) return n + 1
  const t = (frac - halfSnap) / transitionWidth
  return n + t
}

function tick() {
  const diff = target.value - progress.value
  if (Math.abs(diff) > 0.0005) {
    progress.value += diff * 0.09
  }
  rafId = requestAnimationFrame(tick)
}

/* ---------------------------------------------------------
   STACK LAYOUT (Material-You style)
   One card is fully open, framed by a fully visible preview card
   above (previous / archived) and below (next). Cards are stacked
   by their real heights around a focus point, so they never
   overlap; previews further than one step behind fade away.
--------------------------------------------------------- */
const viewportEl = ref(null)
const stageEl = ref(null)
const stageHeaderEl = ref(null)
const controlsEl = ref(null)
const isNarrow = ref(false)
let resizeObs = null

const closedH = computed(() => (isNarrow.value ? 84 : CARD_HEIGHT_CLOSED))
const winH = ref(900)
const chromeH = ref(200)   // stage heading + controls + padding

// Open card fills the screen minus the header, the stage chrome and
// one preview above + one below (so all three are always visible).
const openH = computed(() =>
  clamp(winH.value - headerOffset.value - chromeH.value - 2 * (closedH.value + CARD_GAP) - 16, 300, 460)
)
const viewportH = computed(() => openH.value + 2 * (closedH.value + CARD_GAP) + 8)

function measure() {
  isNarrow.value = window.innerWidth < 768
  winH.value = window.innerHeight
  const hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))
  if (Number.isFinite(hh)) headerOffset.value = hh
  const head = stageHeaderEl.value?.offsetHeight || 0
  const ctrl = controlsEl.value?.offsetHeight || 0
  // stage padding is fluid (clamp), so read the real value
  const cs = stageEl.value ? getComputedStyle(stageEl.value) : null
  const pad = cs ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 80
  chromeH.value = head + ctrl + pad + 8
  if (stageEl.value) stageH.value = stageEl.value.offsetHeight
}

const stack = computed(() => {
  const s = snapProgress(progress.value)
  const items = []
  if (previousRaceday.value) items.push({ i: -1, locked: true })
  visibleRaces.value.forEach((_, i) => items.push({ i, locked: false }))

  const sized = items.map(it => {
    if (it.locked) return { ...it, morph: 0, h: closedH.value }
    const morph = clamp(1 - Math.abs(it.i - s) * 1.5)
    return { ...it, morph, h: closedH.value + (openH.value - closedH.value) * morph }
  })

  // top edge of every card in one continuous column
  let y = 0
  const tops = sized.map(it => { const t = y; y += it.h + CARD_GAP; return t })

  // keep the (fractional) focused card centred in the viewport
  const centre = k => {
    const j = sized.findIndex(it => it.i === k)
    return j < 0 ? 0 : tops[j] + sized[j].h / 2
  }
  const lo = Math.floor(s)
  const hi = Math.min(Math.ceil(s), maxProgress.value)
  const focus = centre(lo) + (centre(hi) - centre(lo)) * (s - lo)

  const out = {}
  sized.forEach((it, j) => {
    const d = it.i - s
    let alpha = 1
    if (d < -1) alpha = clamp(1 + (d + 1) * 1.6)   // older previews fade out
    if (d > 2) alpha = clamp(1 - (d - 2) * 1.6)     // far-future previews fade in
    const detail = it.locked ? 0 : clamp((it.morph - 0.35) / 0.45)
    out[it.i] = {
      '--height': `${it.h}px`,
      '--translate-y': `${tops[j] - focus}px`,
      '--morph': it.morph,
      '--detail': detail,
      '--face': clamp(1 - detail * 2),   // preview face clears before the photo face settles
      '--alpha': alpha,
    }
  })
  return out
})

const cardStyle = (i) => stack.value[i] || {}
const lockedStyle = computed(() => stack.value[-1] || {})

const isOpen = (i) => Math.abs(i - snapProgress(progress.value)) < 0.12

/* Clicking a preview card scrolls the section so that card becomes
   the open one (scroll position drives progress: SCROLL_STEP per card). */
function runwayTop() {
  return sectionEl.value.getBoundingClientRect().top + window.scrollY - headerOffset.value
}

function smoothScrollTo(y) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
}

function scrollToCard(i) {
  if (!sectionEl.value) return
  if (i <= autoMax.value) {
    // inside the scroll range: scrolling to the card's position opens it
    manualIndex.value = null
    pendingManual.value = null
    smoothScrollTo(runwayTop() + i * SCROLL_STEP)
    return
  }
  // past the scroll range: open by click, parking the page at the runway end
  const end = runwayTop() + autoMax.value * SCROLL_STEP
  if (Math.abs(window.scrollY - end) < 4) {
    manualIndex.value = i
    target.value = i
  } else {
    pendingManual.value = i
    smoothScrollTo(end)
  }
}

function onCardClick(i) {
  if (isOpen(i)) return   // open card: let its own button/link handle the click
  scrollToCard(i)
}

function loadMore() {
  // 5. ADDED .value TO CATALOG
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, CATALOG.value.length)
  requestAnimationFrame(readScroll)
}

function onImageError(e) {
  if (e.target.dataset.fallback) return
  e.target.dataset.fallback = 'true'
  e.target.src = FALLBACK_BG
}

function onLogoError(e) {
  e.target.style.opacity = '0'
}

onMounted(() => {
  window.addEventListener('scroll', readScroll, { passive: true })
  window.addEventListener('resize', readScroll)
  measure()
  requestAnimationFrame(measure)   // re-measure once the viewport height applies
  window.addEventListener('resize', measure)
  if ('ResizeObserver' in window && stageEl.value) {
    resizeObs = new ResizeObserver(measure)
    resizeObs.observe(stageEl.value)
  }
  readScroll()
  tick()
})

onUnmounted(() => {
  window.removeEventListener('scroll', readScroll)
  window.removeEventListener('resize', readScroll)
  window.removeEventListener('resize', measure)
  if (resizeObs) resizeObs.disconnect()
  cancelAnimationFrame(rafId)
})
</script>