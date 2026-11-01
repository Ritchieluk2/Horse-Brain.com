<template>
  <!-- About Our Process: shared by the homepage and Our Track Record.
       `cta` adds a button through to the full track record page. -->
  <section class="process-section">
    <div class="container">
      <div class="process-grid">
        <div class="process-content" v-reveal>
          <span class="process-tag">Our Methodology</span>
          <h2 class="section-title">About Our Process</h2>
          <p class="process-lead">
            HorseBrain is built on the principle that rigorous, transparent analysis 
            outperforms gut instinct and tipster hype. Our process is modeled after 
            the quantitative research practices of institutional finance.
          </p>

          <div class="process-steps" v-reveal.stagger>
            <div class="process-step">
              <div class="process-step__number">01</div>
              <div class="process-step__content">
                <h3>Data Ingestion</h3>
                <p>
                  We collect structured data from Equibase covering every race, 
                  horse, jockey, and trainer across all major North American tracks. 
                  This includes historical performances, workout times, pedigree data, 
                  and real-time odds movements.
                </p>
              </div>
            </div>

            <div class="process-step">
              <div class="process-step__number">02</div>
              <div class="process-step__content">
                <h3>Feature Engineering</h3>
                <p>
                  Raw data is transformed into predictive features: jockey win rates 
                  at specific tracks, horse form over distance classes, track condition 
                  preferences, pace scenarios, and class movements. Each feature is 
                  validated against historical outcomes.
                </p>
              </div>
            </div>

            <div class="process-step">
              <div class="process-step__number">03</div>
              <div class="process-step__content">
                <h3>Model Training</h3>
                <p>
                  Our ensemble models are trained on historical track data to draw 
                  statistical inferences about finishing probabilities. Models are 
                  continuously retrained and back-tested to prevent overfitting and 
                  ensure robustness across changing track conditions.
                </p>
              </div>
            </div>

            <div class="process-step">
              <div class="process-step__number">04</div>
              <div class="process-step__content">
                <h3>Publication & Audit</h3>
                <p>
                  Every pick is timestamped and published before post time. Results 
                  are recorded automatically and displayed transparently. We never 
                  revise past picks or hide losses — our track record is our 
                  reputation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside class="process-sidebar">
          <!-- The HorseBrain horse: mixed-cut, inside the brass frame -->
          <figure class="process-figure" v-reveal>
            <span class="process-figure__frame" aria-hidden="true"></span>
            <i class="process-figure__corner process-figure__corner--tl" aria-hidden="true"></i>
            <i class="process-figure__corner process-figure__corner--br" aria-hidden="true"></i>
            <div class="process-figure__media">
              <img
                src="~/assets/images/horsebrain-horse.webp"
                alt="The HorseBrain horse: a thoroughbred built from brightly coloured machine parts"
                width="898"
                height="898"
                loading="lazy"
                class="process-figure__img"
              />
            </div>
            <figcaption class="process-figure__caption">
              <span class="process-figure__kicker">The model</span>
              Part thoroughbred, part machine
            </figcaption>
          </figure>

          <div class="process-sidebar__card" v-reveal>
            <span class="process-sidebar__label">Model Accuracy by Confidence</span>
            <div class="confidence-breakdown">
              <div class="confidence-row">
                <span class="confidence-row__label">High Confidence</span>
                <div class="confidence-row__bar">
                  <div class="confidence-row__fill" style="width: 72%"></div>
                </div>
                <span class="confidence-row__value">72%</span>
              </div>
              <div class="confidence-row">
                <span class="confidence-row__label">Medium Confidence</span>
                <div class="confidence-row__bar">
                  <div class="confidence-row__fill" style="width: 48%"></div>
                </div>
                <span class="confidence-row__value">48%</span>
              </div>
              <div class="confidence-row">
                <span class="confidence-row__label">Low Confidence</span>
                <div class="confidence-row__bar">
                  <div class="confidence-row__fill" style="width: 31%"></div>
                </div>
                <span class="confidence-row__value">31%</span>
              </div>
            </div>
            <p class="process-sidebar__note">
              Win rates across 1,240+ analyzed races, Jan 2024 – present.
            </p>
          </div>
        </aside>
      </div>
      <div v-if="cta" class="process-section__cta" v-reveal>
        <NuxtLink to="/our-track-record" class="btn btn--primary btn--large">
          See Our Full Track Record
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  cta: { type: Boolean, default: false }
})
</script>

<style lang="scss" scoped>
// ---- Process ---------------------------------------------------------------
.process-section { padding-block: var(--section-pad); }

.process-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-8);

  @include up(lg) { grid-template-columns: 1.5fr 1fr; gap: var(--space-9); align-items: start; }
}

.process-content .section-title { text-align: left; }

.process-tag { margin-bottom: var(--space-4); }

.process-lead {
  margin-bottom: var(--space-6);
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-espresso);
  @include up(md) { font-size: 1.2rem; }
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
  margin-top: var(--space-8);
}

.process-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  @include up(sm) { flex-direction: row; gap: var(--space-6); }

  &__number {
    flex-shrink: 0;
    width: 56px;
    @include heading-font;
    font-size: var(--fs-2xl);
    line-height: 1;
    color: var(--color-blue-ink);
    opacity: 0.8;
  }

  &__content {
    flex: 1;
    h3 { font-size: var(--fs-lg); color: var(--color-espresso); margin-bottom: var(--space-2); }
    p { font-size: 0.95rem; color: var(--text-secondary); }
  }
}

// The HorseBrain horse, framed: a mixed-cut ink panel (the art's own
// black background) inside the brass frame. Brackets sit just outside
// the sharp corners, so only the inner media clips.
.process-figure {
  @include frame(22px, var(--color-brass), 1);
  position: relative;
  margin: 0 0 var(--space-6);
  padding: 10px;
  @include mixed-cut(var(--radius-lg));
  background: var(--color-ink);
  box-shadow: var(--shadow-brass);

  &__frame { border-color: rgb(199 169 107 / 0.45); }

  &__media {
    @include mixed-cut(var(--radius-md));
    overflow: hidden;
    background: #000;   // matches the artwork's own background exactly
  }

  &__img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
    transition: transform 0.8s var(--ease-out);
  }

  @include hover { .process-figure__img { transform: scale(1.03); } }

  &__caption {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-3) var(--space-3) var(--space-2);
    @include heading-font;
    font-size: var(--fs-md);
    color: var(--color-white);
  }

  &__kicker {
    @include label-caps(var(--fs-2xs), 0.14em);
    font-family: var(--font-body);
    color: var(--color-brass-light);
  }
}

.process-sidebar__card {
  padding: var(--space-6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-cut);
  background: linear-gradient(135deg, var(--color-cream), var(--color-cream-deep));
  box-shadow: 0 4px 12px rgb(29 28 33 / 0.06);

  @include up(md) { padding: var(--space-7); }
  @include up(lg) { position: sticky; top: calc(var(--header-h) + var(--space-6)); }
}

.process-sidebar__label {
  display: block;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-strong);
  @include label-caps;
  color: var(--color-espresso);
}

.confidence-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.confidence-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px;
  grid-template-areas: 'label value' 'bar bar';
  align-items: center;
  gap: 6px var(--space-3);

  @include up(sm) {
    grid-template-columns: 130px minmax(0, 1fr) 48px;
    grid-template-areas: 'label bar value';
  }

  &__label { grid-area: label; font-size: var(--fs-sm); font-weight: 600; color: var(--color-espresso); }

  &__bar {
    grid-area: bar;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: rgb(69 32 26 / 0.08);
  }

  &__fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(to right, var(--color-fern), var(--color-fern-bright));
    transition: width 1s ease;
  }

  &__value {
    grid-area: value;
    @include heading-font;
    text-align: right;
    color: var(--color-espresso);
  }
}

.process-sidebar__note {
  font-size: var(--fs-xs);
  font-style: italic;
  line-height: 1.4;
  color: var(--text-secondary);
}

// Optional CTA (homepage): on to the full track record page
.process-section__cta {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8);
  padding-top: var(--space-7);
  border-top: 1px solid var(--border-color);
}
</style>
