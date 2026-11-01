<template>
  <div class="todays-picks-page">
    <!-- 1. Page Title -->
    <PageTitle 
      title="Today's Picks"
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Today\'s Picks' }
      ]"
    />

    <!-- 2. Tab Selector (Two Preview Cards) -->
    <section class="picks-selector">
      <div class="container">
        <div class="picks-selector__header">
          <h2 class="section-title">Featured Free Picks</h2>
          <p class="section-subtitle">Our algorithm's highest confidence selections for today. Click a card to view the full analysis.</p>
        </div>

        <div class="picks-selector__grid" v-reveal.stagger>
          <button
            v-for="(pick, index) in featuredPicks"
            :key="pick.key"
            class="pick-tab"
            :class="{ 
              'pick-tab--active': activePick === index,
              [`pick-tab--confidence-${pick.confidence}`]: true
            }"
            @click="activePick = index"
          >
            <span class="pick-tab__frame" aria-hidden="true"></span>
            <i class="pick-tab__corner pick-tab__corner--tl" aria-hidden="true"></i>
            <i class="pick-tab__corner pick-tab__corner--br" aria-hidden="true"></i>

            <div class="pick-tab__viewing" v-if="activePick === index">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Currently Viewing
            </div>

            <header class="pick-tab__header">
              <img :src="pick.square || pick.logo" :alt="`${pick.track_name} logo`" class="track-icon pick-tab__logo" />
              <div class="pick-tab__race-info">
                <span class="pick-tab__track">{{ pick.track_name }}</span>
                <span class="pick-tab__race">Race {{ pick.race_num }}</span>
              </div>
            </header>

            <div class="pick-tab__body">
              <div class="pick-tab__horse-block">
                <span class="pick-tab__program" :data-pgm="pick.botPick.program_number">{{ pick.botPick.program_number }}</span>
                <div class="pick-tab__horse-details">
                  <NuxtLink 
                    v-if="getHorseLink(pick.botPick.program_number)"
                    :to="getHorseLink(pick.botPick.program_number)"
                    class="pick-tab__horse pick-tab__horse--link"
                    >
                    {{ pick.botPick.horse_name }}
                    </NuxtLink>
                    <h3 v-else class="pick-tab__horse">{{ pick.botPick.horse_name }}</h3>
                  <span class="pick-tab__jockey">{{ pick.botPick.jockey_name }}</span>
                </div>
              </div>

              <div 
                class="pick-tab__confidence" 
                :class="`pick-tab__confidence--${pick.botPick.confidence}`"
              >
                <svg v-if="pick.botPick.confidence === 'high'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else-if="pick.botPick.confidence === 'medium'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>{{ pick.botPick.confidence }} confidence</span>
              </div>
            </div>

            <footer class="pick-tab__footer">
              <span class="pick-tab__meta">
                Post: {{ formatTime(pick.post_time) }}
              </span>
              <span class="pick-tab__meta">
                {{ pick.distance }} • {{ pick.surface }}
              </span>
            </footer>
          </button>
        </div>
      </div>
    </section>

    <!-- 3. Full Analysis Pane -->
    <section class="analysis-pane">
      <div class="container">
        <Transition name="fade" mode="out-in">
          <div :key="activePick" class="analysis-content">
            
            <!-- Race Header -->
            <header class="analysis-header" v-reveal>
              <div class="analysis-header__content">
                <span class="analysis-header__track">{{ currentPick.track_name }}</span>
                <h2 class="analysis-header__title">Race {{ currentPick.race_num }} Analysis</h2>
                <p class="analysis-header__type">{{ currentPick.race_type }}</p>
                
                <div class="analysis-header__meta">
                  <div class="meta-item">
                    <span class="meta-item__label">Post</span>
                    <span class="meta-item__value">{{ formatTime(currentPick.post_time) }}</span>
                  </div>
                  <div class="meta-item meta-item--divider">
                    <span class="meta-item__label">Distance</span>
                    <span class="meta-item__value">{{ currentPick.distance }}</span>
                  </div>
                  <div class="meta-item meta-item--divider">
                    <span class="meta-item__label">Surface</span>
                    <span class="meta-item__value">{{ currentPick.surface }}</span>
                  </div>
                  <div class="meta-item meta-item--divider">
                    <span class="meta-item__label">Purse</span>
                    <span class="meta-item__value">${{ (currentPick.purse / 1000).toFixed(0) }}k</span>
                  </div>
                </div>
              </div>

              <div class="analysis-header__visual">
                <img :src="currentPick.background" :alt="currentPick.track_name" class="analysis-header__bg" />
                <div class="analysis-header__overlay"></div>
              </div>
            </header>

            <!-- Per-Horse Predictions -->
            <div class="predictions-block">
              <h3 class="block-title">Horse-by-Horse Analysis</h3>
              <p class="block-subtitle">Our algorithm's confidence rating and detailed analysis for every runner.</p>

              <div class="predictions-grid" v-reveal.stagger>
                <article 
                  v-for="prediction in currentPick.predictions" 
                  :key="prediction.program_number"
                  class="prediction-card"
                  :class="`prediction-card--${prediction.confidence}`"
                >
                  <span class="prediction-card__frame" aria-hidden="true"></span>
                  <i class="prediction-card__corner prediction-card__corner--tl" aria-hidden="true"></i>
                  <i class="prediction-card__corner prediction-card__corner--br" aria-hidden="true"></i>

                  <header class="prediction-card__header">
                    <div class="prediction-card__program" :data-pgm="prediction.program_number">{{ prediction.program_number }}</div>
                    <div class="prediction-card__horse-info">
                      <NuxtLink 
                        v-if="getHorseLink(prediction.program_number)"
                        :to="getHorseLink(prediction.program_number)"
                        class="prediction-card__horse prediction-card__horse--link"
                        >
                        {{ getHorseName(prediction.program_number) }}
                        </NuxtLink>
                        <h4 v-else class="prediction-card__horse">{{ getHorseName(prediction.program_number) }}</h4>
                      <span class="prediction-card__jockey">{{ getJockeyName(prediction.program_number) }}</span>
                    </div>
                    <div 
                      class="prediction-card__confidence" 
                      :class="`prediction-card__confidence--${prediction.confidence}`"
                    >
                      <svg v-if="prediction.confidence === 'high'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <svg v-else-if="prediction.confidence === 'medium'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span class="prediction-card__confidence-label">{{ prediction.confidence }}</span>
                    </div>
                  </header>

                  <p class="prediction-card__analysis">{{ prediction.analysis }}</p>

                  <footer class="prediction-card__footer">
                    <span>ML: {{ getOdds(prediction.program_number) }}</span>
                    <span>{{ getWeight(prediction.program_number) }} lbs</span>
                  </footer>
                </article>
              </div>
            </div>

            <!-- Premium Picks -->
            <div class="premium-block">
              <h3 class="block-title">Premium Expert Picks</h3>
              <p class="block-subtitle">Our algorithm's highest-conviction combinations for this race.</p>

              <div class="premium-grid" v-reveal.stagger>
                <!-- Most Likely Winner -->
                <article class="premium-card premium-card--winner">
                  <span class="premium-card__badge">Most Likely Winner</span>
                  <div class="premium-card__body">
                    <div class="premium-card__program" :data-pgm="currentPick.premiumPicks.mostLikelyWinner.program_number">{{ currentPick.premiumPicks.mostLikelyWinner.program_number }}</div>
                    <div class="premium-card__info">
                        <NuxtLink 
                            v-if="getHorseLink(currentPick.premiumPicks.mostLikelyWinner.program_number)"
                            :to="getHorseLink(currentPick.premiumPicks.mostLikelyWinner.program_number)"
                            class="premium-card__horse premium-card__horse--link"
                            >
                            {{ currentPick.premiumPicks.mostLikelyWinner.horse_name }}
                        </NuxtLink>
                        <h4 v-else class="premium-card__horse">{{ currentPick.premiumPicks.mostLikelyWinner.horse_name }}</h4>
                      <div class="probability-bar">
                        <div class="probability-bar__fill" :style="{ width: `${currentPick.premiumPicks.mostLikelyWinner.probability}%` }"></div>
                      </div>
                      <span class="probability-bar__label">
                        {{ currentPick.premiumPicks.mostLikelyWinner.probability }}% win probability
                      </span>
                    </div>
                  </div>
                </article>

                <!-- Best Value -->
                <article class="premium-card premium-card--value">
                  <span class="premium-card__badge">Best Value</span>
                  <div class="premium-card__body">
                    <div class="premium-card__program" :data-pgm="currentPick.premiumPicks.bestValue.program_number">{{ currentPick.premiumPicks.bestValue.program_number }}</div>
                    <div class="premium-card__info">
                      <NuxtLink
                        v-if="getHorseLink(currentPick.premiumPicks.bestValue.program_number)"
                        :to="getHorseLink(currentPick.premiumPicks.bestValue.program_number)"
                        class="premium-card__horse premium-card__horse--link"
                      >
                        {{ currentPick.premiumPicks.bestValue.horse_name }}
                      </NuxtLink>
                      <h4 v-else class="premium-card__horse">{{ currentPick.premiumPicks.bestValue.horse_name }}</h4>
                      <span class="premium-card__odds-tag">{{ currentPick.premiumPicks.bestValue.odds }}</span>
                      <p class="premium-card__reason">{{ currentPick.premiumPicks.bestValue.reason }}</p>
                    </div>
                  </div>
                </article>

                <!-- WPS -->
                <article class="premium-card premium-card--wps">
                  <span class="premium-card__badge">WPS (Win / Place / Show)</span>
                  <div class="premium-card__body premium-card__body--stacked">
                    <div v-for="(pgm, idx) in currentPick.premiumPicks.wps" :key="pgm" class="wps-row">
                      <span class="wps-row__position" :data-place="idx + 1">{{ idx + 1 }}</span>
                      <span class="wps-row__bet">{{ ['Win', 'Place', 'Show'][idx] }}</span>
                      <span class="wps-row__program" :data-pgm="pgm">{{ pgm }}</span>
                      <NuxtLink v-if="getHorseLink(pgm)" :to="getHorseLink(pgm)" class="wps-row__horse wps-row__horse--link">{{ getHorseName(pgm) }}</NuxtLink>
                      <span v-else class="wps-row__horse">{{ getHorseName(pgm) }}</span>
                      <span
                        v-if="currentPick.premiumPicks.wpsConfidence"
                        class="wps-row__confidence confidence"
                        :class="`confidence--${confTier(currentPick.premiumPicks.wpsConfidence[idx])}`"
                        :title="`${confTier(currentPick.premiumPicks.wpsConfidence[idx])} confidence`"
                      >
                        <svg v-if="confTier(currentPick.premiumPicks.wpsConfidence[idx]) === 'high'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <svg v-else-if="confTier(currentPick.premiumPicks.wpsConfidence[idx]) === 'medium'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {{ currentPick.premiumPicks.wpsConfidence[idx] }}%
                      </span>
                    </div>
                  </div>
                </article>

                <!-- Exacta -->
                <article class="premium-card premium-card--exacta">
                  <span class="premium-card__badge">Exacta</span>
                  <div class="premium-card__body premium-card__body--horizontal">
                    <div class="exacta-slot">
                        <span class="exacta-slot__position" :data-place="1" title="1st" aria-label="1st">1</span>
                        <span class="exacta-slot__program" :data-pgm="currentPick.premiumPicks.exacta.top">{{ currentPick.premiumPicks.exacta.top }}</span>
                        <NuxtLink 
                            v-if="getHorseLink(currentPick.premiumPicks.exacta.top)"
                            :to="getHorseLink(currentPick.premiumPicks.exacta.top)"
                            class="exacta-slot__horse exacta-slot__horse--link"
                        >
                            {{ getHorseName(currentPick.premiumPicks.exacta.top) }}
                        </NuxtLink>
                        <span v-else class="exacta-slot__horse">{{ getHorseName(currentPick.premiumPicks.exacta.top) }}</span>
                        </div>
                    <div class="exacta-arrow">→</div>
                    <div class="exacta-slot">
                        <span class="exacta-slot__position" :data-place="2" title="2nd" aria-label="2nd">2</span>
                        <span class="exacta-slot__program" :data-pgm="currentPick.premiumPicks.exacta.second">{{ currentPick.premiumPicks.exacta.second }}</span>
                        <NuxtLink 
                            v-if="getHorseLink(currentPick.premiumPicks.exacta.second)"
                            :to="getHorseLink(currentPick.premiumPicks.exacta.second)"
                            class="exacta-slot__horse exacta-slot__horse--link"
                        >
                            {{ getHorseName(currentPick.premiumPicks.exacta.second) }}
                        </NuxtLink>
                        <span v-else class="exacta-slot__horse">{{ getHorseName(currentPick.premiumPicks.exacta.second) }}</span>
                        </div>
                  </div>
                </article>

                <!-- Trifecta -->
                <article class="premium-card premium-card--trifecta">
                <span class="premium-card__badge">Trifecta</span>
                <div class="premium-card__body premium-card__body--horizontal">
                    <div class="exacta-slot">
                    <span class="exacta-slot__position" :data-place="1" title="1st" aria-label="1st">1</span>
                    <span class="exacta-slot__program" :data-pgm="currentPick.premiumPicks.trifecta.top">{{ currentPick.premiumPicks.trifecta.top }}</span>
                    <NuxtLink 
                        v-if="getHorseLink(currentPick.premiumPicks.trifecta.top)"
                        :to="getHorseLink(currentPick.premiumPicks.trifecta.top)"
                        class="exacta-slot__horse exacta-slot__horse--link"
                    >
                        {{ getHorseName(currentPick.premiumPicks.trifecta.top) }}
                    </NuxtLink>
                    <span v-else class="exacta-slot__horse">{{ getHorseName(currentPick.premiumPicks.trifecta.top) }}</span>
                    </div>
                    <div class="exacta-arrow">→</div>
                    <div class="exacta-slot">
                    <span class="exacta-slot__position" :data-place="2" title="2nd" aria-label="2nd">2</span>
                    <span class="exacta-slot__program" :data-pgm="currentPick.premiumPicks.trifecta.second">{{ currentPick.premiumPicks.trifecta.second }}</span>
                    <NuxtLink 
                        v-if="getHorseLink(currentPick.premiumPicks.trifecta.second)"
                        :to="getHorseLink(currentPick.premiumPicks.trifecta.second)"
                        class="exacta-slot__horse exacta-slot__horse--link"
                    >
                        {{ getHorseName(currentPick.premiumPicks.trifecta.second) }}
                    </NuxtLink>
                    <span v-else class="exacta-slot__horse">{{ getHorseName(currentPick.premiumPicks.trifecta.second) }}</span>
                    </div>
                    <div class="exacta-arrow">→</div>
                    <div class="exacta-slot">
                    <span class="exacta-slot__position" :data-place="3" title="3rd" aria-label="3rd">3</span>
                    <span class="exacta-slot__program" :data-pgm="currentPick.premiumPicks.trifecta.third">{{ currentPick.premiumPicks.trifecta.third }}</span>
                    <NuxtLink 
                        v-if="getHorseLink(currentPick.premiumPicks.trifecta.third)"
                        :to="getHorseLink(currentPick.premiumPicks.trifecta.third)"
                        class="exacta-slot__horse exacta-slot__horse--link"
                    >
                        {{ getHorseName(currentPick.premiumPicks.trifecta.third) }}
                    </NuxtLink>
                    <span v-else class="exacta-slot__horse">{{ getHorseName(currentPick.premiumPicks.trifecta.third) }}</span>
                    </div>
                </div>
                </article>
              </div>
            </div>

            <!-- View Full Raceday Link -->
            <div class="analysis-cta" v-reveal>
              <NuxtLink :to="currentPick.path" class="btn btn--tertiary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                View Full {{ currentPick.track_name }} Card
              </NuxtLink>
              <NuxtLink :to="`/picks/${currentPick.track_id}/${currentPick.dateISO}/${currentPick.race_num}`" class="btn btn--primary">
                Open Full Analysis Page
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
              <ProgramLink :track="currentPick.track_id" :date="currentPick.dateISO" :race="currentPick.race_num" label="Track It in the Program" />
            </div>

          </div>
        </Transition>
      </div>
    </section>

    <!-- 4. Newsletter CTA -->
    <section class="newsletter-cta">
      <div class="container">
        <div class="newsletter-cta__content" v-reveal>
          <h2 class="newsletter-cta__title">Get Daily Picks in Your Inbox</h2>
          <p class="newsletter-cta__text">
            Subscribe to receive our top algorithmic picks every morning before first post.
          </p>
          <form class="newsletter-cta__form" @submit.prevent>
            <input type="email" placeholder="Enter your email address" class="newsletter-cta__input" required />
            <button type="submit" class="btn btn--primary">Subscribe</button>
          </form>
          <p class="newsletter-cta__privacy">No spam. Unsubscribe anytime. Just data.</p>
        </div>
      </div>
    </section>

    <!-- 5. Transparent Track Record -->
    <section class="track-record">
      <div class="container">
        <h2 class="section-title" v-reveal>100% Transparent Track Record</h2>
        <p class="section-subtitle" v-reveal>
          We operate like a financial institution. Here is our verified, historical performance.
        </p>

        <div class="track-record__ornament" v-reveal aria-hidden="true">
          <span class="track-record__ornament-line"></span>
          <span class="track-record__ornament-diamond"></span>
          <span class="track-record__ornament-line"></span>
        </div>

        <div class="stats-grid" v-reveal.stagger ref="statsGrid">
          <div
            v-for="stat in trackRecordStats"
            :key="stat.label"
            class="stat-card"
            :class="{ 'is-settled': stat.isSettled }"
          >
            <span class="stat-card__frame" aria-hidden="true"></span>
            <i class="stat-card__corner stat-card__corner--tl" aria-hidden="true"></i>
            <i class="stat-card__corner stat-card__corner--br" aria-hidden="true"></i>

            <div class="stat-card__value">
              <template v-for="(char, cIndex) in stat.chars" :key="cIndex">
                <span v-if="char.type === 'static'" class="char-static">{{ char.value }}</span>
                <span v-else class="char-roll" :style="{ transitionDelay: `${cIndex * 0.08}s` }">
                  <span 
                    class="char-roll__column" 
                    :class="{ 'is-rolled': stat.isSettled }"
                    :style="{ '--roll-dist': char.target }"
                  >
                    <span v-for="n in (char.target + 1)" :key="n - 1">{{ n - 1 }}</span>
                  </span>
                </span>
              </template>
            </div>

            <span class="stat-card__label">{{ stat.label }}</span>
          </div>
        </div>

        <p class="track-record__disclaimer">
          <em>Past performance is not indicative of future results. Please bet responsibly.</em>
        </p>
      </div>
    </section>

    <!-- 6. Schedule CTA -->
    <section class="schedule-cta">
      <div class="container">
        <div class="schedule-cta__inner" v-reveal>
          <div class="schedule-cta__text">
            <h2 class="schedule-cta__title">Ready for the next race?</h2>
            <p class="schedule-cta__subtitle">
              Browse the full race schedule or explore more picks from {{ currentPick?.track_name || 'our supported tracks' }}.
            </p>
          </div>
          <div class="schedule-cta__actions">
            <NuxtLink :to="currentPick?.path || '/racetracks'" class="btn btn--secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to {{ currentPick?.shortDate || 'Racetracks' }}
            </NuxtLink>
            <NuxtLink to="/" class="btn btn--primary">
              View Full Schedule
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PageTitle from '~/components/snippets/PageTitle.vue'
import { useRacedays } from '~/composables/useRacedays'
import ProgramLink from '~/components/program/ProgramLink.vue'

const { getRaceday } = useRacedays()

const activePick = ref(0)

// Build the two featured picks from our raceday data
const featuredPicks = computed(() => {
  const picks = []

  // Pick 1: Keeneland Race 1
  const kee = getRaceday('KEE', '2026-10-31')
  if (kee) {
    const race1 = kee.races.find(r => r.race_num === 1)
    if (race1) {
      const pickPgm = race1.botPick?.program_number
      const pickHorse = race1.participants.find(p => String(p.program_number) === String(pickPgm))
      picks.push({
        key: 'kee-r1',
        ...race1,
        track_id: kee.track_id,
        track_name: kee.track_name,
        logo: kee.logo,
        square: kee.square,
        background: kee.background,
        dateISO: kee.dateISO,
        shortDate: kee.shortDate,
        path: kee.path,
        botPick: {
          program_number: pickPgm,
          horse_name: pickHorse?.horse_name || 'Unknown',
          jockey_name: pickHorse?.jockey_name || '—',
          confidence: race1.botPick?.confidence || 'medium'
        }
      })
    }
  }

  // Pick 2: Belmont Park Race 2
  const bel = getRaceday('BEL', '2026-11-01')
  if (bel) {
    const race2 = bel.races.find(r => r.race_num === 2)
    if (race2) {
      const pickPgm = race2.botPick?.program_number
      const pickHorse = race2.participants.find(p => String(p.program_number) === String(pickPgm))
      picks.push({
        key: 'bel-r2',
        ...race2,
        track_id: bel.track_id,
        track_name: bel.track_name,
        logo: bel.logo,
        square: bel.square,
        background: bel.background,
        dateISO: bel.dateISO,
        shortDate: bel.shortDate,
        path: bel.path,
        botPick: {
          program_number: pickPgm,
          horse_name: pickHorse?.horse_name || 'Unknown',
          jockey_name: pickHorse?.jockey_name || '—',
          confidence: race2.botPick?.confidence || 'medium'
        }
      })
    }
  }

  return picks
})

const currentPick = computed(() => featuredPicks.value[activePick.value] || {})

/* Helper functions */
const getHorseName = (pgm) => {
  if (!currentPick.value || !currentPick.value.participants) return 'Unknown'
  const p = currentPick.value.participants.find(x => String(x.program_number) === String(pgm))
  return p ? p.horse_name : 'Unknown'
}

const getJockeyName = (pgm) => {
  if (!currentPick.value || !currentPick.value.participants) return '—'
  const p = currentPick.value.participants.find(x => String(x.program_number) === String(pgm))
  return p ? p.jockey_name : '—'
}

const getOdds = (pgm) => {
  if (!currentPick.value || !currentPick.value.participants) return '—'
  const p = currentPick.value.participants.find(x => String(x.program_number) === String(pgm))
  if (!p) return '—'
  const d = parseFloat(p.odds)
  if (!Number.isFinite(d)) return '—'
  const f = Math.round(d * 2) / 2
  const whole = Math.floor(f)
  return f === whole ? `${whole}-1` : `${Math.round(f * 2)}-2`
}

const getWeight = (pgm) => {
  if (!currentPick.value || !currentPick.value.participants) return '—'
  const p = currentPick.value.participants.find(x => String(x.program_number) === String(pgm))
  return p ? p.weight : '—'
}

const formatTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

/* Track Record Odometer */
const statsGrid = ref(null)
const statsObserver = ref(null)

const trackRecordStats = ref([
  { label: 'Win Rate (Top Pick)', target: 68.4, format: 'percent', isSettled: false, chars: [] },
  { label: 'ROI (Return on Investment)', target: 14.2, format: 'plus-percent', isSettled: false, chars: [] },
  { label: 'Total Races Analyzed', target: 1240, format: 'comma', isSettled: false, chars: [] },
  { label: '$100 Base Profit', target: 45, format: 'dollar-k-plus', isSettled: false, chars: [] }
])

const getFormattedString = (value, format) => {
  const safeValue = Number.isFinite(value) ? value : 0
  switch (format) {
    case 'percent': return `${safeValue.toFixed(1)}%`
    case 'plus-percent': return `+${safeValue.toFixed(1)}%`
    case 'comma': return Math.round(safeValue).toLocaleString('en-US')
    case 'dollar-k-plus': return `$${Math.round(safeValue)}k+`
    default: return String(Math.round(safeValue))
  }
}

const getHorseLink = (pgm) => {
  if (!currentPick.value || !currentPick.value.participants) return null
  const p = currentPick.value.participants.find(x => String(x.program_number) === String(pgm))
  return p?.horse_equibase_refid ? `/horses/${p.horse_equibase_refid}` : null
}

const parseChars = (target, format) => {
  const finalStr = getFormattedString(target, format)
  const chars = []
  for (const char of finalStr) {
    if (/\d/.test(char)) {
      chars.push({ type: 'roll', target: parseInt(char, 10) })
    } else {
      chars.push({ type: 'static', value: char })
    }
  }
  return chars
}

const initCountUpAnimation = () => {
  if (!statsGrid.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    trackRecordStats.value.forEach(stat => { stat.isSettled = true })
    return
  }

  statsObserver.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        trackRecordStats.value.forEach(stat => { stat.isSettled = true })
        statsObserver.value.disconnect()
        statsObserver.value = null
      }
    },
    { threshold: 0.35 }
  )

  statsObserver.value.observe(statsGrid.value)
}

onMounted(() => {
  trackRecordStats.value.forEach(stat => {
    stat.chars = parseChars(stat.target, stat.format)
  })
  initCountUpAnimation()
})

onBeforeUnmount(() => {
  if (statsObserver.value) {
    statsObserver.value.disconnect()
  }
})

useHead({
  title: "Today's Picks | HorseBrain"
})

// Confidence tier from a percentage (WPS rows): >=65 high, >=45 medium, else low
const confTier = (p) => (p >= 65 ? 'high' : p >= 45 ? 'medium' : 'low')
</script>

<style lang="scss" scoped>
// Shared pieces (prediction/premium cards, stat cards, CTAs, newsletter)
// come from assets/scss/components/. Only page layout lives here.
.todays-picks-page { background-color: var(--bg-page); }

// ---- Pick selector (two featured picks as tabs) --------------------
.picks-selector {
  padding-block: var(--section-pad-sm);
  background-color: var(--bg-alt);
  border-bottom: 1px solid var(--border-color);

  &__header { text-align: center; margin-bottom: var(--space-7); }
  &__header .section-subtitle { margin-bottom: 0; }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-5);
    max-width: 1000px;
    margin: 0 auto;

    @include up(md) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
  }
}

.pick-tab {
  @include card(var(--space-5));
  @include ornament-frame(20px);
  width: 100%;
  overflow: hidden;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out), border-color var(--dur) ease;

  @include up(md) { padding: var(--space-7); }

  @include hover {
    &:not(.pick-tab--active) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-card-hover);
      border-color: rgb(133 171 255 / 0.4);
    }
  }

  &:focus-visible { @include focus-ring; }

  // Active = premium brass treatment
  &--active {
    transform: translateY(-4px);
    border-color: var(--color-brass);
    box-shadow: var(--shadow-brass);
    outline: 1px solid rgb(199 169 107 / 0.4);
    outline-offset: 3px;

    .pick-tab__frame { border-color: rgb(199 169 107 / 0.3); }
    .pick-tab__corner { opacity: 1; }
  }

  &__viewing {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--radius-label);
    background-color: var(--color-fern);
    color: var(--color-white);
    @include label-caps(0.65rem, 0.08em);
    animation: pick-pulse 2s ease-in-out infinite;

    @include up(md) { top: var(--space-4); right: var(--space-4); }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    padding-right: 120px; // keep clear of the "Currently Viewing" pill
    border-bottom: 1px solid var(--border-color);
  }

  // square track tile (.track-icon, components/_track-cards.scss)
  &__logo {
    --icon-size: 48px;
    @include up(md) { --icon-size: 56px; }
  }

  &__race-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

  &__track {
    @include heading-font;
    font-size: var(--fs-md);
    color: var(--color-espresso);
    @include truncate;
  }

  &__race {
    @include label-caps(var(--fs-xs), 0.05em);
    color: var(--text-secondary);
  }

  &__body { margin-bottom: var(--space-5); }

  &__horse-block {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }


  &__horse-details { flex: 1; min-width: 0; }

  &__horse {
    display: block;
    @include heading-font;
    font-size: var(--fs-xl);
    color: var(--color-espresso);
    margin: 0 0 2px;
    @include truncate;
  }

  &__jockey { font-size: var(--fs-sm); color: var(--text-secondary); }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-1) var(--space-3);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-color);
    font-size: var(--fs-xs);
    font-weight: 600;
    color: var(--text-secondary);
  }
}

@keyframes pick-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgb(54 107 36 / 0.4); }
  50% { box-shadow: 0 0 0 6px rgb(54 107 36 / 0); }
}

// ---- Analysis pane ---------------------------------------------------
.analysis-pane { padding-block: var(--section-pad-sm) var(--section-pad); }

.analysis-content { max-width: 1200px; margin: 0 auto; }

// Race header card: text over dark, track photo on the right (≥ lg)
.analysis-header {
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: var(--space-8);
  overflow: hidden;
  border-radius: var(--radius-cut);
  background-color: var(--bg-dark);
  color: var(--text-on-dark);

  @include up(lg) { grid-template-columns: 1fr 1fr; min-height: 280px; }

  &__content {
    padding: var(--space-6) var(--space-5);
    @include up(md) { padding: var(--space-8); }
  }

  &__track {
    display: inline-block;
    margin-bottom: var(--space-3);
    @include label-caps(var(--fs-2xs), 0.14em);
    color: var(--color-baby-blue);
  }

  &__title {
    margin-bottom: var(--space-2);
    font-size: var(--fs-3xl);
    line-height: 1;
    color: var(--color-white);
  }

  &__type {
    margin-bottom: var(--space-6);
    font-style: italic;
    color: var(--text-on-dark-muted);
  }

  &__meta { @include stat-row; }

  &__visual {
    position: relative;
    order: -1;              // photo first on phones (a banner)
    min-height: 160px;

    @include up(md) { min-height: 220px; }
    @include up(lg) { order: 0; min-height: 280px; }
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 40%;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, var(--color-shadow-grey) 0%, rgb(29 28 33 / 0.2) 70%);

    @include up(lg) {
      background: linear-gradient(to right, var(--color-shadow-grey) 0%, rgb(29 28 33 / 0.3) 40%, rgb(29 28 33 / 0.1) 100%);
    }
  }
}

.analysis-header__meta { justify-content: flex-start; @include up(sm) { justify-content: flex-start; } }

.meta-item { @include stat-item; }

// ---- Block headings ----------------------------------------------------
.block-title {
  font-size: var(--fs-2xl);
  color: var(--color-espresso);
  margin-bottom: var(--space-2);
}

.block-subtitle {
  margin-bottom: var(--space-7);
  color: var(--text-secondary);
}

.predictions-block,
.premium-block { margin-bottom: var(--space-9); }

.analysis-cta {
  justify-content: center;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}
</style>