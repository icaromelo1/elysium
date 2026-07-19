<template>
  <div class="admin-panel">
    <div class="admin-panel-header">
      <span class="admin-panel-title">PAINEL DE AJUSTE — ELYSIUM</span>
      <div class="admin-panel-header-actions">
        <span class="admin-panel-reset" @click="onReset">ASSAR UPGRADES NO BASE ↻</span>
        <span class="admin-panel-close" @click="emit('close')">FECHAR (`) ✕</span>
      </div>
    </div>
    <div class="admin-panel-body">
      <div class="admin-panel-group">
        <h3>Jogador</h3>
        <div v-for="field in playerFields" :key="field.key" class="admin-panel-field">
          <label class="admin-panel-field-row">
            <span class="name">{{ field.label }}</span>
            <input type="number" v-model.number="tunables[field.key]" step="any" />
          </label>
          <div class="admin-panel-field-caption">{{ captionFor(field.key) }}</div>
        </div>
      </div>
      <div class="admin-panel-group">
        <h3>Inimigos</h3>
        <div v-for="field in enemyFields" :key="field.key" class="admin-panel-field">
          <label class="admin-panel-field-row">
            <span class="name">{{ field.label }}</span>
            <input type="number" v-model.number="tunables[field.key]" step="any" />
          </label>
          <div class="admin-panel-field-caption">{{ captionFor(field.key) }}</div>
        </div>
      </div>
      <div class="admin-panel-group">
        <h3>Progressão</h3>
        <div v-for="field in progressionFields" :key="field.key" class="admin-panel-field">
          <label class="admin-panel-field-row">
            <span class="name">{{ field.label }}</span>
            <input type="number" v-model.number="tunables[field.key]" step="any" />
          </label>
          <div class="admin-panel-field-caption">{{ captionFor(field.key) }}</div>
        </div>
      </div>
      <div class="admin-panel-readout">
        <h3>Valores calculados agora (somente leitura)</h3>
        <div class="readout-grid">
          <div class="readout-item">
            <div class="k">Mult. dano</div>
            <div class="v">×{{ gameStore.liveStats.damageMultiplier.toFixed(2) }}</div>
          </div>
          <div class="readout-item">
            <div class="k">Mult. velocidade</div>
            <div class="v">×{{ gameStore.liveStats.moveSpeedMultiplier.toFixed(2) }}</div>
          </div>
          <div class="readout-item">
            <div class="k">Mult. vel. ataque</div>
            <div class="v">×{{ gameStore.liveStats.attackSpeedMultiplier.toFixed(2) }}</div>
          </div>
          <div class="readout-item">
            <div class="k">Mult. alcance</div>
            <div class="v">×{{ gameStore.liveStats.rangeMultiplier.toFixed(2) }}</div>
          </div>
          <div class="readout-item">
            <div class="k">Afinidade</div>
            <div class="v" :style="{ color: gameStore.affinityAligned ? 'var(--gold)' : 'var(--ink-faint)' }">
              {{ gameStore.affinityAligned ? 'alinhada' : 'não alinhada' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useGameStore } from '@/stores/useGameStore'
import type { LiveStats } from '@/stores/useGameStore'
import { TUNABLE_DEFAULTS, useTunablesStore, type TunableKey } from '@/stores/useTunablesStore'

const emit = defineEmits(['close'])

const gameStore = useGameStore()
const tunables = useTunablesStore()
const $q = useQuasar()

const MULTIPLIER_FIELD: Partial<Record<TunableKey, keyof LiveStats>> = {
  moveSpeed: 'moveSpeedMultiplier',
  damagePerTick: 'damageMultiplier',
  fireIntervalMs: 'attackSpeedMultiplier',
  meleeRange: 'rangeMultiplier',
  projectileRange: 'rangeMultiplier',
}

const captionFor = (key: TunableKey): string => {
  const base = TUNABLE_DEFAULTS[key]

  if (key === 'maxHp') {
    const current = gameStore.maxHp
    const mult = tunables.maxHp !== 0 ? current / tunables.maxHp : 1
    return `padrão: ${base} · build atual: ×${mult.toFixed(2)} → ${current.toFixed(1)}`
  }

  const multiplierKey = MULTIPLIER_FIELD[key]
  if (multiplierKey) {
    const mult = gameStore.liveStats[multiplierKey]
    const current = key === 'fireIntervalMs' ? tunables[key] / mult : tunables[key] * mult
    return `padrão: ${base} · build atual: ×${mult.toFixed(2)} → ${current.toFixed(key === 'fireIntervalMs' ? 0 : 1)}`
  }

  return `padrão: ${base}`
}

const playerFields = [
  { key: 'moveSpeed' as const, label: 'Velocidade base' },
  { key: 'damagePerTick' as const, label: 'Dano base' },
  { key: 'fireIntervalMs' as const, label: 'Intervalo de ataque (ms)' },
  { key: 'maxHp' as const, label: 'Vida máx. base' },
  { key: 'meleeRange' as const, label: 'Alcance melee' },
  { key: 'projectileRange' as const, label: 'Alcance projétil' },
  { key: 'sprintMultiplier' as const, label: 'Mult. sprint' },
  { key: 'affinityMultiplier' as const, label: 'Mult. afinidade' },
  { key: 'staminaDrainPerSec' as const, label: 'Drain de stamina/s' },
  { key: 'staminaRegenPerSec' as const, label: 'Regen de stamina/s' },
]

const enemyFields = [
  { key: 'enemyHp' as const, label: 'HP' },
  { key: 'enemySpeed' as const, label: 'Velocidade' },
  { key: 'enemyContactDamage' as const, label: 'Dano de contato' },
  { key: 'enemyContactRange' as const, label: 'Alcance de contato' },
  { key: 'waveSpawnIntervalMs' as const, label: 'Intervalo de spawn (ms)' },
]

const progressionFields = [
  { key: 'healBasePercent' as const, label: 'Cura base %' },
  { key: 'healPerLevelPercent' as const, label: 'Cura por nível %' },
  { key: 'healCapPercent' as const, label: 'Cura teto %' },
  { key: 'xpBase' as const, label: 'XP base' },
]

const onReset = (): void => {
  const { damageMultiplier, moveSpeedMultiplier, attackSpeedMultiplier, rangeMultiplier } = gameStore.liveStats
  const nothingToBake =
    gameStore.runState !== 'playing' ||
    (damageMultiplier === 1 && moveSpeedMultiplier === 1 && attackSpeedMultiplier === 1 && rangeMultiplier === 1 && gameStore.maxHp === tunables.maxHp)

  if (nothingToBake) {
    $q.notify({ type: 'warning', message: 'Nada pra assar ainda — nenhum multiplicador ativo nessa run.' })
    return
  }

  tunables.damagePerTick *= damageMultiplier
  tunables.moveSpeed *= moveSpeedMultiplier
  tunables.fireIntervalMs /= attackSpeedMultiplier
  tunables.meleeRange *= rangeMultiplier
  tunables.projectileRange *= rangeMultiplier
  tunables.maxHp = gameStore.maxHp

  $q.notify({ type: 'positive', message: 'Upgrades assados nos campos base.' })
}
</script>

<style scoped>
.admin-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  width: min(720px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--panel-solid);
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  z-index: 50;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
}

.admin-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(201, 162, 39, 0.08);
  border-bottom: 1px solid var(--border-hair);
  position: sticky;
  top: 0;
}

.admin-panel-title {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold);
  font-size: 13px;
}

.admin-panel-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-panel-reset {
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--gold);
  cursor: pointer;
}

.admin-panel-reset:hover {
  text-decoration: underline;
}

.admin-panel-close {
  font-size: 11px;
  color: var(--ink-muted);
  cursor: pointer;
}

.admin-panel-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-panel-group {
  padding: 16px 18px;
  border-right: 1px solid var(--border-hair);
  border-bottom: 1px solid var(--border-hair);
}

.admin-panel-group h3 {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--ink-muted);
  margin: 0 0 12px;
  text-transform: uppercase;
}

.admin-panel-field {
  padding: 6px 0;
  font-size: 12.5px;
}

.admin-panel-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-panel-field .name {
  color: var(--ink-dim);
}

.admin-panel-field-caption {
  margin-top: 3px;
  font-size: 10px;
  color: var(--ink-faint);
  font-family: 'SF Mono', monospace;
}

.admin-panel-field input {
  width: 72px;
  background: var(--bg);
  border: 1px solid var(--border-faint);
  border-radius: 5px;
  color: var(--ink);
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  padding: 4px 6px;
  text-align: right;
}

.admin-panel-readout {
  grid-column: 1 / -1;
  padding: 16px 18px;
  background: rgba(122, 143, 163, 0.06);
}

.admin-panel-readout h3 {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--steel);
  margin: 0 0 12px;
  text-transform: uppercase;
}

.readout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.readout-item {
  background: var(--bg);
  border: 1px solid var(--border-hair);
  border-radius: 6px;
  padding: 8px 12px;
}

.readout-item .k {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--ink-faint);
  text-transform: uppercase;
}

.readout-item .v {
  font-family: 'SF Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  color: var(--player);
  margin-top: 2px;
}
</style>
