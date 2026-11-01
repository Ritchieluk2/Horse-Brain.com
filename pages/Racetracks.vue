<template>
  <div class="racetracks-page">
    <PageTitle title="Racetracks" />
    
    <CurrentlyRacingTicker />

    <section class="all-tracks-section">
      <div class="container">
        <div class="section-header" v-reveal>
          <div class="section-header__text">
            <h2 class="section-title">All Supported Racetracks</h2>
            <p class="section-subtitle">Comprehensive coverage of major racetracks with live data and algorithmic insights.</p>
          </div>
          
          <div class="sort-controls">
            <label for="track-sort">Sort by:</label>
            <select id="track-sort" v-model="sortBy" class="sort-select">
              <option value="alphabetical">Alphabetical</option>
              <option value="nextRace">Next Race Date</option>
            </select>
          </div>
        </div>

        <div class="tracks-grid" v-reveal.stagger>
          <NuxtLink 
            v-for="track in sortedTracks" 
            :key="track.id"
            :to="`/racetracks/${track.id}`"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import CurrentlyRacingTicker from '~/components/CurrentlyRacingTicker.vue'
import tracksData from '~/data/tracks.json'

const sortBy = ref('alphabetical')

const sortedTracks = computed(() => {
  const tracks = [...tracksData.tracks]
  
  if (sortBy.value === 'alphabetical') {
    return tracks.sort((a, b) => a.name.localeCompare(b.name))
  } 
  
  if (sortBy.value === 'nextRace') {
    return tracks.sort((a, b) => a.nextRace.localeCompare(b.nextRace))
  }
  
  return tracks
})
</script>

<style lang="scss" scoped>
// .track-card → components/_track-cards.scss
.racetracks-page { background-color: var(--bg-page); }

.all-tracks-section { padding-block: var(--section-pad); }

// Title left, sort control right (stacks on phones)
.section-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  margin-bottom: var(--space-8);
  text-align: left;

  @include up(md) { flex-direction: row; align-items: flex-end; justify-content: space-between; }

  .section-title { text-align: left; margin-bottom: var(--space-1); }
  .section-subtitle { margin: 0; text-align: left; }
}

// Here .tracks-grid is the card grid itself (on the homepage it is the section)
.tracks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  padding: 0;
  background: none;

  @include up(md) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-7); }
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
</style>