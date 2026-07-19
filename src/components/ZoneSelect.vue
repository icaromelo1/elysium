<template>
  <div class="k-map-dialog-overlay">
    <div class="k-map-dialog-dim k-map-dialog-dim--heavy" />
    <div class="zone-select-region zone-select-region--north" @click="choose('norte')">
      <span class="zone-select-label zone-select-label--north">NORTE</span>
    </div>
    <div class="zone-select-region zone-select-region--south" @click="choose('sul')">
      <span class="zone-select-label zone-select-label--south">SUL</span>
    </div>
    <div class="k-map-dialog-heading">
      <div class="k-map-dialog-eyebrow">NÍVEL 2 · {{ godName }}</div>
      <div class="k-map-dialog-title">Escolha sua Zona</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import type { Zone } from '@/stores/useGameStore'
import { GODS } from '@/game/gods'

const gameStore = useGameStore()

const godName = computed(() => GODS.find((god) => god.id === gameStore.chosenGodId)?.name ?? '')

const choose = (zone: Extract<Zone, 'norte' | 'sul'>): void => {
  gameStore.chooseZone(zone)
}
</script>

<style scoped>
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
</style>
