<template>
  <div class="made-page">
    <PageTitle title="How This Site Was Made" />

    <!-- Lead -->
    <section class="made-section made-section--lead">
      <div class="container made-narrow">
        <p class="made-lead">
          HorseBrain.com is a <strong>mockup</strong>: a working proof of concept for a horse racing
          picks site, not a finished product. Our development team designed and built it with the
          help of two AI coding assistants: one focused on <strong>design and styling</strong>, the
          other on <strong>page structure</strong>. This page explains who did what, and which parts
          of the site are real.
        </p>
      </div>
    </section>

    <!-- 1. What's real -->
    <section class="made-section">
      <div class="container made-narrow">
        <h2 class="made-title" v-reveal>First, what's real</h2>
        <p class="made-text" v-reveal>
          Everything you can click works, but the racing information behind it is sample data.
          Our machine learning models aren't connected to the site yet, so the picks you see are
          placeholders, not their predictions.
        </p>

        <div class="made-table-wrap" v-reveal>
          <table class="made-table">
            <thead>
              <tr><th scope="col">Part of the site</th><th scope="col">Status</th><th scope="col">What that means</th></tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Design, layout and code</th>
                <td><span class="made-status made-status--real">Real</span></td>
                <td>A working mockup you can browse on phone or desktop.</td>
              </tr>
              <tr>
                <th scope="row">Races, horses and results</th>
                <td><span class="made-status made-status--sample">Placeholder</span></td>
                <td>Sample data written for the mockup. Live data is the next phase.</td>
              </tr>
              <tr>
                <th scope="row">Picks, confidence and predictions</th>
                <td><span class="made-status made-status--sample">Placeholder</span></td>
                <td>Hand-made examples until our models are connected. They are not betting advice.</td>
              </tr>
              <tr>
                <th scope="row">Track record figures</th>
                <td><span class="made-status made-status--sample">Placeholder</span></td>
                <td>Win rates, ROI and race counts are illustrative, not a real performance history.</td>
              </tr>
              <tr>
                <th scope="row">Jockey names</th>
                <td><span class="made-status made-status--sample">Placeholder</span></td>
                <td>Some match real jockeys. Every statistic shown for them is invented.</td>
              </tr>
              <tr>
                <th scope="row">Track names, logos and photos</th>
                <td><span class="made-status made-status--borrowed">Third-party</span></td>
                <td>They belong to the racetracks and are used only to illustrate the design.</td>
              </tr>
              <tr>
                <th scope="row">Raceday Program bets</th>
                <td><span class="made-status made-status--real">Real</span></td>
                <td>The tracker works, but it saves only in your own browser. No money is involved.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 2. Who did what -->
    <section class="made-section made-section--alt">
      <div class="container">
        <div class="made-narrow">
          <h2 class="made-title" v-reveal>Who did what</h2>
          <p class="made-text" v-reveal>
            The AI did a lot of the typing. The idea, the values and the decisions came from a person.
          </p>
        </div>

        <div class="made-roles" v-reveal.stagger>
          <article class="made-role made-role--human">
            <span class="made-role__frame" aria-hidden="true"></span>
            <i class="made-role__corner made-role__corner--tl" aria-hidden="true"></i>
            <i class="made-role__corner made-role__corner--br" aria-hidden="true"></i>
            <span class="made-role__kind">People · project lead</span>
            <h3 class="made-role__name">Our development team</h3>
            <ul class="made-role__list">
              <li>The idea and the project plan: what HorseBrain is for, its roadmap and its features, including the Raceday Program.</li>
              <li>The machine learning models behind HorseBrain's predictions, which will be connected to the site in a later phase.</li>
              <li>The values (Responsibility, Honesty, Excellence) and the rule that the site must never be designed to be addictive.</li>
              <li>The brand: the colour palette, the fonts, and the signature shapes, such as the mixed-cut card corners, the brass frame and the crossing rail lines.</li>
              <li>Supplying the track images and logos, and the HorseBrain horse artwork.</li>
              <li>Every priority and final call. We reviewed each change ourselves, caught the bugs the AI missed, and decided what stayed.</li>
              <li>Hosting and deployment.</li>
            </ul>
          </article>

          <article class="made-role">
            <span class="made-role__kind">AI assistant</span>
            <h3 class="made-role__name">Design &amp; styling</h3>
            <ul class="made-role__list">
              <li>The styling system: one set of design tokens and shared styles, replacing Bootstrap and Tailwind.</li>
              <li>Layouts that work from small phones to wide desktops.</li>
              <li>The motion and scroll effects, and the place and program number icons.</li>
              <li>The Raceday Program: its layout, bet tracking, totals and printable version, built from our brief.</li>
              <li>The brand guide and developer guides, written from our direction, plus research on data providers and hosting.</li>
              <li>It edited the project files directly and checked pages in a browser before reporting back.</li>
            </ul>
          </article>

          <article class="made-role">
            <span class="made-role__kind">AI assistant</span>
            <h3 class="made-role__name">Page structure</h3>
            <ul class="made-role__list">
              <li>Page and component structure: templates, scripts, routing, and the placeholder data layer.</li>
              <li>Much of the original page structure of the mockup.</li>
              <li>Logic fixes and new page sections, handed to the design assistant for a styling pass afterwards.</li>
            </ul>
          </article>
        </div>

        <p class="made-note made-narrow" v-reveal>
          Before this mockup, an earlier HorseBrain prototype (a racing-data service built with FastAPI)
          came from the project's
          <a href="https://github.com/OFSkean/horsebrain" target="_blank" rel="noopener noreferrer">original repository on GitHub</a>.
        </p>
      </div>
    </section>

    <!-- 3. How we worked -->
    <section class="made-section">
      <div class="container made-narrow">
        <h2 class="made-title" v-reveal>How the work happened</h2>
        <ol class="made-steps" v-reveal.stagger>
          <li><strong>We described a change</strong> in plain language, often with a screenshot or a site we liked.</li>
          <li><strong>An AI assistant made it in the code</strong>, following a shared brand guide and a handoff document that split the work between the two assistants.</li>
          <li><strong>The assistant checked its own work</strong> in a browser at phone and desktop sizes.</li>
          <li><strong>We reviewed it</strong> ourselves, then kept it, asked for changes, or threw it out.</li>
        </ol>
      </div>
    </section>

    <!-- 4. Where it went wrong -->
    <section class="made-section made-section--alt">
      <div class="container made-narrow">
        <h2 class="made-title" v-reveal>Where the AI got it wrong</h2>
        <p class="made-text" v-reveal>
          AI made the work faster, not automatically right. A few examples:
        </p>
        <ul class="made-list" v-reveal.stagger>
          <li>The design assistant mixed up a horse's <em>program number</em> (the number it wears for betting) with its <em>finishing place</em>, until we explained how race numbering works.</li>
          <li>It also introduced a stylesheet bug that turned some subtle paper textures solid, then had to find and fix it.</li>
          <li>The homepage photo vanished on the live site because of its filename. We spotted it; the AI traced the cause.</li>
          <li>The two assistants sometimes edited the same file at the same time and overwrote each other's work. That led to a written rule for who edits what.</li>
        </ul>
        <p class="made-text" v-reveal>Every change on this site was reviewed by a person before it stayed.</p>
      </div>
    </section>

    <!-- 5. What this isn't -->
    <section class="made-section">
      <div class="container made-narrow">
        <h2 class="made-title" v-reveal>What this site is not</h2>
        <ul class="made-list" v-reveal.stagger>
          <li><strong>Not betting advice.</strong> Our models' predictions aren't published here yet.</li>
          <li><strong>Not a finished product.</strong> Features, wording and design will change.</li>
          <li><strong>Not handling real money.</strong> Nothing on the site places or takes bets.</li>
        </ul>
        <p class="made-text" v-reveal>
          When live race data arrives and our models are connected, this page will be updated to say exactly
          what changed. Questions or feedback are welcome at
          <a href="mailto:info@horse-brain.com">info@horse-brain.com</a>.
        </p>

        <p class="made-disclaimer">
          If you or someone you know has a gambling problem, help is available. Call the National
          Problem Gambling Helpline at <a href="tel:1-800-522-4700">1-800-522-4700</a>.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import PageTitle from '~/components/snippets/PageTitle.vue'

useHead({
  title: 'How This Site Was Made | HorseBrain',
  meta: [
    { name: 'description', content: 'HorseBrain.com is a proof-of-concept mockup built by our development team with two AI coding assistants. Who did what, and what on the site is real.' }
  ]
})
</script>

<style lang="scss" scoped>
.made-page { background: var(--bg-page); }

.made-narrow { max-width: 820px; margin-inline: auto; }

.made-section {
  padding-block: var(--section-pad-sm);

  &--lead { padding-top: var(--section-pad); padding-bottom: 0; }
  &--alt { background: var(--bg-alt); padding-block: var(--section-pad); }
}

.made-lead {
  margin: 0;
  font-size: var(--fs-md);
  line-height: var(--lh-body);
  color: var(--color-espresso);

  @include up(md) { font-size: 1.25rem; }
}

.made-title {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-2xl);
  color: var(--color-espresso);
}

.made-text {
  margin: 0 0 var(--space-5);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--text-secondary);
}

.made-note {
  margin-top: var(--space-6);
  font-size: var(--fs-sm);
  color: var(--text-secondary);

  a { color: var(--color-blue-ink); font-weight: 600; }
}

// ---- What's real table --------------------------------------------------
.made-table-wrap {
  overflow-x: auto;
  @include card(0, var(--radius-lg));
}

.made-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);

  th, td {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--border-color);
  }

  thead th {
    @include label-caps(var(--fs-2xs), 0.08em);
    color: var(--text-secondary);
    background: var(--bg-alt);
    border-bottom-width: 2px;
  }

  tbody th { font-weight: 700; color: var(--color-espresso); min-width: 10em; }
  tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
  td { color: var(--text-secondary); line-height: 1.5; }
}

// Status labels are labels, so mixed-cut (BRANDING: labels vs buttons)
.made-status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-label);
  @include label-caps(var(--fs-2xs), 0.08em);
  white-space: nowrap;

  &--real { background: var(--confidence-high-bg); color: var(--color-fern); }
  &--sample { background: var(--premium-bg); color: var(--color-brass-ink); }
  &--borrowed { background: var(--confidence-low-bg); color: var(--confidence-low); }
}

// ---- Roles -----------------------------------------------------------------
.made-roles {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-6);

  @include up(lg) { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; }
}

.made-role {
  @include card(var(--space-5), var(--radius-lg));
  @include frame(18px);

  @include up(md) { padding: var(--space-6); }

  // the person leads: the brass frame at full strength on their card only
  &--human {
    border-color: rgb(199 169 107 / 0.55);
    .made-role__corner { opacity: 1; }
  }

  &__kind {
    display: inline-block;
    margin-bottom: var(--space-2);
    @include label-caps(var(--fs-2xs), 0.12em);
    color: var(--color-brass-ink);
  }

  &__name {
    margin: 0 0 var(--space-4);
    font-size: var(--fs-xl);
    color: var(--color-espresso);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding-left: 1.1em;
    font-size: var(--fs-sm);
    line-height: 1.55;
    color: var(--text-secondary);

    li::marker { color: var(--color-brass); }
  }
}

// ---- Steps and lists ---------------------------------------------------------
.made-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
  counter-reset: step;

  li {
    position: relative;
    @include card(var(--space-4), var(--radius-md));
    padding-left: 64px;
    font-size: var(--fs-base);
    line-height: 1.5;
    color: var(--text-secondary);
    counter-increment: step;

    &::before {
      content: counter(step, decimal-leading-zero);
      position: absolute;
      left: var(--space-4);
      top: var(--space-4);
      @include heading-font;
      font-size: var(--fs-lg);
      color: var(--color-brass-ink);
    }

    strong { color: var(--color-espresso); }
  }
}

.made-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0 0 var(--space-5);
  padding-left: 1.2em;
  font-size: var(--fs-base);
  line-height: 1.55;
  color: var(--text-secondary);

  li::marker { color: var(--color-brass); }
  strong, em { color: var(--color-espresso); }
}

.made-text a { color: var(--color-blue-ink); font-weight: 600; }

// Responsible-gambling line: full contrast, never faded (BRANDING §6)
.made-disclaimer {
  margin: var(--space-7) 0 0;
  padding: var(--space-4);
  border-left: 3px solid var(--color-brass);
  background: var(--premium-bg);
  font-size: var(--fs-sm);
  color: var(--color-espresso);

  a { color: var(--color-blue-ink); font-weight: 700; }
}
</style>
