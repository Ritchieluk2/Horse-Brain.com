# User Accounts: what's built and what's next

_Last updated: 2026-11-01 (afternoon)_

The first job of an account is to **keep each user's Raceday Program entries across their
history** and turn them into **basic insights and statistics**. Everything below is ordered
around that goal, and around the brand values: losses shown next to wins, budgets and limits
built in, never designed for "stickiness".

---

## 1. Built so far (phase 0: sign-up / sign-in)

| Route | File | What it does |
|---|---|---|
| `/sign-up` | `pages/sign-up.vue` | Name, email, password, phone (optional), US mailing address (optional), age 21+, Terms + Privacy, picks disclaimer, email opt-in |
| `/sign-in` | `pages/sign-in.vue` | Email + password, `?redirect=` support, lock-out after 5 wrong tries |
| `/account` | `pages/account/index.vue` | Stub overview: profile, agreements with dates and versions, sign out |
| `/legal` | `pages/legal.vue` | **Draft** Terms, Privacy, Disclaimer, Responsible gambling (needs a lawyer before launch) |

**API** (`server/api/auth/`): `POST sign-up`, `POST sign-in`, `POST sign-out`, `GET me`.

**Plumbing**

| Piece | File |
|---|---|
| Validation + legal versions, shared by the browser and the server | `shared/account-rules.js` (import as `#shared/account-rules.js`) |
| User store, the only file that knows where users live | `server/utils/users.ts` |
| Password hashing (PBKDF2-SHA-256 via Web Crypto, works on Workers) | `server/utils/password.ts` |
| Encrypted cookie sessions (h3 `useSession`, 14 days) | `server/utils/session.ts` |
| Sign-in throttle | `server/utils/throttle.ts` |
| Client state: `useAuth()` → `user`, `signedIn`, `signIn/signUp/signOut` | `composables/useAuth.js`, `plugins/auth.js` |
| Route guards: `definePageMeta({ middleware: 'auth' })` or `'guest'` | `middleware/auth.js`, `middleware/guest.js` |
| Form + auth-page styles | `assets/scss/components/_forms.scss`, `_auth.scss` |

**Storage today:** Nitro storage mounted as `hb`. In `npm run dev` that's JSON files in
`.data/hb/` (git-ignored). On Cloudflare it's a Workers KV namespace bound as `HB_DATA`.
Fine for profiles; **not** fine for history and stats (see section 4).

### Before this can run in production
1. `npx wrangler kv namespace create HB_DATA`, then add the binding it prints to `wrangler.jsonc`:
   `"kv_namespaces": [{ "binding": "HB_DATA", "id": "<id>" }]`
2. `npx wrangler secret put NUXT_SESSION_SECRET` (32+ random characters; see `.env.example`).
3. Deploy the **Cloudflare Worker** build. The GitHub Pages workflow builds a static site with
   no server, so sign-up/sign-in show "Accounts aren't available on this preview" there.

---

### Phase 1: email + settings (done 2026-11-01)

| Route | What it does |
|---|---|
| `/verify-email` | Confirms an address from the emailed link (24h, newest link only). `?change=1` confirms a new address after an email change |
| `/forgot-password`, `/reset-password` | 1-hour one-time reset link; signs out other devices; sends a "password changed" notice |
| `/account/settings` | Edit name, phone, address, email opt-in; change password (signs out other devices); change email (link to the new address, heads-up to the old one, cancellable) |
| `/account` | Overview + "Please confirm your email" banner with Resend; tab bar (`AccountNav.vue`) across the account area |

Email goes through Resend (`server/utils/email.ts`, the only provider-specific file). Keys in `.env`:
`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`. One-time links live in `server/utils/tokens.ts`
(only a hash is stored). Dev-only setup check: `/api/dev/email-check` (`?send=1` sends a test to
Resend's test inbox).

---

## 2. Required pages (to deliver program history + insights)

In build order. Each line: route · purpose · API it needs. ~~Struck~~ items are done.

1. ~~**Account settings** · `/account/settings`
   Edit name, phone, address, email opt-in; change password; change email (re-verify).
   `PATCH /api/account/profile`, `POST /api/account/password`.~~
2. ~~**Forgot / reset password** · `/forgot-password`, `/reset-password?token=`
   One-time token by email, valid 1 hour. Needs an email provider (section 4).~~
3. ~~**Verify email** · `/verify-email?token=`
   Confirms the address before history syncs or emails go out. Banner on `/account` until done.~~
4. ~~**Program history** · `/account/programs` ← *the core feature*~~ **Done 2026-11-01.**
   Lists every saved raceday (date, track, races, bets, staked, returned, P/L) with all-time
   totals, a track filter, "Open Program" and a two-tap delete. Signed-in programs autosave to
   the account 0.8s after each change (and on leaving the page); guests keep using
   localStorage and see a "Keep this program" invitation once they've entered something. On any
   sign-in or sign-up, browser-saved programs are **merged** into the account (bets matched by
   id, notes joined, nothing lost) and removed from the browser.
   Files: `shared/program-rules.js` (record shape, `summarise`, `mergePrograms`, `sanitizeProgram`),
   `server/utils/programs.ts` (store + per-user index), `server/api/programs/**`,
   `composables/useRacedayProgram.js`, `components/program/ProgramAccountBar.vue`.
   Still to do: date-range filter and sort by net once people have enough history to need them.
5. ~~**Insights** · `/account/insights`~~ **Done 2026-11-01.**
   Period (all / 30 / 90 days / 12 months) and track filters, kept in the URL. Headline P/L
   with ROI, strike rate, won–lost, staked, returned, racedays and races; a running P/L step
   chart by raceday (hover for each day) with a raceday-by-raceday table under it; HorseBrain
   picks vs own picks; by bet type (with a diverging return bar), by track, by month;
   highlights (best AND toughest day, biggest return, budget adherence). Settled bets only,
   sample size always stated, "Early days" note under 30 settled bets.
   Files: `shared/insights-rules.js` (all maths, unit-tested), `server/api/insights/index.get.ts`,
   `pages/account/insights.vue`, `components/account/{RunningTotalChart,BreakdownTable}.vue`.
   Dev only: `/api/dev/seed-programs?count=28` fills the signed-in account with sample
   racedays (notes say "[sample data]"); `?clear=1` deletes all of that account's programs.
   **Not yet:** simulated vs real-money bets. Bets have no `mode` field, so everything is
   reported together. Adding it touches the Raceday Program's bet form (see §3, simulated mode).
6. **Limits & responsible gambling** · `/account/limits`
   Daily / monthly budget defaults (pre-fills each program's budget), cool-off (24h / 7 days /
   30 days: hides "+ Bet" and real-money stats), self-exclusion request, helpline. Required by
   the project's Responsibility value, so it ships with insights, not after.
7. **Privacy: export & delete** · `/account/privacy`
   Download everything (JSON + CSV of bets); delete account (type email to confirm; 7-day grace).
8. **Re-accept updated terms** · `/account/agreements`
   When a version in `LEGAL_VERSIONS` changes, `middleware/auth.js` sends users whose accepted
   version is older here before anything else. Final legal text reviewed by counsel.

## 3. Suggested pages (nice to have, roughly by value)

- **Raceday recap** · `/account/programs/[track]/[date]`: read-only summary of one day
  (bets, results, notes, budget line), printable, shareable as an image without amounts.
- **Simulated betting mode** toggle in settings (default **on** for new accounts), so a bet's
  `mode: 'sim' | 'real'` is set automatically. Matches the project's "incentivise simulation" goal.
- **My stable** · `/account/following`: follow tracks, horses, jockeys; homepage and Today's
  Picks put them first. Later powers alerts.
- **Notifications** · `/account/notifications`: picks-ready email for followed tracks, weekly
  recap email (with losses), off by default.
- **Onboarding** after sign-up: set a budget → choose sim or real → import this browser's
  programs → pick favourite tracks. Skippable.
- **Security** · `/account/security`: active sessions and "sign out everywhere"; passkeys or
  sign in with Google/Apple to avoid passwords altogether.
- **Admin** · `/admin/users`, `/admin/insights` (role `admin`): support lookups and the V2
  goal of anonymised aggregate behaviour (typical stakes, bet mix), plus flags for risky patterns
  (rising stakes, chasing losses, frequent budget breaches) for the responsible-gambling team.
- **Billing (V3)** · `/pricing`, `/account/billing`: subscriptions and day passes (Stripe),
  gating premium in `ProgramLink.vue` as already planned.

---

## 4. Infrastructure decisions to make first

1. **Database for history.** KV can't query "all bets for user X at Keeneland in October".
   Recommendation: **Cloudflare D1** (SQLite at the edge, same Worker, free tier) for user-owned
   data, keeping race/pick data in the HorseBrain API (Mongo). Only `server/utils/users.ts`
   changes for users; programs and bets get their own `server/utils/programs.ts`.
   Sketch:
   ```
   users            (id, email UNIQUE, first_name, last_name, phone, address_json,
                     marketing_opt_in, password_json, role, status, created_at, updated_at)
   agreements       (user_id, doc, version, accepted_at)        -- full history, not just latest
   programs         (user_id, track_id, date, budget, notes_json, updated_at,
                     PRIMARY KEY (user_id, track_id, date))
   bets             (id, user_id, track_id, date, race, type, selection_json, stake,
                     status, payout, source, mode, created_at)  -- insights = SQL over this
   user_limits      (user_id, daily_budget, monthly_budget, cool_off_until, self_excluded)
   ```
   If you'd rather stay on Azure, the same split works with Azure SQL or Cosmos DB behind
   the same `server/utils` functions.
2. ~~**Transactional email**~~ Done: Resend, sending from `mail.horse-brain.com`. Cloudflare Email Routing only
   *receives* mail (info@horse-brain.com). Use Resend, Postmark or Amazon SES with a
   `noreply@horse-brain.com` sender and SPF/DKIM records added in Cloudflare DNS.
3. **Abuse protection:** Cloudflare Turnstile on sign-up and reset, plus an IP rate-limit rule
   on `/api/auth/*`.
4. **Payout data:** insights are only as good as payouts, which users type in by hand today.
   When the API exposes official payouts, grade bets and fill payouts automatically.
