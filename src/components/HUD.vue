<template>
  <div class="hud">
    <div class="hud__vitals k-panel">
      <div class="hud__row">
        <span class="k-label hud__label">VIDA</span>
        <span class="hud__value">{{ hp }}/{{ maxHp }}</span>
      </div>
      <div class="hud__bar hud__bar--hp">
        <div class="hud__bar-fill" :style="{ width: `${hpPercent}%`, background: hpColor }"></div>
      </div>
      <div class="hud__row hud__row--level">
        <span class="k-label hud__label">NÍVEL {{ level }}</span>
        <span class="hud__value">{{ xpPercent }}%</span>
      </div>
      <div class="hud__bar hud__bar--xp">
        <div class="hud__bar-fill" :style="{ width: `${xpPercent}%` }"></div>
      </div>
      <div class="hud__row hud__row--level">
        <span class="k-label hud__label">STAMINA</span>
        <span class="hud__value">{{ Math.round(stamina) }}/{{ maxStamina }}</span>
      </div>
      <div class="hud__bar hud__bar--stamina">
        <div class="hud__bar-fill hud__bar-fill--stamina" :style="{ width: `${staminaPercent}%` }"></div>
      </div>
    </div>

    <div class="hud__leaks k-panel">
      <div class="hud__leaks-label">VAZAMENTOS</div>
      <div class="hud__leaks-value">
        {{ leaks }}
        <span class="hud__leaks-limit">/ {{ leaksLimit }}</span>
      </div>
    </div>

    <div class="hud__firemode k-panel">
      <div
        v-for="mode in fireModes"
        :key="mode.value"
        class="hud__mode"
        :class="{ 'hud__mode--active': mode.value === fireMode }"
        @click="cycleFireMode"
      >
        <div class="hud__mode-dot"></div>
        <span class="hud__mode-label">{{ mode.label }}</span>
      </div>
      <div class="hud__firemode-hint">
        pressione <span class="hud__key">Q</span> pra trocar
      </div>
    </div>

    <div class="hud__speed k-panel">
      <span class="k-label hud__label">VELOCIDADE</span>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        :value="gameSpeed"
        class="hud__speed-slider"
        @input="onSpeedInput"
      />
      <span class="hud__speed-value">{{ gameSpeed }}×</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/useGameStore'
import type { FireMode } from '@/stores/useGameStore'

const gameStore = useGameStore()
const { hp, maxHp, level, xp, xpToNext, leaks, leaksLimit, fireMode, stamina, maxStamina, gameSpeed } =
  storeToRefs(gameStore)
const { cycleFireMode, setGameSpeed } = gameStore

const onSpeedInput = (event: Event): void => {
  setGameSpeed(Number((event.target as HTMLInputElement).value))
}

const hpPercent = computed(() => (hp.value / maxHp.value) * 100)

const hpColor = computed(() => {
  if (hpPercent.value > 50) return '#6f8f7a'
  if (hpPercent.value > 20) return '#c9a227'
  return '#ad5a3c'
})

const xpPercent = computed(() => Math.round((xp.value / xpToNext.value) * 100))
const staminaPercent = computed(() => Math.round((stamina.value / maxStamina.value) * 100))

const fireModes: { value: FireMode; label: string }[] = [
  { value: 'auto', label: 'AUTO' },
  { value: 'manual-mov', label: 'MANUAL · MOV' },
  { value: 'manual-mouse', label: 'MANUAL · MOUSE' },
]
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hud__vitals {
  position: absolute;
  top: clamp(14px, 2.5vw, 36px);
  left: clamp(14px, 2.5vw, 36px);
  width: clamp(240px, 24vw, 420px);
  padding: clamp(12px, 1.4vw, 18px) clamp(14px, 1.8vw, 22px);
  box-sizing: border-box;
  pointer-events: auto;
}

.hud__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.hud__row--level {
  margin: 14px 0 10px;
}

.hud__label {
  font-size: clamp(12px, 1.1vw, 15px);
}

.hud__value {
  font-size: clamp(12px, 1.1vw, 15px);
  color: var(--ink-muted);
}

.hud__bar {
  height: 14px;
  border-radius: 4px;
  background: var(--track);
  border: 1px solid var(--border-hair);
  overflow: hidden;
}

.hud__bar--xp {
  height: 9px;
}

.hud__bar-fill {
  height: 100%;
  background: var(--player);
}

.hud__bar--stamina {
  height: 9px;
}

.hud__bar-fill--stamina {
  background: var(--steel);
}

.hud__leaks {
  position: absolute;
  top: clamp(14px, 2.5vw, 36px);
  right: clamp(14px, 2.5vw, 36px);
  padding: clamp(12px, 1.4vw, 16px) clamp(14px, 1.8vw, 22px);
  border-color: var(--border-danger);
  text-align: right;
  box-sizing: border-box;
  pointer-events: auto;
}

.hud__leaks-label {
  font-family: 'Cinzel', serif;
  font-size: clamp(11px, 1vw, 14px);
  letter-spacing: 2px;
  color: var(--danger);
  margin-bottom: 6px;
}

.hud__leaks-value {
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: 700;
}

.hud__leaks-limit {
  color: var(--ink-muted);
  font-size: clamp(14px, 1.6vw, 20px);
  font-weight: 500;
}

.hud__firemode {
  position: absolute;
  bottom: clamp(16px, 3vw, 40px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 92vw;
  gap: 10px;
  padding: clamp(10px, 1.4vw, 14px) clamp(12px, 2vw, 20px);
  box-sizing: border-box;
  pointer-events: auto;
}

.hud__mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: min(120px, 26vw);
  cursor: pointer;
}

.hud__mode--active {
  background: rgba(201, 162, 39, 0.14);
  border-color: rgba(201, 162, 39, 0.5);
}

.hud__mode-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4a4235;
}

.hud__mode--active .hud__mode-dot {
  background: var(--gold);
}

.hud__mode-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-muted);
  letter-spacing: 0.5px;
}

.hud__mode--active .hud__mode-label {
  color: var(--gold);
}

.hud__firemode-hint {
  display: flex;
  align-items: center;
  padding-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--ink-muted);
  font-size: 13px;
}

.hud__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: 0 4px;
  border-radius: 5px;
  background: var(--panel-solid);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 700;
  color: var(--ink);
}

.hud__speed {
  position: absolute;
  bottom: clamp(16px, 3vw, 40px);
  right: clamp(14px, 2.5vw, 36px);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: clamp(10px, 1.4vw, 14px) clamp(14px, 1.8vw, 20px);
  box-sizing: border-box;
  pointer-events: auto;
}

.hud__speed-slider {
  width: clamp(90px, 12vw, 140px);
  accent-color: var(--gold);
}

.hud__speed-value {
  font-family: 'SF Mono', monospace;
  font-weight: 700;
  color: var(--ink);
  min-width: 26px;
  text-align: right;
}
</style>
