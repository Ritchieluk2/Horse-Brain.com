<template>
  <!-- Site-wide "in development" notice. Repeats the footer's development
       band and links to /how-this-site-was-made. Dismissal is remembered
       on this device only (a per-visitor convenience, not real state). -->
  <aside v-if="!dismissed" class="announcement" aria-label="Site notice">
    <div class="container announcement__inner">
      <p class="announcement__text">
        <span class="announcement__label">Currently in development</span>
        <span>All data and predictions are placeholder.</span>
        <NuxtLink to="/how-this-site-was-made" class="announcement__link">Read more</NuxtLink>
      </p>
      <button type="button" class="announcement__close" aria-label="Dismiss this notice" @click="dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Bump the version when the message changes, so everyone sees it again
const KEY = 'hb:announce:v1'

// Hide the bar before first paint for visitors who already dismissed it
// (no flash of the bar, no layout jump). Wrapped in try/catch because
// storage can be blocked.
useHead({
  script: [{
    key: 'hb-announce',
    tagPosition: 'head',
    innerHTML: `try{if(localStorage.getItem('${KEY}')==='dismissed')document.documentElement.classList.add('hb-announce-off')}catch(e){}`
  }]
})

const dismissed = ref(false)

onMounted(() => {
  try { dismissed.value = localStorage.getItem(KEY) === 'dismissed' } catch { /* storage blocked: keep showing */ }
})

function dismiss() {
  dismissed.value = true
  try { localStorage.setItem(KEY, 'dismissed') } catch { /* fine: hidden for this visit */ }
}
</script>

<style lang="scss" scoped>
// Baby-blue band (black on blue) matching the footer's development band
.announcement {
  position: relative;
  z-index: calc(var(--z-header) + 1);
  background-color: var(--color-baby-blue);
  color: var(--color-shadow-grey);
  border-bottom: 2px solid var(--color-blue-ink);
}

// Dismissed on an earlier visit: hidden before Vue loads (script in useHead)
:global(html.hb-announce-off) .announcement { display: none; }

.announcement__inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 44px;
  padding-block: 6px;
}

.announcement__text {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 2px var(--space-3);
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.35;
  text-align: center;
}

.announcement__label {
  @include label-caps(var(--fs-2xs), 0.14em);
  padding: 2px 8px;
  border: 1px solid rgb(29 28 33 / 0.35);
  border-radius: var(--radius-label);
}

.announcement__link {
  font-weight: 700;
  color: var(--color-shadow-grey);
  text-decoration: underline;
  text-underline-offset: 3px;

  @include hover { color: var(--color-ink); text-decoration-thickness: 2px; }
}

.announcement__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-shadow-grey);
  cursor: pointer;
  transition: background-color var(--dur-fast) ease;

  @include hover { background: rgb(29 28 33 / 0.1); }
}

@media print { .announcement { display: none; } }
</style>
