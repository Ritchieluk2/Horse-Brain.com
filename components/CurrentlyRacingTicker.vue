<template>
  <section class="currently-racing">
    <div class="container">
      <h3 class="currently-racing__subtitle">Currently Racing</h3>
    </div>
    
    <div class="ticker-wrapper">
      <div class="ticker-track">
        <!-- Duplicated twice for seamless infinite looping -->
        <div v-for="n in 2" :key="n" class="ticker-items">
          <div v-for="track in activeTracks" :key="track.id" class="ticker-item">
            <img :src="track.logo" :alt="`${track.name} Logo`" class="ticker-logo" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import tracksData from '~/data/tracks.json'

const activeTracks = tracksData.tracks
</script>

<style lang="scss" scoped>
// Sage "Currently Racing" band with scrolling white track logos
.currently-racing {
  position: relative;
  padding: var(--space-7) 0 var(--space-6);
  background-color: var(--color-sage);
  border-block: 2px solid var(--color-fern);
  text-align: center;
  overflow: hidden;

  @include up(md) { padding: var(--space-8) 0 var(--space-7); }

  // inner inlaid rule
  &::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px solid rgb(54 107 36 / 0.4);
    border-radius: var(--radius-sm);
    pointer-events: none;
  }

  &__subtitle {
    margin-bottom: var(--space-5);
    @include heading-font;
    font-size: var(--fs-md);
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--color-shadow-grey);

    @include up(md) { margin-bottom: var(--space-7); font-size: var(--fs-lg); }
  }
}

.ticker-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 2;
    width: 48px;
    pointer-events: none;
    @include up(md) { width: 120px; }
  }

  &::before { left: 0; background: linear-gradient(to right, var(--color-sage), transparent); }
  &::after  { right: 0; background: linear-gradient(to left, var(--color-sage), transparent); }
}

.ticker-track {
  display: flex;
  width: max-content;
  animation: hb-marquee 35s linear infinite;
  &:hover { animation-play-state: paused; }
}

.ticker-items {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: 0 var(--space-6);
  @include up(md) { gap: var(--space-10); padding: 0 40px; }
}

.ticker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 64px;
  @include up(md) { height: 80px; }
}

.ticker-logo {
  max-width: 130px;
  max-height: 44px;
  object-fit: contain;
  opacity: 0.75;
  filter: grayscale(100%) brightness(10);   // white logos on sage
  transition: opacity var(--dur) ease, filter var(--dur) ease, transform var(--dur) ease;

  @include up(md) { max-width: 180px; max-height: 60px; }

  @include hover {
    opacity: 1;
    filter: none;
    transform: scale(1.05);
  }
}
</style>