<template>
  <div class="placement-select-overlay">
    <div class="placement-select-dim" />
    <div class="placement-select-heading">
      <div class="placement-select-level">NÍVEL 2 · {{ godName }}</div>
      <div class="placement-select-title">Escolha onde plantar sua torre</div>
      <div class="placement-select-hint">clique em qualquer ponto fora da estrada</div>
    </div>
    <div
      v-if="hasPreview"
      class="placement-select-confirm"
      :class="{ 'placement-select-confirm--invalid': !valid }"
      @click="valid && emit('confirm')"
    >
      {{ valid ? 'CONFIRMAR' : 'PONTO INVÁLIDO — TENTE OUTRO LUGAR' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import { GODS } from '@/game/gods'

defineProps<{ hasPreview: boolean; valid: boolean }>()
const emit = defineEmits(['confirm'])

const gameStore = useGameStore()

const godName = computed(() => GODS.find((god) => god.id === gameStore.chosenGodId)?.name ?? '')
</script>

<style scoped>
.placement-select-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
  pointer-events: none;
}

.placement-select-dim {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 8, 0.2);
  pointer-events: none;
}

.placement-select-heading {
  position: absolute;
  top: clamp(20px, 4vh, 48px);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}

.placement-select-level {
  font-family: 'Cinzel', serif;
  font-size: clamp(11px, 1.2vw, 14px);
  letter-spacing: 5px;
  color: var(--gold);
  margin-bottom: 10px;
}

.placement-select-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(24px, 3.6vw, 38px);
  font-weight: 700;
}

.placement-select-hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--ink-muted);
}

.placement-select-confirm {
  position: absolute;
  bottom: clamp(24px, 5vh, 60px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--gold);
  color: var(--bg);
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
}

.placement-select-confirm--invalid {
  background: var(--danger);
  color: var(--ink);
  cursor: not-allowed;
}
</style>
