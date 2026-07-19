<template>
  <div class="fork-select-overlay">
    <div class="fork-select-backdrop" />
    <div class="fork-select-content">
      <div class="fork-select-heading">
        <div class="fork-select-level">{{ eyebrow }}</div>
        <div class="fork-select-title">{{ title }}</div>
      </div>
      <div class="fork-select-list">
        <div
          v-for="(option, index) in options"
          :key="option.value"
          class="fork-select-card"
          :style="{ animationDelay: `${index * 100}ms` }"
          @click="emit('choose', option.value)"
        >
          <div class="fork-select-name">{{ option.label }}</div>
          <div class="fork-select-description">{{ option.description }}</div>
          <div class="fork-select-choose">{{ options.length === 1 ? 'CONFIRMAR' : 'ESCOLHER' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ForkOption {
  value: string
  label: string
  description: string
}

defineProps<{ eyebrow: string; title: string; options: ForkOption[] }>()
const emit = defineEmits(['choose'])
</script>

<style scoped>
.fork-select-overlay {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
}

.fork-select-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, var(--bg-soft) 0%, var(--bg) 75%);
  filter: blur(3px);
  opacity: 0.65;
}

.fork-select-content {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 8, 0.74);
  backdrop-filter: blur(1.5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 4vw, 44px);
  box-sizing: border-box;
  padding: 32px 16px;
}

.fork-select-heading {
  text-align: center;
}

.fork-select-level {
  font-family: 'Cinzel', serif;
  font-size: clamp(12px, 1.4vw, 16px);
  letter-spacing: 6px;
  color: var(--gold);
  margin-bottom: 14px;
}

.fork-select-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
}

.fork-select-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 28px;
  max-width: 94vw;
}

.fork-select-card {
  width: min(300px, 86vw);
  padding: 32px 26px;
  background: var(--panel-solid);
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
  animation: floatUp 0.5s ease both;
  cursor: pointer;
}

.fork-select-name {
  font-family: 'Cinzel', serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--gold);
}

.fork-select-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-dim);
  min-height: 44px;
}

.fork-select-choose {
  margin-top: 4px;
  width: 100%;
  padding: 12px 0;
  border-radius: 8px;
  background: var(--gold);
  color: var(--bg);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
