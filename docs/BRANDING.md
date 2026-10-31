# HorseBrain Brand Guide

> **Race picks powered by machine learning.** Rustic but refined. Natural but classy.
> Transparent like a financial institution.

This is the single reference for how HorseBrain looks, sounds and behaves.
It's written for people **and** AI agents: rules are explicit, values are exact, and every
visual rule maps to a code token. Code is the source of truth: `assets/scss/base/_root.scss`
(tokens) and `docs/CSS-GUIDE.md` (implementation).

_Version 1.0 · 2026-10-31_

---

## 1. Brand essence

| | |
|---|---|
| **What we are** | A horse-racing picks site built on machine learning and statistical inference, with a fully audited public track record. |
| **Values** | **Responsibility · Honesty · Excellence** |
| **Personality** | Knowledgeable, calm, rigorous, warm. A seasoned clocker with a statistics degree, not a tout. |
| **Inspiration** | Kentucky bluegrass sky, the turf and dirt of the track, the white rail paint, the brass of the clubhouse. |
| **Feel** | Rustic yet refined: textured paper, inlaid surfaces, sharp-cut corners, brass accents. |

### What we never are
- Hype-driven, "lock of the day", get-rich-quick.
- Designed for addiction or "stickiness": no countdown pressure, flashing wins or loss-chasing prompts.
- Vague about performance. We always show losses alongside wins.

---

## 2. Voice & tone

**Write like** an honest analyst explaining their numbers.

| Do | Don't |
|---|---|
| "Our model gives Thunder Bolt a 42% win probability." | "Thunder Bolt is a LOCK! 🔥" |
| "High confidence" / "Medium confidence" / "Low confidence" | "Guaranteed", "sure thing", "can't lose" |
| State past performance with dates and sample sizes. | Cherry-pick hot streaks. |
| "Past performance is not indicative of future results." | Hide or shrink disclaimers. |
| Plain, specific, short sentences. | Jargon without explanation. |

**Required copy, always visible where picks or results appear:**
- Past-performance disclaimer.
- Responsible gambling line, with the National Problem Gambling Helpline **1-800-522-4700** and ncpgambling.org.
- While in development: "All data and predictions are placeholder."

**Capitalisation:** headings and buttons are set in Amagro, which renders as all caps by design. Write
them in Title Case in the source ("View Full Card & Picks"). Small labels are UPPERCASE with letter-spacing.

---

## 3. Logo & wordmark

- **Lockup:** horse mark (`static/horse.png`) + wordmark **HORSEBRAIN** in Amagro, uppercase.
- **On dark only** (espresso header, shadow-grey bands). Wordmark in white.
- **Clear space:** at least the height of the "H" on all sides.
- **Minimum size:** mark 36px, wordmark 24px font-size (mobile header).
- **Don't:** recolour the mark, stretch it, put it on baby blue, add effects or shadows.
- _To do:_ provide an optimised SVG/WebP mark (the PNG is 1.2MB).

---

## 4. Colour

### 4.1 Core palette

| Name | Hex | Token | Role |
|---|---|---|---|
| **Baby Blue** | `#85ABFF` | `--color-baby-blue` | Sky. **Action colour**: primary buttons, links on dark, highlights |
| **Espresso** | `#45201A` | `--color-espresso` | Earth. Body text, headings, header bar, program-number discs |
| **Fern** | `#366B24` | `--color-fern` | Turf. Positive, win, high confidence, newsletter bands |
| **White** | `#FFFFFF` | `--color-white` | Rail paint. Surfaces, the rail frame |
| **Shadow Grey** | `#1D1C21` | `--color-shadow-grey` | Night. Dark bands, page titles, CTAs; "black" on blue |
| **Brass** | `#C7A96B` | `--color-brass` | Metallic shine. **Premium and high confidence only** |

### 4.2 Supporting colours

| Name | Hex | Token | Use |
|---|---|---|---|
| Cream | `#F5F1E8` | `--color-cream` | Warm sections, stat cards, Our Pick panel |
| Cream Deep | `#EDE7D8` | `--color-cream-deep` | Cream gradients |
| Paper | `#F8F6F5` | `--color-paper` | Alternate section background |
| Sage | `#9CAF88` | `--color-sage` | "Currently Racing" band |
| Espresso Soft | `#6B5854` | `--color-espresso-soft` | Secondary text |
| Live Red | `#FF6B6B` | `--color-live` | LIVE indicators on dark / fills only |

### 4.3 Ink variants: text on light backgrounds (accessibility)

Baby Blue, Brass and Live Red **fail WCAG contrast as text on white**. Use these instead:

| Instead of | Use | Hex | Contrast on white |
|---|---|---|---|
| Baby Blue text | Blue Ink | `#3B67BF` | 5.4 : 1 |
| Brass text | Brass Ink | `#8A6D32` | 4.9 : 1 |
| Live Red text | Live Ink | `#C23B3B` | 5.3 : 1 |
| Fern text **on dark** | Fern on Dark | `#7EC96A` | n/a (dark bg) |

### 4.4 Colour rules
1. **Brass = premium / high confidence.** Never decorative filler.
2. **Baby blue = action.** One primary action per view.
3. **Fern = positive; red = live or negative only.**
4. **Black on blue.** Text and dark buttons on baby blue use Shadow Grey, never Espresso.
5. **Never hard-code hex in code.** Pick a token; if none fits, request one.
6. Confidence scale: **High** = fern + brass ring · **Medium** = blue ink · **Low** = espresso soft.
7. Race status: **Live** = live red · **Upcoming** = blue · **Final** = fern.
8. **Finishing positions use medal metals:** **1st / Win = gold** (from brand brass), **2nd / Place = silver**, **3rd / Show = bronze**. Use them as metallic discs on position icons, and as their darker `-lo` shades for text and edge accents. Tokens `--gold`, `--silver`, `--bronze` (+ `-hi` / `-lo`), mixin `medal()`.

---

## 5. Typography

| Face | Use | Token |
|---|---|---|
| **Amagro** (bold display) | Headings, wordmark, buttons, big numbers, **horse names** | `--font-heading` |
| **Raleway** (400–700) | Body, data, labels, **jockey / trainer / owner names** | `--font-body` |

**Rules**
- **Horse names are always Amagro. People's names are always Raleway.**
- Numbers that matter (odds, win rate, ROI, post time) are set in Amagro.
- Raleway always uses **lining figures** (numbers at full capital height), set globally.
- Ordinals are written **1st / 2nd / 3rd** with a lowercase suffix, so the number stands taller than the letters. Never "1ST".
- Small labels: Raleway 700, uppercase, letter-spacing 0.06–0.14em, 11–13px.
- Body: 16px base, line-height 1.6. Max line length ~75 characters.
- Type sizes are fluid tokens (`--fs-2xs` … `--fs-display`). Don't invent pixel sizes.

### 5.1 Number icons: two shapes, never mixed up

| What it is | Shape | Fill | Colour |
|---|---|---|---|
| **Place** (finishing / predicted position) | Circle | Solid | 1st gold · 2nd silver · 3rd bronze · 4th+ espresso |
| **Horse** (saddlecloth / program number) | Square, mixed-cut | Transparent, 2px border | Saddlecloth colour by number |

Saddlecloth colours (North American standard, deepened to pass contrast on white/cream):
1 red `#D0202E` · 2 white cloth (ink number, grey border `#A3A3AB`) · 3 blue `#1F5FD1` · 4 yellow `#8F6A00` ·
5 green `#1B7A33` · 6 black `#1D1C21` · 7 orange `#C2410C` · 8 pink `#C2185B` · 9 turquoise `#00737B` ·
10 purple `#7B2FBE` · 11 grey `#5B6770` · 12 lime `#4D7C0F` · 13 brown `#7A4A2A` · 14 maroon `#8E1B3A`.

---

## 6. Shape language (signature elements)

These four elements make HorseBrain recognisable. Use them consistently.

### 6.1 Mixed-cut border: the card shape
**Sharp top-left and bottom-right corners; rounded top-right and bottom-left.**
```
┌──────────╮
│          │
╰──────────┘
```
- Every card, tile, panel and photo frame is mixed-cut.
- A coloured bar on a card's left edge runs straight off the sharp top corner.
- Buttons, badges, pills and icons keep ordinary rounded corners.
- Tokens: `--radius-cut`, `--radius-cut-md`, `--radius-cut-sm` · mixin `mixed-cut()`.

### 6.2 The frame: brass treatment for premium items
An **inner hairline frame** (8px inset, follows the mixed-cut shape) plus **brass corner
brackets** sitting exactly on the two sharp corners.
```
┏━─────────╮
┃┌────────╮│
││        ││
│╰────────┘┃
╰─────────━┛
```
- Use on premium, featured and high-confidence items (active pick, stat cards, premium cards).
- Brackets are 50% opacity at rest and 100% when active or high confidence.
- Mixin `frame()`.

### 6.3 Rail frame: the white rail motif
Two white rail lines that **cross and overlap at the top-left corner**, fading out along each
edge, like painted track rail. Lives on the site header, paired with a fading white rail along
its bottom edge. Mixin `rail-frame()`.

### 6.4 Inlaid borders
Full-width bands get a **double rule** (solid outer + hairline inner, 6–8px apart): the
Currently Racing band, the Currently in Development footer band, and the brass inlay inside
dark CTA bands.

---

## 7. Surfaces & depth

The site is built in **layers**: surfaces are either pressed *into* the page (inlaid) or
resting *on* it. Texture always sits beneath the content.

| Surface | Look | Where |
|---|---|---|
| **Textured band: fern** | Paper grain + fibres + vignette + inset shadow | Newsletter / signup CTAs |
| **Textured band: blue** | Same recipe in baby blue | Homepage "Get Free Daily Picks" |
| **Textured band: cream** | Same recipe in cream, with a shadow cast from above and an inlaid bottom edge | "All Supported Tracks" |
| **Inlaid business card** | White paper stock, inset shadow top/left, light catch bottom, no lift | Featured Free Picks on cream |
| **Card** | White, hairline border, soft layered shadow, lifts slightly on hover | Prediction, info, race rows |
| **Paper panel** | Cream paper texture | "Our Pick" panel |
| **Dark band** | Shadow grey or espresso, brass inlay | Page titles, CTAs, Track Record |

**Section rhythm:** alternate light (white / paper / cream) and dark (shadow grey / espresso)
bands. Don't stack two identical backgrounds.

---

## 8. Components at a glance

| Component | Rule |
|---|---|
| **Primary button** | Baby blue, Shadow Grey text, Amagro. Lifts 2px on hover |
| **Secondary button** | White outline on dark. Hover: fills white **and** lifts |
| **Outline button** | Espresso outline on light backgrounds |
| **Premium button** | Brass gradient. Premium actions only |
| **Confidence chip** | Icon + label. High ★ fern + brass ring · Medium ✓ blue · Low ? muted |
| **Status pill** | LIVE (pulsing red) · UPCOMING (blue) · FINAL (fern) |
| **Place number** | **Circle, solid background.** 1st gold · 2nd silver · 3rd bronze (metallic `medal()`); 4th and below flat espresso. Shows the digit only (title gives "1st") |
| **program number** | **Square (mixed-cut), 2px border, transparent background**, number + border in the horse's saddlecloth colour |
| **WPS row** | place circle · "Win / Place / Show" label · horse square · name · confidence chip (icon + %) on the right |
| **Name link** | Sliding baby-blue underline from the left on hover |
| **Tap targets** | ≥ 44px tall on every interactive element |

---

## 9. Imagery & icons

- **Photography:** real racetrack photos (grandstands, turf, horses in motion). Always under a
  dark gradient overlay so white text passes contrast.
- **Track logos:** shown in a frosted white pill, never placed directly on a busy photo.
- **Icons:** simple inline SVG line icons, 2–2.5px stroke, `currentColor`. No icon fonts.
- **Don't:** stock "money" imagery, dice, casino chips or slot-machine visuals.
- Host images ourselves (`public/images/`). Don't hot-link.

---

## 10. Motion

- Subtle and purposeful: hover lifts (2–4px), fades, sliding underlines, the odometer roll on stats.
- Durations: 0.2s (fast) · 0.3s (default) · 0.6s (slow). Easing `--ease` / `--ease-out`.
- Honour `prefers-reduced-motion` (handled globally).
- **Never:** flashing wins, celebratory confetti, urgency timers.

---

## 11. Layout

- Mobile-first. Breakpoints: **sm 576 · md 768 · lg 1024 · xl 1280** (inline nav from xl).
- Content width 1200px; side gutter 16 → 24 → 32px.
- No horizontal page scroll at any width. Test at 360, 375, 768, 1024 and 1366px.

---

## 12. Quick spec for AI agents

```yaml
brand: HorseBrain
tagline: "Race picks powered by machine learning"
values: [Responsibility, Honesty, Excellence]
colors:
  baby_blue:   "#85ABFF"   # action; text on light -> blue_ink
  espresso:    "#45201A"   # text, headings, header
  fern:        "#366B24"   # positive / high confidence
  white:       "#FFFFFF"
  shadow_grey: "#1D1C21"   # dark bands; "black" on blue
  brass:       "#C7A96B"   # premium & high confidence ONLY; text on light -> brass_ink
  blue_ink:    "#3B67BF"
  brass_ink:   "#8A6D32"
  live:        "#FF6B6B"   # text on light -> live_ink "#C23B3B"
  cream:       "#F5F1E8"
fonts:
  heading: Amagro        # headings, buttons, numbers, HORSE NAMES
numbers:
  place: circle, solid; 1st gold / 2nd silver / 3rd bronze; 4th+ espresso   # class .place-num + data-place
  horse: square mixed-cut, 2px border, transparent; saddlecloth colour       # class .horse-num + data-pgm
  body: Raleway          # body, labels, PEOPLE'S NAMES
shapes:
  card: mixed-cut        # sharp top-left + bottom-right, rounded top-right + bottom-left
  premium: frame         # inner hairline + brass brackets on the sharp corners
  header: rail-frame     # white rails crossing at the top-left
rules:
  - never hard-code hex; use tokens in assets/scss/base/_root.scss
  - brass only for premium / high confidence
  - black (shadow_grey), not espresso, on baby-blue backgrounds
  - baby blue / brass / live red are never body text on white; use the *_ink variant
  - every card is mixed-cut; buttons and badges are not
  - always show past-performance + responsible-gambling disclaimers near picks
  - no hype language, no urgency or "stickiness" patterns
  - mobile-first; tap targets >= 44px; no horizontal scroll
references:
  tokens: assets/scss/base/_root.scss
  implementation: docs/CSS-GUIDE.md
  collaboration: docs/QWEN-HANDOFF.md
```
