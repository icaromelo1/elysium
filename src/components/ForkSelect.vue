<template>
  <div class="k-dialog-overlay">
    <div class="k-dialog-backdrop" />
    <div class="k-dialog-content">
      <div class="k-dialog-heading">
        <div class="k-dialog-eyebrow">{{ eyebrow }}</div>
        <div class="k-dialog-title">{{ title }}</div>
      </div>
      <div class="fork-select-list">
        <div
          v-for="(option, index) in options"
          :key="option.value"
          class="fork-select-card k-dialog-fade-up"
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
</style>
