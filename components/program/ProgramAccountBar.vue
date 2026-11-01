<template>
  <div class="program-account">
    <!-- Programs just moved from this browser into the account -->
    <div v-if="importedPrograms" class="form-alert form-alert--success program-account__notice" role="status">
      <p>
        <strong>Saved to your account.</strong>
        We moved {{ importedPrograms === 1 ? 'the program' : `${importedPrograms} programs` }} you filled in on this
        browser into your account. <NuxtLink class="text-link" to="/account/programs">See your history</NuxtLink>
      </p>
      <button type="button" class="btn btn--text btn--small" @click="importedPrograms = 0">Dismiss</button>
    </div>

    <!-- Signed in: where things stand -->
    <p v-if="program.mode.value === 'account'" class="program-account__status" :class="`is-${program.sync.value}`" role="status" aria-live="polite">
      <template v-if="program.sync.value === 'load-error'">
        We couldn’t load your saved program, so changes aren’t being saved.
        <button type="button" class="program-account__retry" @click="program.retry()">Try again</button>
      </template>
      <template v-else-if="program.sync.value === 'error'">
        Your last change wasn’t saved. Check your connection.
        <button type="button" class="program-account__retry" @click="program.retry()">Try again</button>
      </template>
      <template v-else-if="program.sync.value === 'saving'">Saving to your account…</template>
      <template v-else-if="program.sync.value === 'loading'">Loading your program…</template>
      <template v-else>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        {{ program.hasInput.value ? 'Saved to your account' : 'Everything you enter is saved to your account' }}
        <span class="program-account__sep" aria-hidden="true">·</span>
        <NuxtLink class="text-link" to="/account/programs">My program history</NuxtLink>
      </template>
    </p>

    <!-- Signed out, with entries: invite them to keep it -->
    <aside v-else-if="program.hasInput.value && !dismissed" class="program-account__invite" aria-labelledby="program-keep-title">
      <div class="program-account__invite-text">
        <h2 id="program-keep-title" class="program-account__title">Keep this program</h2>
        <p>
          Right now your bets and notes live only in this browser. Create a free account to save them,
          open them on any device, and see your results across every raceday.
        </p>
      </div>
      <div class="program-account__actions">
        <NuxtLink :to="{ path: '/sign-up', query: { redirect: route.fullPath } }" class="btn btn--primary">Create Free Account</NuxtLink>
        <NuxtLink :to="{ path: '/sign-in', query: { redirect: route.fullPath } }" class="btn btn--outline">Sign In</NuxtLink>
        <button type="button" class="btn btn--text btn--small" @click="dismiss">Not now</button>
      </div>
    </aside>

    <!-- Signed out, nothing entered yet (or invite dismissed) -->
    <p v-else class="program-account__status is-guest">
      Saved on this device only.
      <NuxtLink class="text-link" :to="{ path: '/sign-up', query: { redirect: route.fullPath } }">Create a free account</NuxtLink>
      to keep your programs on every device, or
      <NuxtLink class="text-link" :to="{ path: '/sign-in', query: { redirect: route.fullPath } }">sign in</NuxtLink>.
    </p>
  </div>
</template>

<script setup>
// Save status for signed-in users; a low-key invitation to sign up for
// guests once they've entered something. No timers, no nagging: "Not now"
// hides the invitation for the rest of this browser session.
import { ref, onMounted } from 'vue'

const props = defineProps({ program: { type: Object, required: true } })

const route = useRoute()
const { importedPrograms } = useAuth()

const DISMISS_KEY = 'hb:program-invite-dismissed'
const dismissed = ref(false)

onMounted(() => {
  try { dismissed.value = window.sessionStorage.getItem(DISMISS_KEY) === '1' } catch { /* ignore */ }
})

function dismiss() {
  dismissed.value = true
  try { window.sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
}
</script>
