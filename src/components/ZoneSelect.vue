<template>
  <div class="zone-select-overlay">
    <div class="zone-select-dim" />
    <div class="zone-select-region zone-select-region--north" @click="choose('norte')">
      <span class="zone-select-label zone-select-label--north">NORTE</span>
    </div>
    <div class="zone-select-region zone-select-region--south" @click="choose('sul')">
      <span class="zone-select-label zone-select-label--south">SUL</span>
    </div>
    <div class="zone-select-heading">
      <div class="zone-select-level">NÍVEL 2 · {{ godName }}</div>
      <div class="zone-select-title">Escolha sua Zona</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import type { Zone } from '@/stores/useGameStore'
import { GODS } from '@/game/gods'

const emit = defineEmits(['close'])

const gameStore = useGameStore()

const godName = computed(() => GODS.find((god) => god.id === gameStore.chosenGodId)?.name ?? '')

const choose = (zone: Extract<Zone, 'norte' | 'sul'>): void => {
  gameStore.chooseZone(zone)
  emit('close')
}
</script>

<style scoped>
.zone-select-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
}

.zone-select-dim {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 8, 0.34);
  pointer-events: none;
}

.zone-select-region {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.zone-select-region--north {
  top: 0;
  background: rgba(122, 143, 163, 0.16);
}

.zone-select-region--south {
  top: 50%;
  background: rgba(111, 143, 122, 0.16);
}

.zone-select-region:hover {
  filter: brightness(1.35);
}

.zone-select-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 5px;
  font-size: clamp(18px, 2.6vw, 26px);
  padding: 12px 28px;
  border-radius: 8px;
  background: var(--panel-solid);
  border: 1px solid var(--border-gold);
}

.zone-select-label--north {
  color: var(--steel);
}

.zone-select-label--south {
  color: var(--player);
}

.zone-select-heading {
  position: absolute;
  top: clamp(20px, 4vh, 48px);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}

.zone-select-level {
  font-family: 'Cinzel', serif;
  font-size: clamp(11px, 1.2vw, 14px);
  letter-spacing: 5px;
  color: var(--gold);
  margin-bottom: 10px;
}

.zone-select-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(24px, 3.6vw, 38px);
  font-weight: 700;
}
</style>
