# Handoff for Qwen — working on HorseBrain alongside Claude

_Last updated: 2026-10-31, 2:25 PM_

## 1. The project in one paragraph

**HorseBrain** (horse-brain.com) is a Nuxt 3 site that publishes horse-racing picks produced
by machine-learning models, with a fully transparent, audited track record. Brand values:
*Responsibility, Honesty, Excellence*. It should feel like Kentucky bluegrass: rustic but
refined. We never design for "stickiness" or gambling pressure, and responsible-gambling
disclaimers stay visible. Pages today: Home, Today's Races, Today's Picks, Race Analysis
(`/picks/[track]/[date]/[race]`), Raceday (`/racedays/[track]/[date]`), Track profile
(`/racetracks/[id]`), Racetracks list, Horse / Jockey profiles, Our Track Record, Contact.
Everything currently runs on placeholder JSON in `data/` via `composables/useRacedays.js`
and `composables/useEntityProfile.js`. Live data is the next phase.

## 2. Who does what

| | Qwen | Claude |
|---|---|---|
| Owns | Page/component **structure**: templates, `<script>`, composables, data shape, routing | The **styling system**: `assets/scss/**`, tokens, shared component CSS, responsive behaviour, accessibility/contrast |
| Writes CSS? | Yes, but only **layout** CSS in a page's `<style scoped>`, using tokens + mixins | Refines, consolidates, and promotes repeated patterns to shared partials |
| After you ship | — | Claude does a cleanup pass on your styles |

**The deal:** build the component, use the existing tokens/classes, keep your CSS minimal and
structural, and leave a note. Claude makes it beautiful and consistent afterwards.

## 3. The styling system (read `docs/BRANDING.md` for brand rules, `docs/CSS-GUIDE.md` for code)

- **No Bootstrap. No Tailwind.** Both were removed. Don't use `d-flex`, `col-md-6`, `mt-4`,
  `flex`, `grid-cols-*` and so on. They do nothing now.
- One global entry: `assets/scss/main.scss`. Breakpoint and mixin helpers are **auto-injected**
  into every `<style lang="scss">`, so `@include up(md) { … }` works without imports.
- **Never hard-code colours.** Use CSS variables from `assets/scss/base/_root.scss`:
  `var(--color-espresso)`, `var(--text-secondary)`, `var(--surface)`, `var(--border-color)` …
  Need a colour that doesn't exist? Leave a `/* TOKEN? … */` comment and Claude will add it.
- **Mobile-first.** Base styles target phones. Breakpoints: `sm 576 · md 768 · lg 1024 · xl 1280`.
  Use `@include up(md)`, never raw `@media (max-width: 900px)`.
- Use `minmax(0, 1fr)` in grids and `min-width: 0` on flex children, and keep tap targets ≥ 44px.
- **Brass (`--color-brass` #C7A96B) = premium / high confidence only.**
- **Vocabulary:** *mixed-cut border* = the card shape (sharp top-left + bottom-right, rounded
  top-right + bottom-left). *The frame* = the brass inner hairline + corner brackets added to
  premium / featured cards. **Every new card must be mixed-cut**: use `@include card;` or
  `@include mixed-cut;`. Never use a plain `border-radius` on a card.
- On baby-blue backgrounds, text and dark buttons are black (`--color-shadow-grey`), never brown.
- Baby blue, brass and live-red fail contrast as text on white. Use `--color-blue-ink`,
  `--color-brass-ink`, `--color-live-ink` for text on light backgrounds.

### Reuse before you write

These classes are already styled globally. Use them as-is and **don't restyle them in a
scoped block**:

| Need | Use |
|---|---|
| Buttons | `.btn .btn--primary` · `--secondary` (on dark only) · `--outline` (on light) · `--tertiary` · `--dark` · `--premium` · `--small/--large/--block`; rows in `.btn-group` |
| Section heading | `.section-header > h2.section-title + p.section-subtitle` |
| Page title band | `<PageTitle :title :breadcrumbs>` |
| Race accordion | `.races-list > .race-row` (+ `__header`, `__main`, `__pick`, `__chevron`, `__body`) |
| Field table | `table.participants-table` (scrolls horizontally on phones automatically) |
| Picks | `.predictions-grid > .prediction-card`, `.premium-grid > .premium-card`, `.wps-row`, `.exacta-slot`, `.probability-bar` |
| Stats | `.track-record` band, `.stats-grid > .stat-card` (odometer), `.metric`, `.summary-stat`, `.info-card`, `.stats-card` |
| CTA bands | `.final-cta`, `.newsletter-cta` |
| Status / confidence | `.status-badge--live/upcoming/completed`, `.confidence--high/medium/low` |
| Name links | `.horse-link` (sliding underline) |
| Horse / person names | add `.horse-name` (Amagro) or `.jockey-name` (Raleway). **Horse names are always Amagro, people always Raleway** |
| Textured depth band | `.band--fern` / `.band--blue` |
| Empty state | `.not-found` |
| The frame (brass) | add `__frame` + `__corner--tl/--br` elements and `@include frame;` |
| Card shape | `@include card;` (or `@include mixed-cut;`); never a plain `border-radius` |
| Dark text + photo hero | `@include split-hero;` with `__grid/__content/__visual/__bg/__overlay` |

## 4. How to work with Claude

1. **Don't edit `assets/scss/**` or `nuxt.config.ts`.** Request changes instead (see 5).
2. **One of us per file at a time.** Today both of us were editing `TodayRaces.vue` and the
   raceday page at once. Claude caught it and merged, but tell the user which files you're
   touching so Claude can stay off them.
3. **Mark new styling** with a comment so Claude can find it on the cleanup pass:
   ```scss
   /* NEW(qwen): odds-movement chart wrapper — needs styling pass */
   ```
4. **Keep class names BEM** (`block__element--modifier`) and descriptive. Claude's shared CSS
   depends on the class names listed above; renaming them breaks styling.
5. **Don't change data shapes silently.** If you restructure `data/*.json`, update every page
   that reads it in the same change, and say so in your summary (see bug #1 below).
6. **End every task with a short "Notes for Claude"** in your reply to the user:
   files touched, new classes added, any `TOKEN?` requests, anything that looks off on mobile.

### Changes Claude made to component logic (heads-up)

- **`components/header/Header.vue`** was rebuilt with a working mobile menu (Vue state, closes
  on route change / Esc / backdrop, scroll lock). The inline nav shows from **1280px**. Edit the
  `links` array for nav items, not the markup.
- **`components/racetracks/UpcomingRacesCarousel.vue`**: the card layout was rewritten
  (`stack` computed). Cards are absolutely stacked around a focus point: one open card, a
  fully visible preview above (previous / archived) and below (next), with older previews
  fading out. The open height adapts to the viewport. Shows `PAGE_SIZE = 5` race days, then
  "Load more". The section is **no longer locked to 100vh**: it's the stage's natural height
  plus a scroll runway for the first `AUTO_SCROLL_CARDS = 3` race days only. Past those, the
  section releases and further cards open **by click** (card or position dot; `manualIndex`).
  Clicking a card inside the scroll range scrolls to it. **Position bubbles** (`.rolodex-dots`)
  on the right show the current card: rings mark click-only cards, and the brass pill is the
  open one. Keep the template's class names and the
  `cardStyle(i)` / `lockedStyle` / `@click` bindings.
- **`data/racedays.json`**: Claude added back the past raceday `CD-2026-10-28` (drives the
  archived "Previous Results" card) and three more upcoming days, `KEE-2026-11-11`,
  `BEL-2026-11-13` and `AD-2026-11-15`, cloned from existing days with new race ids and post
  times. Keep at least one raceday before `DEMO_TODAY`.
- **`components/footer/Footer.vue`** has a new line, "All data and predictions are placeholder".
  Remove it when live data ships.

## 4a. Avoiding edit conflicts (read this first)

We've already collided a few times today: both of us edited `TodayRaces.vue`, the raceday
page, `todays-picks.vue` and `data/racedays.json` within minutes of each other. Claude checks
file timestamps before writing and merges on top of your newer version instead of
overwriting it, but merging costs time and can drop changes. The rules:

**File ownership**

| Owner | Files |
|---|---|
| **Claude only** | `assets/scss/**`, `nuxt.config.ts`, `components/header/Header.vue`, `components/footer/Footer.vue`, `components/racetracks/UpcomingRacesCarousel.vue`, `docs/CSS-GUIDE.md`, `docs/QWEN-HANDOFF.md` |
| **Qwen only** | `<template>` and `<script>` of every page and component not listed above, `composables/**`, `server/**`, `api/**` |
| **Shared: one at a time** | `<style scoped>` blocks in pages/components (Claude cleans these up after you); `data/*.json` |

**Protocol**
1. **Before you start**, tell the user which files you'll touch. The user relays this so Claude
   stays off them until you're done.
2. **Small, scoped edits.** Change the lines you need; don't reformat or re-indent whole files.
   Re-indentation shows up as a full-file conflict.
3. **Never rewrite a data file wholesale.** Add or edit only the records you need. A rewrite
   today dropped `predictions`, `premiumPicks` and the only past raceday, and crashed two pages.
4. **Don't touch a Claude-only file**, even for a one-line fix. Put it in "Notes for Claude".
5. **Finish with "Notes for Claude"**: files touched, new classes, `TOKEN?` requests,
   anything that looks off on mobile.
6. If you find that a file has changed under you since you read it, **re-read it before
   editing**. Don't paste an older copy back.

**Open items on your side:**
- `pages/picks/[track]/[date]/[race].vue`: **no horse names are linked** on the Race Analysis
  page (prediction cards, premium cards, WPS, exacta/trifecta). Mirror `todays-picks.vue`:
  wrap each name in `<NuxtLink class="{block}__horse {block}__horse--link">` with an `h3`/`span`
  fallback. The underline animation and fonts are already handled by those classes.
- **Number icons (new rule).** Every horse/program number needs `:data-pgm="pgm"` (it's a
  saddlecloth-coloured square), and every finishing/predicted position needs `:data-place="n"`
  (a metallic circle for 1–3). Claude added these across `todays-picks.vue`, `[race].vue`,
  `TodayRaces.vue`, the raceday page and `EntityProfile.vue`. New markup must include them.
- WPS rows were rebuilt (place circle · Win/Place/Show · horse square · name · confidence %).
  Claude added `premiumPicks.wpsConfidence: [win%, place%, show%]` to every race in
  `data/racedays.json` and a `confTier(p)` helper in both picks pages.
- **Racing History is empty on every horse/jockey profile** right now (e.g. /jockeys/130270),
  so `useEntityProfile` isn't finding past performances. Please check.
- FYI: Claude changed `components/snippets/PageTitle.vue` so that `breadcrumbs` is optional.
  Omit it and the component renders "Home / {title}" (this fixed "Page Title" on /Racetracks
  and /TodayRaces). Claude also linked Best Value's horse name in `todays-picks.vue`.

### Terminology: program number (pgm)

The number a horse wears for betting in a race is its **program number** (`program_number`,
short **pgm**). Call it that in code, comments and copy. Don't call it a "horse number". It is
drawn as a bordered square (`.horse-num` / `[data-pgm]`). The place a horse finished
(`finish_position`) is a **place number**, drawn as a circle (`.place-num` / `[data-place]`).

Placeholder data (Claude, 31 Oct): program numbers in `data/racedays.json` are now scattered
within a 1–10 or 1–12 field depending on the track (seeded, so the result can be reproduced).
Every reference was remapped together: `participants`, `botPick`, `predictions`, and
`premiumPicks` (`mostLikelyWinner`, `bestValue`, `wps`, `exacta`, `trifecta`). Participants are
sorted by pgm. **Always look a horse up by `program_number` inside its own race, never by
array index or by assuming 1…n.** One orphan prediction (CD 28 Oct R1, pgm 4 in a 3-horse
field) was dropped. Backup: `_backup/racedays.pre-pgm.json`.

Styling pass (Claude, 31 Oct) on `pages/racetracks/[id].vue`: the invalid `up-to(md)` is gone.
The page now uses the global `.not-found`, `.metric` and `.summary-stat`; `split-hero`,
`stat-row`/`stat-item` for the hero; tokens instead of hex; and mixed-cut tags. Metrics
grid is `1fr` on phones and two columns from `md` up.

### Motion: `v-reveal` (Claude, 1 Nov)

The site now has a scroll-reveal directive, `plugins/reveal.ts`, with its CSS in
`assets/scss/base/_motion.scss`. Rules are in BRANDING §10; how to use it is in CSS-GUIDE §5a.
**Don't add AOS or any animation library.**

- When you build a new section, add `v-reveal` to its header and `v-reveal.stagger` to its card
  grid or list. Brass corners, bars and medals inside animate automatically.
- Never put it on the hero, the PageTitle, disclaimers, anything inside the race schedule
  carousel, or an element positioned with `transform`.
- `nuxt.config.ts` now has `experimental.viewTransition: true` for page cross-fades.
  The header has `view-transition-name: site-header`, so keep a single header element.
- Pages touched (template attributes only, no logic): index, todays-picks, picks race page,
  TodayRaces, raceday, Racetracks, racetracks/[id], our-track-record, contact, EntityProfile.

### Hero de-duplication (Claude, 1 Nov)

- **Race-day page and track page:** below `lg`, the hero's own title is hidden with CSS
  (raceday: name + date; track: name, keeping the location), because `<PageTitle>` right above
  already shows it. The markup is unchanged.
- **Horse and jockey profiles:** `<PageTitle>` is removed from `EntityProfile.vue`. The eyebrow
  is now a breadcrumb `<nav>`: Home / Horses / Horse Profile. The profile's `h1` is now the only
  `h1` on the page. **"Horses" and "Jockeys" are plain text, not links, because `/horses` and
  `/jockeys` index pages don't exist yet.** When you build them, turn those two spans into
  `<NuxtLink class="profile-crumbs__link">`.

### Raceday Program, first premium product (Claude, 1 Nov)

Route: **`/program/[track]/[date]`**, e.g. `/program/KEE/2026-10-31`. It's linked from the
race-day hero ("Raceday Program", the brass button).

| File | What it holds |
|---|---|
| `pages/program/[track]/[date].vue` | Cover, sticky race bar with day P/L, My Day scoreboard + budget, race sheets, Day Summary |
| `components/program/ProgramRace.vue` | One race: field table, HorseBrain picks with "+ Bet", bet log, notes, paper bet slip |
| `composables/useRacedayProgram.js` | The user's layer: bets, contenders, notes, budget, totals, `gradeBet()` |
| `assets/scss/components/_program.scss` | All styles, including the `@media print` program |

- **Data in:** `useRacedays().getRaceday()` (participants, predictions, botPick, premiumPicks).
  Everything is looked up by **program number** within the race.
- **Data saved:** `localStorage` key `hb:program:v1:{TRACK}:{date}`. The record shape is documented at
  the top of the composable. **When accounts exist, keep that shape** and swap `load()`/`save()`
  for API calls (or sync localStorage → account on sign-in). `version` lets us migrate.
- Premium is labelled but **not gated** yet ("Premium · free during preview").
- "Check against result" grades open bets from `finish_position`. Win/Place/Show and straight
  Exacta/Trifecta are graded automatically; "Other" is graded by hand. Payouts are always typed
  in by the user, because we don't have real payout data.
- **Linking to a program: always use `<ProgramLink :track :date :race? :label? small?>`**
  (`components/program/ProgramLink.vue`, brass button; `race` deep-links to `#race-N`). It's on
  the Race Schedule cards, the race-day hero and expanded races, Today's Races (only where a
  program exists), Today's Picks, the race analysis page (hero + bottom CTA) and the track page
  (next race day). When the program becomes members-only, gate it in that one component.

## 5. Open issues found during Claude's review (Qwen's side)

Please pick these up. They are template, script or data bugs, not styling.

1. ~~**Today's Picks and Race Analysis pages crash (500).**~~ **Fixed** (data restored). Still
   worth guarding the templates with `v-if` so missing picks show an empty state instead of a 500.
   Original note: `data/racedays.json` was rewritten
   on 2026-10-31 (≈100KB → ≈20KB), and races no longer have `predictions` or `premiumPicks`.
   The templates read `race.premiumPicks.mostLikelyWinner` unguarded. Either restore those
   fields (backup: `_backup/racedays.original.json`) or guard the templates with
   `v-if` and show an empty state. **Also restore a raceday dated before `DEMO_TODAY`**
   (the original had `CD-2026-10-28`). Without one, `pastRacedays` is empty and the schedule's
   archived "Previous Results" card can't appear.
2. **ROI renders "+-100%"**: `EntityProfile.vue` and `racetracks/[id].vue` prefix `+`
   unconditionally. Show the sign only when the value is ≥ 0.
3. **Broken link**: the track page's "View Race Card" / "View Next Race Day" go to
   `/racedays/${track.id}` with no date, and that route doesn't exist. Use the next raceday's
   `path` from `useRacedays().getNextRacedayForTrack()`.
4. **Breadcrumbs link to `/horses` and `/jockeys`**, which have no index pages (404).
5. **Mixed-case routes**: `/TodayRaces` and `/Racetracks` vs `/racetracks/KEE`. Suggest
   renaming to `/todays-races` and `/racetracks` (index), with redirects from the old ones.
   The header's `links` array in `components/header/Header.vue` will need updating. Tell
   Claude when you do it.
6. **`server/api/racetracks_today.ts` imports from `C:/Users/ritch/...`**. Use a relative or
   `~/` path; the absolute path breaks the build on any other machine.
7. **Hot-linked images**: the Unsplash photo on Our Track Record and the keeneland.com
   `FALLBACK_BG` in `UpcomingRacesCarousel.vue`. Download them into `public/images/` (check
   licensing).
8. **Footer and Contact link to `github.com/OFSkean/horsebrain`**, an old repo that's
   inaccessible. Update the link when the new repo exists.
9. **Homepage pick cards**: the horse name is now a `NuxtLink`. It's styled through
   `.pick-card__horse`, so keep that class on both the link and the `h3` fallback.
10. **API key is hard-coded** in `api/mongo_api.js` (browser-side). This gets replaced in
   the backend phase. Don't copy the pattern.

## 6. Already cleaned up / deprecated (don't revive)

Removed from the build: Bootstrap (CSS + JS), Bootstrap Icons, Tailwind, AOS, `@nuxtjs/i18n`,
`v-calendar`, the BootstrapMade template SCSS (`_variables`, `_sections`, `layouts/_general`,
`site/*`), and the old duplicate `_page-titles` / `_ticker` partials.

Dead files the user is deleting: `pages/Racetracks-Old.vue`, root `[date]/`, `pages/racelist/`,
`components/racetracks/{ActiveRacetracksOverview,RacetrackCardOverview,Racetracks,TestSwiper}.vue`,
`components/data_display/**`, `tailwind.config.js`, `assets/css/{main,fonts}.css`,
`assets/scss/main.css(.map)`, and `assets/images/Racetracks/` (duplicate of
`public/images/Racetracks/`). If you need something from those, ask first.

## 7. What's next on the roadmap

1. Branding guide + documentation (Claude)
2. Replace placeholder JSON with live data from the HorseBrain API / race sources
   (composables become the single data layer, so keep pages reading through them)
3. Hosting decision (Azure Web App vs alternatives) + new GitHub repo
