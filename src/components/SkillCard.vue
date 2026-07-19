<template>
  <div class="k-dialog-overlay">
    <div class="k-dialog-backdrop" />
    <div class="k-dialog-content">
      <div class="k-dialog-heading">
        <div class="k-dialog-eyebrow">NÍVEL {{ gameStore.level }} ALCANÇADO</div>
        <div class="k-dialog-title">Escolha uma Habilidade</div>
      </div>
      <div class="skill-card-list">
        <div
          v-for="card in cards"
          :key="card.node.id"
          class="skill-card k-dialog-fade-up"
          :style="{ borderColor: card.border }"
          @click="confirm(card.node.id)"
        >
          <div class="skill-card-icon" :style="{ background: card.iconBg, borderColor: card.accent }">
            <div class="skill-card-icon-shape" :style="{ background: card.accent }" />
          </div>
          <div class="skill-card-rarity" :style="{ color: card.accent }">{{ card.node.rarity.toUpperCase() }}</div>
          <div class="skill-card-name">{{ card.node.name }}</div>
          <div class="skill-card-description">{{ card.node.description }}</div>
          <div class="skill-card-effect" :style="{ color: card.accent }">{{ card.effectLabel }}</div>
          <div class="skill-card-choose" :style="{ background: card.accent }">ESCOLHER</div>
        </div>
      </div>
      <div class="skill-card-hint">use o mouse pra escolher</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import type { SkillNode } from '@/game/skillTree'
import type { EffectSpec } from '@/game/effects'

const gameStore = useGameStore()

const RARITY_COLOR: Record<SkillNode['rarity'], { accent: string; iconBg: string; border: string }> = {
  comum: { accent: '#c9a227', iconBg: 'rgba(201,162,39,0.12)', border: 'rgba(201,162,39,0.35)' },
  raro: { accent: '#7a8fa3', iconBg: 'rgba(122,143,163,0.12)', border: 'rgba(122,143,163,0.35)' },
  epico: { accent: '#8f7aa8', iconBg: 'rgba(143,122,168,0.12)', border: 'rgba(143,122,168,0.35)' },
}

const STAT_LABEL: Record<string, string> = {
  damage: 'dano',
  maxHp: 'vida máxima',
  moveSpeed: 'velocidade',
  attackSpeed: 'velocidade de ataque',
  range: 'alcance',
  maxStamina: 'stamina máxima',
  staminaRegen: 'regeneração de stamina',
}

function formatEffect(effect: EffectSpec): string {
  switch (effect.kind) {
    case 'stat-mod':
      return `+${effect.percent}% ${STAT_LABEL[effect.stat] ?? effect.stat}`
    case 'on-hit-dot':
      return `${effect.damagePercent}% dano ao longo do tempo`
    case 'on-hit-stun':
      return `${effect.chancePercent}% chance de atordoar`
    case 'on-hit-lifesteal':
      return `${effect.percent}% de roubo de vida`
    case 'on-hit-multistrike':
      return `${effect.chancePercent}% chance de acerto duplo`
    case 'on-hit-shred':
      return `alvo recebe +${effect.percent}% dano`
    case 'pierce':
      return `atravessa +${effect.extraTargets} alvo(s)`
    case 'combo-escalation':
      return `+${effect.percentPerStack}%/combo (máx ${effect.maxStacks})`
    case 'combo-burst':
      return `explode a cada ${effect.stacksRequired} acertos`
    case 'on-kill-buff':
      return `+${effect.percent}% ${STAT_LABEL[effect.stat] ?? effect.stat} ao matar`
    case 'dash':
      return `avança até o alvo (cd ${effect.cooldownMs / 1000}s)`
    case 'aura-shield':
      return `absorve ${effect.absorbPercent}% do dano`
    case 'periodic-heal':
      return `cura ${effect.percent}% a cada ${effect.intervalMs / 1000}s`
    case 'summon-companion':
      return `invoca aliado por ${effect.durationMs / 1000}s`
    case 'ultimate-window':
      return `ativa por ${effect.durationMs / 1000}s`
    default:
      return ''
  }
}

const cards = computed(() =>
  gameStore.pendingCards.map((node) => {
    const colors = RARITY_COLOR[node.rarity]
    return { node, effectLabel: formatEffect(node.effect), ...colors }
  }),
)

const confirm = (nodeId: string): void => {
  gameStore.chooseSkillCard(nodeId)
}
</script>

<style scoped>
.skill-card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 36px;
  max-width: 94vw;
}

.skill-card {
  width: min(320px, 86vw);
  padding: 32px 26px;
  background: var(--panel-solid);
  border: 1px solid;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
  cursor: pointer;
}

.skill-card-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-card-icon-shape {
  width: 34px;
  height: 34px;
  border-radius: 50%;
}

.skill-card-rarity {
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
}

.skill-card-name {
  font-family: 'Cinzel', serif;
  font-size: 24px;
  font-weight: 700;
}

.skill-card-description {
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink-dim);
  min-height: 66px;
}

.skill-card-effect {
  padding: 8px 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-faint);
  font-size: 15px;
  font-weight: 600;
}

.skill-card-choose {
  margin-top: 8px;
  width: 100%;
  padding: 14px 0;
  border-radius: 8px;
  color: var(--bg);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
  cursor: pointer;
}

.skill-card-hint {
  font-size: 13px;
  color: var(--ink-faint);
}
</style>
