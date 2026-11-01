<template>
  <span class="auth__status" :class="`auth__status--${kind}`" aria-hidden="true">
    <svg v-if="kind === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5" /></svg>
    <svg v-else-if="kind === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9.5" stroke-width="2" /></svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
  </span>
</template>

<script setup>
// kind: 'mail' (default) | 'success' | 'error'
defineProps({ kind: { type: String, default: 'mail' } })
</script>
