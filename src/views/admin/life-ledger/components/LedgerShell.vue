<template>
  <section class="ledger-shell">
    <header class="ledger-hero glass-panel">
      <div class="hero-copy">
        <div v-if="eyebrow" class="hero-eyebrow">{{ eyebrow }}</div>
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-desc">{{ description }}</p>

        <div v-if="$slots.meta || metaList.length" class="hero-meta">
          <slot name="meta">
            <span v-for="item in metaList" :key="item" class="meta-chip">{{ item }}</span>
          </slot>
        </div>
      </div>

      <div v-if="$slots.actions" class="hero-actions">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.stats" class="ledger-stats">
      <slot name="stats" />
    </div>

    <div v-if="$slots.toolbar" class="ledger-toolbar glass-panel">
      <slot name="toolbar" />
    </div>

    <main class="ledger-content">
      <slot />
    </main>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow?: string
    metaList?: string[]
  }>(),
  {
    eyebrow: '',
    metaList: () => [],
  },
)
</script>

<style scoped lang="scss">
.ledger-shell {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
  color: var(--color-text-main);
}

.ledger-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(10px);
  }

  &::before {
    width: 180px;
    height: 180px;
    right: -28px;
    top: -48px;
    background: rgba(56, 189, 248, 0.16);
  }

  &::after {
    width: 140px;
    height: 140px;
    right: 120px;
    bottom: -60px;
    background: rgba(168, 85, 247, 0.12);
  }
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 760px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 12px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 0;
  font-size: clamp(28px, 3vw, 36px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-headline-start), var(--color-headline-end));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-desc {
  margin: 14px 0 0;
  max-width: 720px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-muted);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--color-tag);
  border: 1px solid var(--color-border);
  color: var(--color-pill-text);
  font-size: 12px;
  font-weight: 600;
}

.hero-actions {
  position: relative;
  z-index: 1;
  min-width: 220px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.ledger-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ledger-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  flex-wrap: wrap;
}

.ledger-content {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 1180px) {
  .ledger-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 880px) {
  .ledger-shell {
    padding: 18px;
  }

  .ledger-hero {
    padding: 22px;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .ledger-stats {
    grid-template-columns: 1fr;
  }

  .ledger-toolbar {
    padding: 14px;
  }
}
</style>
