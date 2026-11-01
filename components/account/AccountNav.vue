<template>
  <nav class="account-nav" aria-label="Account">
    <div class="container">
      <ul class="account-nav__list" role="list">
        <li v-for="tab in tabs" :key="tab.label">
          <NuxtLink
            v-if="tab.to"
            :to="tab.to"
            class="account-nav__link"
            :class="{ 'is-active': route.path === tab.to }"
            :aria-current="route.path === tab.to ? 'page' : undefined"
          >{{ tab.label }}</NuxtLink>
          <span v-else class="account-nav__soon" aria-disabled="true">{{ tab.label }}<small>Soon</small></span>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
// Tabs across the account area. Add `to` as each page ships.
const route = useRoute()
const tabs = [
  { label: 'Overview', to: '/account' },
  { label: 'Program History', to: '/account/programs' },
  { label: 'Insights', to: '/account/insights' },
  { label: 'Settings', to: '/account/settings' }
]
</script>
