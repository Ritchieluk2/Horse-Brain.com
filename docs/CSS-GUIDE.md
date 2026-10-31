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
├── abstracts/                ← NO CSS output. Auto-injected into every <style lang="scss">
│   ├── _tokens.scss          ← $breakpoints, $container-max
│   └── _mixins.scss          ← up(), down(), card(), ornament-frame(), split-hero(), …
├── base/
│   ├── _root.scss            ← ALL design tokens as CSS variables (colours, type, space…)
│   ├── _fonts.scss           ← Amagro @font-face (Raleway comes from Google Fonts)
│   ├── _reset.scss           ← modern reset (replaces Bootstrap Reboot)
│   ├── _typography.scss      ← headings, .link-underline / .horse-link, .eyebrow
│   └── _layout.scss          ← .container, .section, .section-title/-subtitle, .auto-grid
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
│   └── racetracks/_upcoming-races.scss  ← rolodex schedule carousel
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
- Radius: `--radius-sm|md|lg|pill` for buttons, badges, pills and icons. **Cards use the mixed-cut tokens** `--radius-cut` (lg), `--radius-cut-md`, `--radius-cut-sm`. Shadows: `--shadow-sm|md|lg|card|card-hover|brass`.
- Motion: `--ease`, `--ease-out`, `--dur-fast|dur|dur-slow`. Reduced-motion is handled globally.

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
11. Never design for "stickiness": no countdown pressure, no flashing wins (see Project Document → Philosophy).
