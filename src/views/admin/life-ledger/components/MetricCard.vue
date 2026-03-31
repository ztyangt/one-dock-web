<template>
  <article class="metric-card glass-panel">
    <div class="metric-head">
      <div class="metric-icon" :style="{ background: iconBg, color: iconColor }">
        <slot name="icon">{{ icon }}</slot>
      </div>

      <div v-if="trend" class="metric-trend" :class="trendTone">
        {{ trend }}
      </div>
    </div>

    <div class="metric-body">
      <div class="metric-value">{{ value }}</div>
      <div class="metric-label">{{ label }}</div>
      <p v-if="description" class="metric-desc">{{ description }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    description?: string
    icon?: string
    trend?: string
    trendTone?: 'neutral' | 'success' | 'warning' | 'primary'
    iconBg?: string
    iconColor?: string
  }>(),
  {
    description: '',
    icon: '✦',
    trend: '',
    trendTone: 'neutral',
    iconBg: 'rgba(14, 165, 233, 0.12)',
    iconColor: 'var(--color-primary-text)',
  },
)
</script>

<style scoped lang="scss">
.metric-card {
  min-height: 154px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: auto -20px -36px auto;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.08);
    filter: blur(6px);
    pointer-events: none;
  }
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.metric-trend {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.66);
  color: var(--color-text-muted);
}

.metric-trend.success {
  color: #059669;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.16);
}

.metric-trend.warning {
  color: #d97706;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.16);
}

.metric-trend.primary {
  color: var(--color-primary-text);
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
}

.metric-body {
  position: relative;
  z-index: 1;
}

.metric-value {
  font-size: clamp(28px, 3vw, 34px);
  line-height: 1.1;
  font-weight: 700;
  color: var(--color-text-main);
  letter-spacing: -0.03em;
}

.metric-label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-pill-text);
}

.metric-desc {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .metric-card {
    min-height: 132px;
    padding: 16px;
  }

  .metric-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    font-size: 18px;
  }

  .metric-value {
    font-size: 28px;
  }
}
</style>
