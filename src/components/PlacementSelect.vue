<template>
  <div class="k-map-dialog-overlay placement-select-passthrough">
    <div class="k-map-dialog-dim" />
    <div class="k-map-dialog-heading">
      <div class="k-map-dialog-eyebrow">NÍVEL 2 · {{ godName }}</div>
      <div class="k-map-dialog-title">Escolha onde plantar sua torre</div>
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
.placement-select-passthrough {
  pointer-events: none;
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
