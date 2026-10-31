<template>
  <header class="site-header" :class="{ 'is-open': menuOpen }">
    <div class="site-header__bar container">
      <NuxtLink to="/" class="site-header__brand" aria-label="HorseBrain home">
        <img src="../../static/horse.png" alt="" class="site-header__logo" width="40" height="40" />
        <span class="site-header__wordmark">HorseBrain</span>
      </NuxtLink>

      <button
        class="site-header__toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="site-nav"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        @click="menuOpen = !menuOpen"
      >
        <span class="site-header__toggle-bar" aria-hidden="true"></span>
        <span class="site-header__toggle-bar" aria-hidden="true"></span>
        <span class="site-header__toggle-bar" aria-hidden="true"></span>
      </button>

      <nav id="site-nav" class="site-nav" aria-label="Main">
        <ul class="site-nav__list" role="list">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="site-nav__link"
              :class="{ 'is-active': isActive(link) }"
            >{{ link.label }}</NuxtLink>
          </li>
          <li class="site-nav__cta-item">
            <NuxtLink
              to="/todays-picks"
              class="site-nav__cta"
              :class="{ 'is-active': isActive({ to: '/todays-picks' }) }"
            >Today's Picks</NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
    <div class="site-header__scrim" aria-hidden="true" @click="menuOpen = false"></div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

// `match` lists the path prefixes that should light up each link
const links = [
  { to: '/TodayRaces', label: "Today's Races", match: ['/todayraces', '/racedays'] },
  { to: '/Racetracks', label: 'Racetracks', match: ['/racetracks'] },
  { to: '/our-track-record', label: 'Our Track Record', match: ['/our-track-record'] },
  { to: '/contact', label: 'Contact Us', match: ['/contact'] },
]

const isActive = (link) => {
  const path = route.path.toLowerCase()
  const prefixes = link.match || [link.to.toLowerCase()]
  return prefixes.some(p => path === p || path.startsWith(`${p}/`))
}

// Close the drawer on navigation
watch(() => route.fullPath, () => { menuOpen.value = false })

// Lock page scroll while the drawer is open
watch(menuOpen, (open) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('nav-open', open)
  }
})

const onKey = (e) => { if (e.key === 'Escape') menuOpen.value = false }
const onResize = () => { if (window.innerWidth >= 1280) menuOpen.value = false }

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  document.documentElement.classList.remove('nav-open')
})
</script>

<style lang="scss" scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background-color: var(--color-espresso);
  color: var(--color-white);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.25);

  // The "white rail": a hairline that fades out, like track rail paint
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-image: linear-gradient(to right, rgb(255 255 255 / 0.85) 0%, rgb(255 255 255 / 0.4) 60%, transparent 100%);
    pointer-events: none;
  }

  // Signature rail frame: two white rails crossing at the top-left
  // corner (pairs with the gradient rail along the bottom edge).
  &__bar {
    @include rail-frame(
      rgb(255 255 255 / 0.9),
      calc(var(--gutter) - 12px),   // corner sits just left of the logo
      10px,                          // …and just below the top edge
      8px,                           // rails overlap past the corner
      calc(var(--header-h) - 26px)
    );
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    height: var(--header-h);
    padding-top: 12px;            // breathing room under the top rail

    @include up(lg) { padding-top: 16px; }
  }

  &__brand {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    color: var(--color-white);
  }

  &__logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: var(--radius-sm);

    @include up(xl) { width: 44px; height: 44px; }
  }

  &__wordmark {
    @include heading-font;
    font-size: 1.5rem;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    white-space: nowrap;

    @include up(sm) { font-size: 1.75rem; }
    @include up(xl) { font-size: 2rem; }
    @media (min-width: 1440px) { font-size: 2.25rem; }
  }

  // ---- Hamburger ----
  &__toggle {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 44px;
    height: 44px;
    margin-right: -8px;
    border-radius: var(--radius-sm);
    color: var(--color-white);

    &:focus-visible { @include focus-ring; }

    @include up(xl) { display: none; }
  }

  &__toggle-bar {
    display: block;
    width: 24px;
    height: 2px;
    border-radius: 2px;
    background-color: currentColor;
    transition: transform var(--dur) var(--ease), opacity var(--dur-fast) ease;
  }

  &.is-open &__toggle-bar {
    &:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    &:nth-child(2) { opacity: 0; }
    &:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  }

  // Dim the page behind the mobile drawer
  &__scrim {
    position: fixed;
    inset: var(--header-h) 0 0 0;
    background: rgb(29 28 33 / 0.55);
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--dur) ease, visibility var(--dur) ease;

    @include up(xl) { display: none; }
  }

  &.is-open &__scrim { opacity: 1; visibility: visible; }
}

// ---- Navigation ----
.site-nav {
  // Mobile drawer: drops down under the bar
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: var(--z-drawer);
  max-height: calc(100dvh - var(--header-h));
  overflow-y: auto;
  padding: var(--space-3) var(--gutter) var(--space-6);
  background-color: var(--color-espresso);
  border-top: 1px solid rgb(255 255 255 / 0.12);
  box-shadow: 0 16px 32px rgb(0 0 0 / 0.35);
  transform: translateY(-8px);
  opacity: 0;
  visibility: hidden;
  transition: transform var(--dur) var(--ease), opacity var(--dur) ease, visibility var(--dur) ease;

  .is-open & {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  @include up(xl) {
    position: static;
    max-height: none;
    overflow: visible;
    padding: 0;
    background: none;
    border: 0;
    box-shadow: none;
    transform: none;
    opacity: 1;
    visibility: visible;
  }

  &__list {
    display: flex;
    flex-direction: column;

    @include up(xl) {
      flex-direction: row;
      align-items: center;
      gap: var(--space-6);
    }

    @media (min-width: 1440px) { gap: var(--space-7); }
  }

  &__link {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 52px;
    @include heading-font;
    font-size: var(--fs-md);
    color: rgb(255 255 255 / 0.85);
    border-bottom: 1px solid rgb(255 255 255 / 0.1);
    transition: color var(--dur-fast) ease;

    &.is-active { color: var(--color-baby-blue); }
    &:focus-visible { @include focus-ring; }

    @include up(xl) {
      min-height: 0;
      padding: 6px 0;
      border-bottom: 0;
      font-size: 1rem;
      white-space: nowrap;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 100%;
        height: 2px;
        background-color: var(--color-white);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--dur) var(--ease-out);
      }

      &:hover,
      &.is-active {
        color: var(--color-white);
        &::after { transform: scaleX(1); }
      }
    }

    @media (min-width: 1440px) { font-size: 1.1rem; }
  }

  &__cta-item {
    margin-top: var(--space-5);
    @include up(xl) { margin-top: 0; }
  }

  // "Today's Picks" — the primary nav CTA, brass-trimmed
  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 10px 28px;
    border: 2px solid var(--color-brass);
    border-radius: var(--radius-sm);
    background-color: rgb(199 169 107 / 0.12);
    @include heading-font;
    font-size: var(--fs-md);
    letter-spacing: 0.03em;
    color: var(--color-white);
    white-space: nowrap;
    transition: background-color var(--dur-fast) ease, border-color var(--dur-fast) ease, color var(--dur-fast) ease;

    &:hover,
    &.is-active {
      background-color: var(--color-fern);
      border-color: var(--color-fern);
      color: var(--color-white);
    }

    &:focus-visible { @include focus-ring; }

    @include up(xl) {
      position: relative;
      min-height: 44px;
      padding: 8px 24px;
      font-size: 1rem;

      // Same sliding underline as the other nav links, just below the button
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -8px;
        width: 100%;
        height: 2px;
        background-color: var(--color-white);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--dur) var(--ease-out);
      }

      &:hover::after,
      &.is-active::after { transform: scaleX(1); }
    }

    @media (min-width: 1440px) { padding: 10px 28px; font-size: 1.05rem; }
  }
}
</style>

<style lang="scss">
// Lock body scroll while the mobile drawer is open
html.nav-open { overflow: hidden; }
@media (min-width: 1280px) { html.nav-open { overflow: auto; } }
</style>
