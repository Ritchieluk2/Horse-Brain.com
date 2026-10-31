<template>
  <footer class="site-footer">
    <!-- Top Section: Development Notice -->
    <div class="footer-development">
      <p class="footer-development__title">Currently in Development</p>
      <p class="footer-development__note">All data and predictions are placeholder</p>
    </div>

    <!-- Bottom Section: Black Bar with Copyright & Links -->
    <div class="footer-bottom">
      <div class="container footer-bottom__inner">
        <p class="footer-copyright">
          &copy; 2026 horse-brain.com. All rights reserved.
        </p>
        
        <div class="footer-links">
          <!-- Email Link -->
          <a href="mailto:info@horse-brain.com" class="footer-link" title="Email Us">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span>info@horse-brain.com</span>
          </a>
          
          <!-- GitHub Link -->
          <a href="https://github.com/OFSkean/horsebrain" target="_blank" rel="noopener noreferrer" class="footer-link" title="View on GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style lang="scss" scoped>
.site-footer {
  margin-top: auto;
  width: 100%;
}

// Baby-blue "currently in development" band — inlaid between two
// blue-ink rules (same treatment as the sage Currently Racing band)
.footer-development {
  position: relative;
  background-color: var(--color-baby-blue);
  border-block: 2px solid var(--color-blue-ink);
  padding: var(--space-8) var(--gutter);
  text-align: center;

  @include up(md) { padding-block: var(--space-9); }

  // inner hairline rule
  &::before {
    content: '';
    position: absolute;
    inset: 6px 0;
    border-block: 1px solid rgb(59 103 191 / 0.45);
    pointer-events: none;
  }

  p { margin-inline: auto; }

  &__title {
    @include heading-font;
    font-size: var(--fs-md);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--color-shadow-grey);

    @include up(md) { font-size: var(--fs-lg); }
  }

  &__note {
    margin-top: var(--space-3);
    font-size: var(--fs-xs);
    font-weight: 500;
    letter-spacing: 0.04em;
    color: rgb(29 28 33 / 0.75);
  }
}

// Shadow-grey legal bar
.footer-bottom {
  background-color: var(--bg-dark);
  color: var(--text-on-dark-faint);
  padding: var(--space-6) 0;
  font-size: var(--fs-sm);

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);

    @include up(md) {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}

.footer-copyright {
  margin: 0;
  text-align: center;
  @include up(md) { text-align: left; }
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-4) var(--space-6);
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  color: var(--text-on-dark-muted);
  font-weight: 500;
  transition: color var(--dur-fast) ease, transform var(--dur-fast) ease;

  @include hover {
    color: var(--color-baby-blue);
    transform: translateY(-1px);
  }
}
</style>