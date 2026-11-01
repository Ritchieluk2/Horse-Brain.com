// =============================================================
//  v-reveal: HorseBrain's scroll-reveal directive
//  (brand rules: docs/BRANDING.md §Motion · CSS: assets/scss/base/_motion.scss)
//
//    <section v-reveal>                  rise + fade in (default)
//    <p v-reveal="'fade'">               fade only, no movement
//    <div v-reveal.stagger>              reveal each child in turn
//    <div v-reveal="{ delay: 120 }">     extra delay in ms
//
//  Once a revealed block appears, its branded "moments" play by
//  themselves (see _motion.scss): brass corner brackets draw in,
//  bars fill, 1st/2nd/3rd medals catch a single glint, and ornament
//  rules draw outwards.
//
//  Safety rules built in:
//   • Server HTML is always fully visible. Nothing is hidden until
//     JavaScript runs, so content never disappears if a script fails.
//   • During the first page load, anything already on screen is left
//     alone. Only content below the fold waits to be revealed, so the
//     reader never sees text vanish and come back.
//   • prefers-reduced-motion: the directive does nothing at all.
//   • Each element reveals once. Afterwards every helper class is
//     removed, so hover states and transitions work as normal.
// =============================================================
import type { Directive, DirectiveBinding } from 'vue'

type Variant = 'rise' | 'fade'
interface RevealValue { variant?: Variant; delay?: number }
type Binding = DirectiveBinding<Variant | RevealValue | undefined>

const STAGGER_MS = 80      // gap between items in the same batch
const STAGGER_CAP = 6      // after 6 items, the rest share the last delay
const SETTLE_MS = 1900     // longest inner moment (glint), then clean up

interface ItemState { delay: number; done: boolean }
const items = new WeakMap<Element, ItemState>()

function parse(binding: Binding): Required<RevealValue> {
  const v = binding.value
  if (typeof v === 'string') return { variant: v, delay: 0 }
  return { variant: v?.variant ?? 'rise', delay: v?.delay ?? 0 }
}

function inViewport(el: Element) {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0 && r.width + r.height > 0
}

function play(el: HTMLElement, order: number) {
  const state = items.get(el)
  if (!state || state.done) return
  state.done = true
  const delay = state.delay + Math.min(order, STAGGER_CAP) * STAGGER_MS
  el.style.setProperty('--reveal-delay', `${delay}ms`)
  el.classList.add('is-revealing')
  el.classList.remove('reveal-pending')
  window.setTimeout(() => {
    el.classList.remove('is-revealing')
    el.style.removeProperty('--reveal-delay')
    el.style.removeProperty('--reveal-rise')
  }, delay + SETTLE_MS)
}

let observer: IntersectionObserver | null = null
function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver((entries) => {
    // Items that arrive in the same batch are staggered in DOM order
    let order = 0
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      observer!.unobserve(entry.target)
      play(entry.target as HTMLElement, order++)
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 })
  return observer
}

function targetsOf(el: HTMLElement, binding: Binding): HTMLElement[] {
  return binding.modifiers.stagger ? (Array.from(el.children) as HTMLElement[]) : [el]
}

export default defineNuxtPlugin((nuxtApp) => {
  const reveal: Directive<HTMLElement, Variant | RevealValue | undefined> = {
    // Marks the element in server HTML too (handy for debugging + docs)
    getSSRProps(binding) {
      return { 'data-reveal': parse(binding as Binding).variant }
    },

    mounted(el, binding) {
      const { variant, delay } = parse(binding)
      el.dataset.reveal = variant

      if (
        typeof IntersectionObserver === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) return

      // First paint: never hide what the reader can already see
      const firstLoad = nuxtApp.isHydrating
      const io = getObserver()

      for (const item of targetsOf(el, binding)) {
        if (items.has(item)) continue
        if (firstLoad && inViewport(item)) {
          items.set(item, { delay, done: true })   // seen already, so leave it
          continue
        }
        items.set(item, { delay, done: false })
        if (variant === 'fade') item.style.setProperty('--reveal-rise', '0px')
        item.classList.add('reveal-pending')
        io.observe(item)
      }
    },

    // v-for lists that grow later (Load more…) reveal their new children
    updated(el, binding) {
      if (!binding.modifiers.stagger || !observer) return
      const { variant, delay } = parse(binding)
      for (const item of targetsOf(el, binding)) {
        if (items.has(item)) continue
        items.set(item, { delay, done: false })
        if (variant === 'fade') item.style.setProperty('--reveal-rise', '0px')
        item.classList.add('reveal-pending')
        observer.observe(item)
      }
    },

    beforeUnmount(el, binding) {
      if (!observer) return
      for (const item of targetsOf(el, binding)) observer.unobserve(item)
    },
  }

  nuxtApp.vueApp.directive('reveal', reveal)
})
