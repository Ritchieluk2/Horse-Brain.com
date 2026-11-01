# HorseBrain CSS Guide

> Brand rules (the *why*) live in `docs/BRANDING.md`. This guide is the *how* in code.

How styling works in this repo. Read this before writing any CSS.
Owner of the styling system: **Claude**. Layout/components: **Qwen**.

---

## 1. Architecture at a glance

There is **one** styling system: SCSS + CSS custom properties.
No Bootstrap, no Tailwind, no utility-class frameworks.

```
assets/scss/
├── main.scss                 ← the only global entry (loaded in nuxt.config.ts)
│                                (JS side of motion: plugins/reveal.ts → v-reveal)
├── abstracts/                ← NO CSS output. Auto-injected into every <style lang="scss">
│   ├── _tokens.scss          ← $breakpoints, $container-max
│   └── _mixins.scss          ← up(), down(), card(), ornament-frame(), split-hero(), …
├── base/
│   ├── _root.scss            ← ALL design tokens as CSS variables (colours, type, space…)
│   ├── _fonts.scss           ← Amagro @font-face (Raleway comes from Google Fonts)
│   ├── _reset.scss           ← modern reset (replaces Bootstrap Reboot)
│   ├── _typography.scss      ← headings, .link-underline / .horse-link, .eyebrow
│   ├── _layout.scss          ← .container, .section, .section-title/-subtitle, .auto-grid
│   ├── _motion.scss          ← v-reveal states, branded moments, keyframes (loaded LAST)
│   └── _print.scss           ← site-wide print basics (hide header/footer)
├── components/               ← shared, GLOBAL component styles (used on 2+ pages)
│   ├── _buttons.scss         ← .btn + variants
│   ├── _badges.scss          ← status pills, confidence chips, tags, pick icons
│   ├── _page-title.scss      ← <PageTitle> band + breadcrumbs
│   ├── _ticker.scss          ← homepage LIVE marquee
│   ├── _track-cards.scss     ← photo track cards
│   ├── _race-row.scss        ← race accordion + Our Pick panel + participants table
│   ├── _picks.scss           ← prediction / premium cards, WPS, exacta/trifecta
│   ├── _stats.scss           ← track-record band, stat-card odometer, .metric, info/stats cards
│   ├── _cta.scss             ← .final-cta, .schedule-cta, .newsletter-cta, .newsletter
│   ├── _states.scss          ← 404/not-found + fade transition
│   ├── racetracks/_upcoming-races.scss  ← rolodex schedule carousel
│   ├── _program.scss          ← Raceday Program (screen + @media print)
│   ├── _forms.scss            ← .form-field/.form-input/.form-check/.form-alert (all forms)
│   └── _auth.scss             ← sign-in / sign-up shell (.auth card + espresso aside)
└── pages/_homepage.scss      ← hero + featured pick cards
```

Page `.vue` files keep a `<style lang="scss" scoped>` block **only for that page's layout**
(hero, page grid, one-off sections). If a pattern shows up on a second page, it moves
into `assets/scss/components/`.

---

## 2. Tokens: never hard-code values

Everything comes from `base/_root.scss`. Raw hex values, ad-hoc px font sizes and
one-off shadows are not allowed in components.

### Brand palette

| Token | Hex | Role |
|---|---|---|
| `--color-baby-blue` | `#85ABFF` | Kentucky sky. Primary buttons, links **on dark**, accents |
| `--color-espresso` | `#45201A` | Earth. Body text, headings, header, program discs |
| `--color-fern` | `#366B24` | Turf. Success, high confidence, positive deltas |
| `--color-white` | `#FFFFFF` | Rail paint. Surfaces |
| `--color-shadow-grey` | `#1D1C21` | Night. Dark bands, page titles, CTAs |
| `--color-brass` | `#C7A96B` | **Premium / high-confidence shine.** Corner brackets, inlays, active pick, premium badges |

### Ink variants (for TEXT on light backgrounds — WCAG AA)

Baby blue (2.3:1), brass (2.3:1) and live red (2.8:1) **fail** as text on white.

| Use this on light bg | Instead of |
|---|---|
| `--color-blue-ink` `#3B67BF` | baby blue text |
| `--color-brass-ink` `#8A6D32` | brass text |
| `--color-live-ink` `#C23B3B` | live red text |
| `--color-fern-on-dark` `#7EC96A` | fern text **on dark** backgrounds |

### Semantic tokens (prefer these)

`--bg-page`, `--bg-alt`, `--bg-dark`, `--bg-dark-warm`, `--surface`, `--surface-cream`,
`--text-primary`, `--text-secondary`, `--text-on-dark`, `--text-on-dark-muted`,
`--border-color`, `--border-strong`, `--border-on-dark`,
`--confidence-{high|medium|low}` (+ `-bg`), `--status-{live|upcoming|final}` (+ `-bg`),
`--premium`, `--premium-bg`.

### Type, space, shape, motion

- Fonts: `--font-heading` (Amagro) and `--font-body` (Raleway). Use `@include heading-font` for display text.
- Sizes (fluid): `--fs-2xs … --fs-display`. Headings h1–h4 are already sized globally.
- Spacing: `--space-1` (4px) … `--space-11` (100px). Sections: `--section-pad`, `--section-pad-sm`.
- Side padding: `--gutter` (16 → 24 → 32px). Use `.container` rather than custom max-widths.
- Radius: **buttons and form controls** use uniform `--radius-sm`. **Labels** (badges, tags, status pills, confidence chips, verdicts) use the mixed-cut `--radius-label`, so they never look clickable. Logo plates on photos use `--radius-plate`. `--radius-pill` is only for round controls (the race schedule dots). **Cards use the mixed-cut tokens** `--radius-cut` (lg), `--radius-cut-md`, `--radius-cut-sm`. Shadows: `--shadow-sm|md|lg|card|card-hover|brass`.
- Motion: `--ease`, `--ease-out`, `--dur-fast|dur|dur-slow` for interaction; `--ease-settle`, `--dur-reveal`, `--dur-moment` for arrivals. Reduced-motion is handled globally.

---

## 3. Responsive rules

**Mobile-first.** Write the phone layout first, then add `up()` overrides.

| Name | Min width | Typical device |
|---|---|---|
| `sm` | 576px | large phones / landscape |
| `md` | 768px | tablet portrait |
| `lg` | 1024px | tablet landscape / laptop |
| `xl` | 1280px | desktop (the header's inline nav appears here; below it's the hamburger menu) |

```scss
.thing {
  display: grid;
  grid-template-columns: 1fr;            // phone
  @include up(md) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @include up(lg) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```

- Never write raw `@media (max-width: 900px)`. Use `up()` / `down()` with the four names above.
- Use `minmax(0, 1fr)` in grids and `min-width: 0` on flex children so long names don't overflow.
- Tap targets ≥ 44px tall (buttons, nav links, toggles).
- Wide tables: `.participants-table` scrolls horizontally on phones; follow that pattern.
- Test at **360, 375, 768, 1024, 1366px**. No horizontal page scroll at any width.

---

## 4. Mixins you should reach for

| Mixin | Use for |
|---|---|
| `up($bp)` / `down($bp)` / `hover` | media queries (hover only on real pointers) |
| `heading-font` | Amagro, bold, no faux-bold |
| `label-caps($size, $tracking)` | small uppercase labels ("POST", "DISTANCE") |
| `truncate` / `visually-hidden` / `focus-ring` | utilities |
| `mixed-cut($r)` | **the card shape**: sharp top-left + bottom-right, rounded top-right + bottom-left |
| `card($pad, $radius)` | white mixed-cut card with hairline + layered shadow |
| `frame($corner)` (= `ornament-frame`) | **the frame**: inner hairline frame + brass corner brackets on the sharp corners (`__frame`, `__corner--tl/--br`) |
| `paper($base, $deep)` | paper texture (cream panels, Our Pick) |
| `medal(gold\|silver\|bronze)` | metallic finish for 1st/2nd/3rd place circles |
| `place-num($size, $font)` | **place number**: solid circle (espresso; medals via `[data-place]`) |
| `horse-num($size, $font)` | **program number (pgm)**: transparent bordered square in saddlecloth colour via `[data-pgm]` |

**Number icons (components/_numbers.scss).** Markup needs only a data attribute:
`<span class="place-num" :data-place="n">n</span>` and `<span class="horse-num" :data-pgm="pgm">{{ pgm }}</span>`.
Existing BEM classes (`exacta-slot__program`, `wps-row__position`, `prediction-card__program` …) already include
these. Medal rules sit at the end of the file so they override sizing rules. In a scoped block, re-add the
`[data-place]` medal lines after any `place-num` include, because scoped styles load later.

Surface recipes worth reusing:
- **Inlaid business card** (`.pick-card`): white paper stock (grain + fine fibres), hairline edge, and *inset* shadows on the top/left with a light catch on the bottom, so it sits recessed into a cream section. No drop shadow and no hover lift.
- **Layered band** (`section.tracks-grid`): `textured-band` in cream, with a top shadow cast by the section above, an inlaid bottom edge into the next section, plus text and card shadows.
| `brass-inlay` | thin brass rule inset inside a band |
| `paper` | cream paper texture (Our Pick panel) |
| `program-disc($size, $font)` | saddlecloth number circle |
| `split-hero($min-h)` | dark text panel + bleeding track photo (`__grid/__content/__visual/__bg/__overlay`) |
| `stat-row` + `stat-item` | hero meta rows (Post · Distance · Surface …) |
| `rail-frame($color, $inset-x, $inset-y, $overhang, $length-y)` | **signature** white rails crossing at the top-left corner (uses `::before`/`::after`) |
| `textured-band($base, $deep, …)` | **signature** inlaid band: grain + fibres + vignette + inset shadow |

> Asset filenames: lowercase-kebab only (`hero-finish-line.webp`). No spaces, parentheses or
> quotes. The production build writes CSS `url()` without quotes, so `photo_(123).webp` silently
> drops the whole `background-image` line on the live site, while it still works in `npm run dev`.

> Sass gotcha: never write `rgb(r g b / $variable)`. Sass treats the `/` as division and
> silently produces a wrong, opaque colour. With a variable alpha, use `rgba(r, g, b, $variable)`.
> Literal values like `rgb(29 28 33 / 0.5)` are fine.

---

## 5. Shared component classes (markup contracts)

Use these class names and the shared CSS applies automatically. **Don't restyle them
in a scoped block.** Ask for a modifier instead.

- Buttons: `.btn` + `--primary | --secondary (dark bg only) | --outline (light bg) | --tertiary | --dark | --premium | --text`, sizes `--small | --large | --block`. Button rows: `.btn-group`.
- Section heading: `.section-header > .section-title + .section-subtitle`.
- Status: `.status-badge--live|upcoming|completed` (or `.race-row__status-badge--*`).
- Confidence: `.confidence--high|medium|low`. High confidence gets a brass ring.
- Ornament element pattern (any card using `ornament-frame`):
  ```html
  <span class="x__frame" aria-hidden="true"></span>
  <i class="x__corner x__corner--tl" aria-hidden="true"></i>
  <i class="x__corner x__corner--br" aria-hidden="true"></i>
  ```
- Race list: `.races-list > .race-row` (see `_race-row.scss` for the element names).
- Picks: `.predictions-grid > .prediction-card`, `.premium-grid > .premium-card`, `.wps-row`, `.exacta-slot`.
- Stats: `.track-record`, `.stats-grid > .stat-card` (odometer: `.char-roll`, `.char-static`), `.metric`, `.summary-stat`.
- CTAs: `.final-cta` / `.schedule-cta` (`__inner/__text/__title/__subtitle/__actions`), `.newsletter-cta` (`--hero` for /contact).
- Links on names: `.horse-link` (or `.link-underline`).
- Textured bands for new sections: `.band--fern`, `.band--blue` (put content in a `.container`).
- Names: add `.horse-name` / `.jockey-name` to any new markup that shows a horse or a person.
- Forms: `.form > .form-field > label.form-label + .form-input|.form-select + p.form-hint + p.form-error`.
  Rows `.form-row` (`--address`), groups `fieldset.form-fieldset > legend`, checkboxes
  `label.form-check > input + span.form-check__text`, banners `.form-alert--error|success|info`.
  Mark invalid inputs with `aria-invalid="true"` (that's what turns them red) and point
  `aria-describedby` at the error. Inputs stay 16px so iOS doesn't zoom.

---

## 5a. Motion: `v-reveal` (plugins/reveal.ts + base/_motion.scss)

Brand rules: BRANDING.md §10. Don't add AOS or other animation libraries.

```html
<h2 class="section-title" v-reveal>…</h2>           <!-- rise + fade (default) -->
<p v-reveal="'fade'">…</p>                          <!-- fade only -->
<div class="predictions-grid" v-reveal.stagger>     <!-- each CHILD reveals in turn -->
<div class="x" v-reveal="{ delay: 120 }">           <!-- extra delay, ms -->
```

- **Inner moments are automatic.** Inside a revealing element, the following play by themselves:
  brass corners (`<i class="x__corner x__corner--tl|br" aria-hidden>`), frames
  (`<span class="x__frame" aria-hidden>`), bars (`.probability-bar__fill`,
  `.confidence-row__fill`, `.metric__bar-fill`, or any `[data-fill]`), medals (`[data-place="1–3"]`)
  and the track-record ornament. No extra markup needed.
- **Lifecycle:** `.reveal-pending`, then `.is-revealing`, then no class. After about 2s every helper
  class is removed, so hover lifts and transitions work as normal.
- **Put it on:** section headers, cards and card grids (`.stagger`), race and history lists
  (`.stagger`), CTA inner panels, stat cards.
- **Don't put it on:**
  - the hero or page title (first paint)
  - disclaimers
  - elements that use `transform` for layout (the carousel's `.race-card`, absolutely centred
    items). Wrap them in a div instead.
  - anything inside `UpcomingRacesCarousel`
- Lists that grow (Load more, tab switches) reveal their new children automatically.
- Header rails draw in via CSS in `Header.vue` (`hb-rail-x` / `hb-rail-y`). Page changes use
  Nuxt `experimental.viewTransition`. The header has `view-transition-name: site-header`.
- New keyframes go in `_motion.scss` with the `hb-` prefix.

---

## 5b. Print styles

- Site-wide basics are in `base/_print.scss`: the header, footer and loading bar are hidden, and the page is white.
- A page that has a real printed form keeps its print rules **with its component partial**,
  inside `@media print { … }` at the bottom (see `_program.scss`).
- Use print units (`pt`, `mm`), `break-before: page` for page breaks, and
  `print-color-adjust: exact` where colour carries meaning (saddlecloths, medals).
- Paper-only markup (ruled bet lines, notes lines) is `display: none` on screen, and screen-only
  controls are `display: none` in print. Never use `visibility`, because it leaves gaps.
- Test by printing to PDF. The browser pane can't show print preview.
- `.visually-hidden` is now a global utility class (base/_layout.scss) as well as a mixin.

---

## 6. Brand usage rules

1. **Brass means premium or high confidence.** Don't use it decoratively on ordinary content.
2. Baby blue is the **action** colour (primary buttons, links). Use blue-ink for text on white.
3. Fern = positive / win / high confidence. Red (`--color-live*`) = LIVE and negative only.
4. Dark bands alternate: shadow grey (CTAs, titles) and espresso (track record, header).
5. Responsible-gambling copy keeps full contrast. Never fade disclaimers below `--text-on-dark-faint`.
6. **Horse names are always Amagro; jockey / trainer / owner names are always Raleway.** This is enforced in `base/_typography.scss`.
7. **Every card is mixed-cut.** Never give a card, tile or photo panel a uniform `border-radius`; use `@include mixed-cut` / `card()` or `var(--radius-cut*)`. Left-edge colour bars must start from a sharp top corner.
8. **"The frame" is the brass treatment only**: inner hairline + brass brackets on the two sharp corners. Add it to premium, featured and high-confidence items, not to everything.
9. **Black on blue:** on baby-blue backgrounds use `--color-shadow-grey` for text and dark buttons, never espresso.
10. **Signature frame language:** the rail frame (top-left crossing rails) and the brass corner brackets (top-left + bottom-right) belong together. New framed elements should use one of them, not invent a new corner style.
11. Motion settles once: use `v-reveal`, never loops (LIVE only), never on hero/title/disclaimers (BRANDING §10).
12. Never design for "stickiness": no countdown pressure, no flashing wins (see Project Document → Philosophy).
