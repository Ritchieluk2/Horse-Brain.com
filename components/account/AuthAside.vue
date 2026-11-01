<template>
  <aside class="auth__aside" aria-labelledby="auth-aside-title">
    <span class="auth__eyebrow">Your HorseBrain account</span>
    <h2 id="auth-aside-title">Keep an honest record of every raceday</h2>
    <p>
      An account is free. It keeps your programs, bets and notes in one place,
      on any device, so you can see how your picks really perform over time.
    </p>

    <ul class="auth__benefits" role="list">
      <li v-for="b in benefits" :key="b.title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span><strong>{{ b.title }}</strong>{{ b.text }}</span>
      </li>
    </ul>

    <p class="auth__rg">
      You must be {{ MINIMUM_AGE }} or older. Wagering involves risk; never bet more than you can
      afford to lose. If gambling stops being fun, call the National Problem Gambling Helpline at
      <a href="tel:18005224700">1-800-522-4700</a> or visit
      <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer">ncpgambling.org</a>.
    </p>
  </aside>
</template>

<script setup>
import { MINIMUM_AGE } from '#shared/account-rules.js'

const benefits = [
  { title: 'Your program history', text: 'Every Raceday Program you fill in, saved to your account instead of one browser.' },
  { title: 'Wins and losses, side by side', text: 'Simple stats on your bets: return, strike rate and how you did with HorseBrain picks.' },
  { title: 'Simulated betting', text: 'Track picks without spending a cent, and set a daily budget if you do wager.' }
]
</script>
