<template>
  <div class="skill-map">
    <div class="skill-map-backdrop" />
    <div class="skill-map-content">
      <div class="skill-map-heading">
        <div class="skill-map-eyebrow">ELYSIUM · ÁRVORE DE COMBATE</div>
        <div class="skill-map-title">Do Nível 1 ao Capstone</div>
        <div v-if="closable" class="skill-map-close" @click="emit('close')">FECHAR ✕</div>
      </div>

      <div class="skill-map-trunk">
        <div class="skill-map-node" :class="{ 'skill-map-node--active': level === 1 }">Nv 1 · Melee Físico (fixo)</div>
        <div class="skill-map-node" :class="{ 'skill-map-node--active': level === 2 }">Nv 2 · Escolher Deus</div>
        <div class="skill-map-node" :class="{ 'skill-map-node--active': level >= 3 && level <= 5 }">Nv 3-5 · Tier 1 (bônus genéricos)</div>
        <div class="skill-map-fork" :class="{ 'skill-map-fork--active': level === 6 }">Nv 6 · FORK: Alcance (Melee / Projétil)</div>
      </div>

      <div class="skill-map-branches skill-map-branches--2">
        <div v-for="range in RANGES" :key="range" class="skill-map-branch" :class="branchClass(rangeActive(range))">
          <div class="skill-map-branch-label">{{ range === 'melee' ? 'MELEE' : 'PROJÉTIL' }}</div>
          <div class="skill-map-node skill-map-node--small">Nv 7-9 · Tier 2</div>
          <div class="skill-map-fork skill-map-fork--small" :class="{ 'skill-map-fork--active': level === 10 && rangeActive(range) }">
            Nv 10 · FORK: Dano
          </div>

          <div class="skill-map-branches skill-map-branches--2">
            <div v-for="dmg in DAMAGES" :key="dmg" class="skill-map-branch" :class="branchClass(rangeActive(range) && damageActive(dmg))">
              <div class="skill-map-branch-label">{{ dmg === 'fisico' ? 'FÍSICO' : 'MÁGICO' }}</div>
              <div class="skill-map-node skill-map-node--small">Nv 11-14 · Tier 3</div>
              <div
                class="skill-map-fork skill-map-fork--small"
                :class="{ 'skill-map-fork--active': level === 15 && rangeActive(range) && damageActive(dmg) }"
              >
                Nv 15 · FORK: Papel
              </div>

              <div class="skill-map-archetypes">
                <div
                  v-for="arch in archetypesFor(range, dmg)"
                  :key="arch.id"
                  class="skill-map-archetype"
                  :class="{ 'skill-map-archetype--active': archetypeId === arch.id, 'skill-map-archetype--affinity': affinityGodFor(arch.id) }"
                  :style="affinityGodFor(arch.id) ? { borderColor: affinityGodFor(arch.id)!.colorCss } : {}"
                >
                  <div class="skill-map-archetype-name">{{ arch.name }}</div>
                  <div class="skill-map-archetype-theme">{{ arch.theme }}</div>
                  <div v-if="affinityGodFor(arch.id)" class="skill-map-archetype-god" :style="{ color: affinityGodFor(arch.id)!.colorCss }">
                    afinidade: {{ affinityGodFor(arch.id)!.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="skill-map-footer">
        <div class="skill-map-node skill-map-node--capstone">Nv 20 · CAPSTONE (habilidade única, reskin por deus)</div>
        <div class="skill-map-node skill-map-node--infinite">Nv 21+ · MODO INFINITO (draft misto, roguelite)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import { AFFINITY, ARCHETYPES, type ArchetypeId, type DamageType, type WeaponRange } from '@/game/skillTree'
import { GODS } from '@/game/gods'

withDefaults(defineProps<{ closable?: boolean }>(), { closable: true })
const emit = defineEmits(['close'])

const gameStore = useGameStore()

const RANGES: WeaponRange[] = ['melee', 'projetil']
const DAMAGES: DamageType[] = ['fisico', 'magico']

const level = computed(() => (gameStore.runState === 'menu' ? 0 : gameStore.level))
const archetypeId = computed(() => gameStore.archetypeId)

const rangeActive = (range: WeaponRange): boolean => gameStore.weaponRange === range
const damageActive = (damage: DamageType): boolean => gameStore.damageType === damage

const branchClass = (active: boolean): Record<string, boolean> => ({ 'skill-map-branch--active': active })

const archetypesFor = (range: WeaponRange, damage: DamageType) => ARCHETYPES.filter((a) => a.range === range && a.damage === damage)

const affinityGodFor = (id: ArchetypeId) => GODS.find((god) => AFFINITY[god.id] === id)
</script>

<style scoped>
.skill-map {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
}

.skill-map-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 10%, var(--bg-soft) 0%, var(--bg) 70%);
  z-index: -1;
}

.skill-map-content {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.skill-map-heading {
  text-align: center;
  position: relative;
}

.skill-map-eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--gold);
  margin-bottom: 8px;
}

.skill-map-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
}

.skill-map-close {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--ink-muted);
  cursor: pointer;
  padding: 8px 12px;
}

.skill-map-trunk {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.skill-map-node {
  background: var(--panel-solid);
  border: 1px solid var(--border-faint);
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  text-align: center;
}

.skill-map-node--active {
  border-color: var(--gold);
  color: var(--gold);
}

.skill-map-node--small {
  font-size: 12px;
  padding: 8px 12px;
}

.skill-map-node--capstone {
  border-color: var(--gold);
  color: var(--gold);
  font-family: 'Cinzel', serif;
}

.skill-map-node--infinite {
  border-color: var(--purple);
  color: var(--purple);
  border-style: dashed;
}

.skill-map-fork {
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-family: 'Cinzel', serif;
  color: var(--gold);
  text-align: center;
}

.skill-map-fork--small {
  font-size: 11px;
  padding: 6px 10px;
}

.skill-map-fork--active {
  background: rgba(201, 162, 39, 0.22);
}

.skill-map-branches {
  display: grid;
  gap: 16px;
}

.skill-map-branches--2 {
  grid-template-columns: repeat(2, 1fr);
}

.skill-map-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-hair);
  opacity: 0.55;
}

.skill-map-branch--active {
  opacity: 1;
  border-color: var(--border-gold);
}

.skill-map-branch-label {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--ink-muted);
}

.skill-map-archetypes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.skill-map-archetype {
  background: var(--panel-solid);
  border: 1px solid var(--border-faint);
  border-radius: 8px;
  padding: 8px 10px;
}

.skill-map-archetype--active {
  border-width: 2px;
}

.skill-map-archetype-name {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
}

.skill-map-archetype-theme {
  font-size: 11px;
  color: var(--ink-dim);
  margin-top: 2px;
}

.skill-map-archetype-god {
  font-size: 10px;
  letter-spacing: 0.5px;
  margin-top: 4px;
  font-weight: 700;
}

.skill-map-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
</style>
