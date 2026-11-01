<template>
  <!--
    The one way to link to a Raceday Program (premium, brass button).
    Pass `race` to jump straight to that race's sheet (#race-N).
    When the program becomes members-only, gate it here: every entry
    point on the site uses this component.
  -->
  <NuxtLink
    :to="to"
    class="btn btn--premium program-link"
    :class="{ 'btn--small': small }"
    :aria-label="ariaLabel"
  >
    <svg :width="small ? 14 : 16" :height="small ? 14 : 16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>
    </svg>
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  track: { type: String, required: true },   // track id, e.g. 'KEE'
  date: { type: String, required: true },    // 'YYYY-MM-DD'
  race: { type: [Number, String], default: null },
  label: { type: String, default: 'Raceday Program' },
  small: { type: Boolean, default: false }
})

const to = computed(() => {
  const base = `/program/${String(props.track).toUpperCase()}/${String(props.date).slice(0, 10)}`
  return props.race ? `${base}#race-${props.race}` : base
})

const ariaLabel = computed(() =>
  props.race ? `Race ${props.race} in the Raceday Program` : 'Open the Raceday Program'
)
</script>

<style lang="scss" scoped>
.program-link { gap: var(--space-2); }
</style>
