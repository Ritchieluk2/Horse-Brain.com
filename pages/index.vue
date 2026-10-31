<template>
  <main class="homepage">
    
    <!-- ==========================================
         1. HERO SECTION
         ========================================== -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">HorseBrain</h1>
        <p class="hero__subtitle">Race picks powered by machine learning</p>
        <div class="hero__actions">
          <NuxtLink to="/todays-picks" class="btn btn--primary">View Today's Picks</NuxtLink>
          <NuxtLink to="/our-track-record" class="btn btn--secondary">See Our Track Record</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==========================================
         2. LIVE TICKER
         ========================================== -->
    <section class="ticker" aria-label="Active and upcoming races">
      <div class="ticker__label">LIVE & UPCOMING</div>
      <div class="ticker__track">
        <!-- First set -->
        <div class="ticker__item">
          <span class="ticker__track-name">Keeneland</span>
          <span class="ticker__race-num">Race 4</span>
          <span class="ticker__status ticker__status--live">LIVE</span>
        </div>
        <div class="ticker__item">
          <span class="ticker__track-name">Remington Park</span>
          <span class="ticker__race-num">Race 1</span>
          <span class="ticker__status ticker__status--upcoming">1:15 PM</span>
        </div>
        <div class="ticker__item">
          <span class="ticker__track-name">Evangeline Downs</span>
          <span class="ticker__race-num">Race 6</span>
          <span class="ticker__status ticker__status--upcoming">2:45 PM</span>
        </div>
        <div class="ticker__item">
          <span class="ticker__track-name">Finger Lakes</span>
          <span class="ticker__race-num">Race 2</span>
          <span class="ticker__status ticker__status--upcoming">3:30 PM</span>
        </div>
        
        <!-- EXACT DUPLICATE for seamless loop -->
        <div class="ticker__item">
          <span class="ticker__track-name">Keeneland</span>
          <span class="ticker__race-num">Race 4</span>
          <span class="ticker__status ticker__status--live">LIVE</span>
        </div>
        <div class="ticker__item">
          <span class="ticker__track-name">Remington Park</span>
          <span class="ticker__race-num">Race 1</span>
          <span class="ticker__status ticker__status--upcoming">1:15 PM</span>
        </div>
        <div class="ticker__item">
          <span class="ticker__track-name">Evangeline Downs</span>
          <span class="ticker__race-num">Race 6</span>
          <span class="ticker__status ticker__status--upcoming">2:45 PM</span>
        </div>
        <div class="ticker__item">
          <span class="ticker__track-name">Finger Lakes</span>
          <span class="ticker__race-num">Race 2</span>
          <span class="ticker__status ticker__status--upcoming">3:30 PM</span>
        </div>
      </div>
    </section>

    <!-- ==========================================
         3. FEATURED FREE PICKS (Dynamic)
         ========================================== -->
    <section class="featured-picks">
      <div class="container">
        <h2 class="section-title">Today's Featured Free Picks</h2>
        <p class="section-subtitle">Our algorithm's highest confidence selections for today's card.</p>
        
        <div class="picks-grid">
          <article v-for="pick in featuredPicks" :key="pick.key" class="pick-card">
            <div class="pick-card__header">
              <span class="pick-card__track">{{ pick.track_name }}</span>
              <span class="pick-card__time">Post: {{ formatTime(pick.post_time) }}</span>
            </div>
            
            <!-- Horse Name with Dynamic Link to Horse Profile -->
            <NuxtLink 
              v-if="getHorseLink(pick.botPick.program_number, pick)"
              :to="getHorseLink(pick.botPick.program_number, pick)"
              class="pick-card__horse pick-card__horse--link"
            >
              {{ pick.botPick.horse_name }}
            </NuxtLink>
            <h3 v-else class="pick-card__horse">{{ pick.botPick.horse_name }}</h3>

            <div class="pick-card__details">
              <NuxtLink 
                v-if="getJockeyLink(pick.botPick.program_number, pick)"
                :to="getJockeyLink(pick.botPick.program_number, pick)"
                class="pick-card__jockey pick-card__jockey--link"
              >
                {{ pick.botPick.jockey_name }}
              </NuxtLink>
              <span v-else class="pick-card__jockey">{{ pick.botPick.jockey_name }}</span>
              <span class="pick-card__odds">Morning Line: {{ getOdds(pick.botPick.program_number, pick) }}</span>
            </div>
            
            <div class="pick-card__footer">
              <span class="pick-card__confidence" :class="`pick-card__confidence--${pick.botPick.confidence}`">
                {{ pick.botPick.confidence === 'high' ? 'High' : pick.botPick.confidence === 'medium' ? 'Medium' : 'Low' }} Confidence
              </span>
              <NuxtLink 
                :to="`/picks/${pick.track_id}/${pick.dateISO}/${pick.race_num}`" 
                class="btn btn--small"
              >
                View Analysis
              </NuxtLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ==========================================
         4. UPCOMING TRACK DAYS SCHEDULE
         ========================================== -->
    <UpcomingRacesCarousel />

    <!-- ==========================================
         5. ALL SUPPORTED TRACKS GRID
         ========================================== -->
    <section class="tracks-grid">
      <div class="container">
        <h2 class="section-title">All Supported Tracks</h2>
        <p class="section-subtitle">Comprehensive coverage of major racetracks with live data and algorithmic insights.</p>
        
        <div class="tracks-container">
          <NuxtLink
            v-for="track in supportedTracks"
            :key="track.id"
            :to="track.to || `/racetracks/${track.id}`"
            class="track-card"
          >
            <img :src="track.background" :alt="track.name" class="track-card__bg" />
            <div class="track-card__overlay"></div>
            <img :src="track.logo" :alt="`${track.name} Logo`" class="track-card__logo" />
            <div class="track-card__info">
              <h3 class="track-card__name">{{ track.name }}</h3>
              <div class="track-card__meta">
                <span class="track-card__date">Next: {{ track.nextRace }}</span>
                <span class="track-card__races">{{ track.races }} Races</span>
                <span class="track-card__post">Post: {{ track.post }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ==========================================
         6. 100% TRANSPARENT TRACK RECORD
         ========================================== -->
    <section id="track-record" class="track-record">
      <div class="container">
        <h2 class="section-title">100% Transparent Track Record</h2>
        <p class="section-subtitle">
          We operate like a financial institution. Here is our verified, historical performance across all models.
        </p>

        <div class="track-record__ornament" aria-hidden="true">
          <span class="track-record__ornament-line"></span>
          <span class="track-record__ornament-diamond"></span>
          <span class="track-record__ornament-line"></span>
        </div>

        <div class="stats-grid" ref="statsGrid">
          <div
            v-for="stat in trackRecordStats"
            :key="stat.label"
            class="stat-card"
            :class="{ 'is-settled': stat.isSettled }"
          >
            <span class="stat-card__frame" aria-hidden="true"></span>
            <i class="stat-card__corner stat-card__corner--tl" aria-hidden="true"></i>
            <i class="stat-card__corner stat-card__corner--br" aria-hidden="true"></i>

            <div class="stat-card__value">
              <template v-for="(char, cIndex) in stat.chars" :key="cIndex">
                <span v-if="char.type === 'static'" class="char-static">
                  {{ char.value }}
                </span>
                <span v-else class="char-roll" :style="{ transitionDelay: `${cIndex * 0.08}s` }">
                  <span 
                    class="char-roll__column" 
                    :class="{ 'is-rolled': stat.isSettled }"
                    :style="{ '--roll-dist': char.target }"
                  >
                    <span v-for="n in (char.target + 1)" :key="n - 1">
                      {{ n - 1 }}
                    </span>
                  </span>
                </span>
              </template>
            </div>

            <span class="stat-card__label">{{ stat.label }}</span>
          </div>
        </div>

        <p class="track-record__disclaimer">
          <em>
            Past performance is not indicative of future results. Please bet responsibly.
            If you or someone you know has a gambling problem, help is available.
          </em>
        </p>
      </div>
    </section>

    <!-- ==========================================
         7. NEWSLETTER CTA
         ========================================== -->
    <section class="newsletter">
      <div class="container">
        <div class="newsletter__content">
          <h2 class="newsletter__title">Get Free Daily Picks</h2>
          <p class="newsletter__text">Join our newsletter to receive our top algorithmic picks directly in your inbox every morning before first post.</p>
          
          <form class="newsletter__form" @submit.prevent>
            <input type="email" placeholder="Enter your email address" class="newsletter__input" required />
            <button type="submit" class="btn btn--primary">Subscribe</button>
          </form>
          <p class="newsletter__privacy">We respect your privacy. Unsubscribe at any time. No spam, just data.</p>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import tracksData from '~/data/tracks.json'
import UpcomingRacesCarousel from '~/components/racetracks/UpcomingRacesCarousel.vue'
import { useRacedays } from '~/composables/useRacedays'

const { getNextRacedayForTrack, getRaceday } = useRacedays()

/* ==========================================
   FEATURED PICKS LOGIC
   ========================================== */
const featuredPicks = computed(() => {
  const picks = []

  // Pick 1: Keeneland Race 1
  const kee = getRaceday('KEE', '2026-10-31')
  if (kee) {
    const race1 = kee.races.find(r => r.race_num === 1)
    if (race1) {
      const pickPgm = race1.botPick?.program_number
      const pickHorse = race1.participants.find(p => String(p.program_number) === String(pickPgm))
      picks.push({
        key: 'kee-r1',
        ...race1,
        track_id: kee.track_id,
        track_name: kee.track_name,
        dateISO: kee.dateISO,
        botPick: {
          program_number: pickPgm,
          horse_name: pickHorse?.horse_name || 'Unknown',
          jockey_name: pickHorse?.jockey_name || '—',
          confidence: race1.botPick?.confidence || 'medium'
        }
      })
    }
  }

  // Pick 2: Belmont Park Race 2
  const bel = getRaceday('BEL', '2026-11-01')
  if (bel) {
    const race2 = bel.races.find(r => r.race_num === 2)
    if (race2) {
      const pickPgm = race2.botPick?.program_number
      const pickHorse = race2.participants.find(p => String(p.program_number) === String(pickPgm))
      picks.push({
        key: 'bel-r2',
        ...race2,
        track_id: bel.track_id,
        track_name: bel.track_name,
        dateISO: bel.dateISO,
        botPick: {
          program_number: pickPgm,
          horse_name: pickHorse?.horse_name || 'Unknown',
          jockey_name: pickHorse?.jockey_name || '—',
          confidence: race2.botPick?.confidence || 'medium'
        }
      })
    }
  }

  return picks
})

const getHorseLink = (pgm, pick) => {
  if (!pick || !pick.participants) return null
  const p = pick.participants.find(x => String(x.program_number) === String(pgm))
  return p?.horse_equibase_refid ? `/horses/${p.horse_equibase_refid}` : null
}

// ADD THIS FUNCTION:
const getJockeyLink = (pgm, pick) => {
  if (!pick || !pick.participants) return null
  const p = pick.participants.find(x => String(x.program_number) === String(pgm))
  return p?.jockey_equibase_refid ? `/jockeys/${p.jockey_equibase_refid}` : null
}

const getOdds = (pgm, pick) => {
  if (!pick || !pick.participants) return '—'
  const p = pick.participants.find(x => String(x.program_number) === String(pgm))
  if (!p) return '—'
  const d = parseFloat(p.odds)
  if (!Number.isFinite(d)) return '—'
  const f = Math.round(d * 2) / 2
  const whole = Math.floor(f)
  return f === whole ? `${whole}-1` : `${Math.round(f * 2)}-2`
}

const formatTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/* ==========================================
   SUPPORTED TRACKS LOGIC
   ========================================== */
const supportedTracks = computed(() => {
  return (tracksData?.tracks || []).map(track => {
    const nd = getNextRacedayForTrack(track.id)
    return {
      ...track,
      nextRace: nd ? nd.shortDate : 'No scheduled date',
      races: nd ? nd.overview.total_races : '—',
      post: nd ? nd.overview.first_post : '—',
      to: nd ? nd.path : `/racetracks/${track.id}`
    }
  })
})

/* ==========================================
   TRACK RECORD ODOMETER LOGIC
   ========================================== */
const statsGrid = ref(null)
const statsObserver = ref(null)

const trackRecordStats = ref([
  { label: 'Win Rate (Top Pick)', target: 68.4, format: 'percent', isSettled: false, chars: [] },
  { label: 'ROI (Return on Investment)', target: 14.2, format: 'plus-percent', isSettled: false, chars: [] },
  { label: 'Total Races Analyzed', target: 1240, format: 'comma', isSettled: false, chars: [] },
  { label: '$100 Base Profit', target: 45, format: 'dollar-k-plus', isSettled: false, chars: [] }
])

const getFormattedString = (value, format) => {
  const safeValue = Number.isFinite(value) ? value : 0
  switch (format) {
    case 'percent': return `${safeValue.toFixed(1)}%`
    case 'plus-percent': return `+${safeValue.toFixed(1)}%`
    case 'comma': return Math.round(safeValue).toLocaleString('en-US')
    case 'dollar-k-plus': return `$${Math.round(safeValue)}k+`
    default: return String(Math.round(safeValue))
  }
}

const parseChars = (target, format) => {
  const finalStr = getFormattedString(target, format)
  const chars = []
  for (const char of finalStr) {
    if (/\d/.test(char)) {
      chars.push({ type: 'roll', target: parseInt(char, 10) })
    } else {
      chars.push({ type: 'static', value: char })
    }
  }
  return chars
}

const initCountUpAnimation = () => {
  if (!statsGrid.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    trackRecordStats.value.forEach(stat => { stat.isSettled = true })
    return
  }

  statsObserver.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        trackRecordStats.value.forEach(stat => { stat.isSettled = true })
        statsObserver.value.disconnect()
        statsObserver.value = null
      }
    },
    { threshold: 0.35 }
  )

  statsObserver.value.observe(statsGrid.value)
}

onMounted(() => {
  trackRecordStats.value.forEach(stat => {
    stat.chars = parseChars(stat.target, stat.format)
  })
  initCountUpAnimation()
})

onBeforeUnmount(() => {
  if (statsObserver.value) {
    statsObserver.value.disconnect()
  }
})
</script>

<style lang="scss" scoped>
/* Add this to ensure the horse name link has the sliding underline effect */
.pick-card__horse--link {
  position: relative;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
  display: inline-block; /* Ensures the underline doesn't stretch full width unnecessarily */

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-baby-blue);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--color-baby-blue);
    
    &::after {
      transform: scaleX(1);
    }
  }
}

/* Jockey name link styles - sliding underline from left */
.pick-card__jockey--link {
  position: relative;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-baby-blue);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--color-baby-blue);
    
    &::after {
      transform: scaleX(1);
    }
  }
}

/* (Keep all your existing homepage SCSS exactly as it was below this line) */
</style>