<template>
  <div class="todays-races-page">
    <PageTitle title="Today's Races" />

    <section class="races-section">
      <div class="container">
        <!-- Date Header -->
        <div class="date-header" v-reveal>
          <h2 class="date-header__title">{{ formattedDate }}</h2>
          <p class="date-header__subtitle">
            {{ races.length }} race{{ races.length !== 1 ? 's' : '' }} scheduled across {{ uniqueTracks.length }} track{{ uniqueTracks.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Races Accordion -->
        <div class="races-list" v-reveal.stagger>
          <article
            v-for="race in sortedRaces"
            :key="race.id"
            class="race-row"
            :class="{
              'race-row--expanded': expandedRaceId === race.id,
              [`race-row--${race.status}`]: true
            }"
          >
            <!-- Race Header (Always Visible) -->
            <button
            class="race-row__header"
            @click="toggleRace(race.id)"
            :aria-expanded="expandedRaceId === race.id"
            >
            <!-- Left Column: Status + Track Info + Details -->
            <div class="race-row__main">
                <div class="race-row__status">
                <span class="race-row__status-badge" :class="`race-row__status-badge--${race.status}`">
                    {{ statusLabel(race.status) }}
                </span>
                </div>

                <div class="race-row__track">
                <span class="race-row__track-name">{{ race.track_name }}</span>
                <span class="race-row__race-num">Race {{ race.race_num }}</span>
                </div>

                <div class="race-row__details">
                <div class="race-row__detail">
                    <span class="race-row__detail-label">Post</span>
                    <span class="race-row__detail-value">{{ formatTime(race.post_time) }}</span>
                </div>
                <div class="race-row__detail">
                    <span class="race-row__detail-label">Distance</span>
                    <span class="race-row__detail-value">{{ race.distance }}</span>
                </div>
                <div class="race-row__detail">
                    <span class="race-row__detail-label">Horses</span>
                    <span class="race-row__detail-value">{{ race.participants.length }}</span>
                </div>
                </div>
            </div>

            <!-- Right Column: Our Pick Panel -->
            <div 
                class="race-row__pick" 
                v-if="race.pick"
                @mousemove="handleGlassShine"
                @mouseenter="handleGlassShineEnter"
                @mouseleave="handleGlassShineLeave"
                >
                <div class="race-row__pick-header">
                    <span class="race-row__pick-label">Our Pick</span>
                <span 
                    class="race-row__pick-icon" 
                    :class="`race-row__pick-icon--${race.pick.confidence}`"
                    :title="`${race.pick.confidence} confidence`"
                >
                    <!-- High Confidence: Star -->
                    <svg v-if="race.pick.confidence === 'high'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <!-- Medium Confidence: Check -->
                    <svg v-else-if="race.pick.confidence === 'medium'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <!-- Low Confidence: Question -->
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </span>
                </div>
                <div class="race-row__pick-body">
                <span class="race-row__pick-program" :data-pgm="race.pick.program_number">{{ race.pick.program_number }}</span>
                <span class="race-row__pick-horse">{{ race.pick.horse_name }}</span>
                </div>
                <div class="race-row__pick-confidence">
                {{ race.pick.confidence }} confidence
                </div>
            </div>

            <span class="race-row__chevron" :class="{ 'race-row__chevron--open': expandedRaceId === race.id }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
                </svg>
            </span>
            </button>

            <!-- Expanded Race Details -->
            <div 
            class="race-row__body" 
            v-show="expandedRaceId === race.id"
            >
            <div class="race-row__body-inner">
                <div class="race-row__meta">
                <span class="race-row__meta-item">
                    <strong>Type:</strong> {{ race.race_type }}
                </span>
                <span class="race-row__meta-item">
                    <strong>Surface:</strong> {{ race.surface }}
                </span>
                <span class="race-row__meta-item">
                    <strong>Purse:</strong> ${{ race.purse.toLocaleString() }}
                </span>
                </div>

                    <table class="participants-table">
                        <thead>
                            <tr>
                                <th class="participants-table__th">PGM</th>
                                <th class="participants-table__th">Horse</th>
                                <th class="participants-table__th">Jockey</th>
                                <th class="participants-table__th">Wt</th>
                                <th class="participants-table__th">Odds</th>
                                <th v-if="race.status === 'completed'" class="participants-table__th">Finish</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="participant in race.participants"
                                :key="participant.program_number"
                                class="participants-table__row"
                                :class="{ 
                                'participants-table__row--winner': participant.finish_position === 1,
                                'participants-table__row--pick': race.pick && String(participant.program_number) === String(race.pick.program_number)
                                }"
                            >
                                <td class="participants-table__cell participants-table__cell--program">
                                <span class="horse-num" :data-pgm="participant.program_number">{{ participant.program_number }}</span>
                                </td>
                                <td class="participants-table__cell participants-table__cell--horse">
                                <!-- Horse Name with Dynamic Link -->
                                <NuxtLink 
                                    v-if="participant.horse_equibase_refid"
                                    :to="`/horses/${participant.horse_equibase_refid}`"
                                    class="horse-link"
                                >
                                    {{ participant.horse_name }}
                                </NuxtLink>
                                <span v-else>{{ participant.horse_name }}</span>
                                
                                <!-- Our Pick Icon with Tooltip -->
                                <span 
                                    v-if="race.pick && String(participant.program_number) === String(race.pick.program_number)" 
                                    class="pick-icon-inline"
                                    :class="`pick-icon-inline--${race.pick.confidence}`"
                                    :title="`Our Pick with ${race.pick.confidence} confidence`"
                                >
                                    <svg v-if="race.pick.confidence === 'high'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    <svg v-else-if="race.pick.confidence === 'medium'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                </span>
                                </td>
                                <td class="participants-table__cell participants-table__cell--jockey">
                                {{ participant.jockey_name }}
                                </td>
                                <td class="participants-table__cell">
                                {{ participant.weight }}
                                </td>
                                <td class="participants-table__cell participants-table__cell--odds">
                                {{ formatOdds(participant.odds) }}
                                </td>
                                <td v-if="race.status === 'completed'" class="participants-table__cell participants-table__cell--finish">
                                <span v-if="participant.finish_position" class="place-num" :data-place="participant.finish_position">{{ participant.finish_position }}</span>
                                </td>
                            </tr>
                            </tbody>
                    </table>
                    </div>
                </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import racesData from '~/data/races.json'

const expandedRaceId = ref(null)

const races = racesData.races

// Computed: unique tracks for the header summary
const uniqueTracks = computed(() => {
  return [...new Set(races.map(r => r.track_id))]
})

// Computed: formatted date
const formattedDate = computed(() => {
  const date = new Date(racesData.date)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Computed: races sorted by status priority, then by post time
const sortedRaces = computed(() => {
  const statusPriority = { live: 0, upcoming: 1, completed: 2 }
  
  return [...races].sort((a, b) => {
    // First sort by status (live first, then upcoming, then completed)
    const statusDiff = statusPriority[a.status] - statusPriority[b.status]
    if (statusDiff !== 0) return statusDiff
    
    // Then sort by post time (earliest first)
    return new Date(a.post_time) - new Date(b.post_time)
  })
})

// Toggle accordion
const toggleRace = (raceId) => {
  expandedRaceId.value = expandedRaceId.value === raceId ? null : raceId
}

// Format time from ISO string
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Format odds (e.g., "3.50" -> "7/2")
const formatOdds = (odds) => {
  const decimal = parseFloat(odds)
  // Convert decimal odds to fractional (simplified)
  const fractional = Math.round(decimal * 2) / 2
  const whole = Math.floor(fractional)
  const remainder = fractional - whole
  if (remainder === 0) return `${whole}-1`
  return `${Math.round(fractional * 2)}-2`
}

// Status label
const statusLabel = (status) => {
  const labels = {
    completed: 'Final',
    live: 'Live',
    upcoming: 'Upcoming'
  }
  return labels[status] || status
}




const handleGlassShine = (e) => {
  const box = e.currentTarget
  const rect = box.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  // Update CSS custom properties for the gradient position
  box.style.setProperty('--mouse-x', `${x}px`)
  box.style.setProperty('--mouse-y', `${y}px`)
}

const handleGlassShineEnter = (e) => {
  // Fade in the shine effect
  e.currentTarget.style.setProperty('--shine-opacity', '1')
}

const handleGlassShineLeave = (e) => {
  // Fade out the shine effect
  e.currentTarget.style.setProperty('--shine-opacity', '0')
}
</script>

<style lang="scss" scoped>
// Race rows, Our Pick panel and participants table are global:
// assets/scss/components/_race-row.scss
.todays-races-page { background-color: var(--bg-page); }

.races-section { padding-block: var(--section-pad-sm) var(--section-pad); }

.date-header {
  margin-bottom: var(--space-7);
  text-align: center;

  @include up(md) { margin-bottom: var(--space-8); }

  &__title {
    font-size: var(--fs-3xl);
    color: var(--color-espresso);
    margin-bottom: var(--space-2);
  }

  &__subtitle {
    margin: 0 auto;
    font-size: var(--fs-md);
    color: var(--text-secondary);
  }
}
</style>