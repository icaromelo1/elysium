import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useTunablesStore } from '@/stores/useTunablesStore'
import { sideOfRoad } from '@/game/mapDef'
import { draftCards, type BuildState } from '@/game/skillDraft'
import {
  AFFINITY,
  levelDefFor,
  resolveArchetypeId,
  type ArchetypeId,
  type DamageType,
  type Role,
  type SkillNode,
  type WeaponRange,
} from '@/game/skillTree'

export type FireMode = 'auto' | 'manual-mov' | 'manual-mouse'
export type Archetype = 'nomade-entre-zonas' | 'errante-na-zona' | 'imovel'
export type RunState =
  | 'menu'
  | 'playing'
  | 'levelup'
  | 'classselect'
  | 'zoneselect'
  | 'placement'
  | 'fork-range'
  | 'fork-damage'
  | 'fork-role'
  | 'capstone'
  | 'gameover'
export type GameOverReason = 'hp' | 'leaks' | null
export type Zone = 'neutra' | 'norte' | 'sul'
export type ForkAxis = 'range' | 'damage' | 'role'

const FIRE_MODE_CYCLE: FireMode[] = ['auto', 'manual-mov', 'manual-mouse']

const FORK_RUN_STATE: Record<ForkAxis, RunState> = {
  range: 'fork-range',
  damage: 'fork-damage',
  role: 'fork-role',
}

const nextXpToNext = (level: number, xpBase: number): number => Math.round(xpBase * Math.pow(1.5, level - 1))

export interface LiveStats {
  damageMultiplier: number
  moveSpeedMultiplier: number
  attackSpeedMultiplier: number
  rangeMultiplier: number
}

export const useGameStore = defineStore('game', () => {
  const tunables = useTunablesStore()
  const hp = ref<number>(100)
  const maxHp = ref<number>(100)
  const level = ref<number>(1)
  const xp = ref<number>(0)
  const xpToNext = computed<number>(() => nextXpToNext(level.value, tunables.xpBase))
  const leaks = ref<number>(0)
  const leaksLimit = ref<number>(10)
  const fireMode = ref<FireMode>('auto')
  const chosenGodId = ref<string | null>(null)
  const archetype = ref<Archetype | null>(null)
  const zone = ref<Zone>('neutra')
  const fixedPosition = ref<{ x: number; y: number } | null>(null)
  const stamina = ref<number>(100)
  const maxStamina = ref<number>(100)
  const enemiesKilled = ref<number>(0)
  const survivalTimeMs = ref<number>(0)
  const runState = ref<RunState>('menu')
  const gameOverReason = ref<GameOverReason>(null)
  const gameSpeed = ref<number>(1)
  const liveStats = ref<LiveStats>({ damageMultiplier: 1, moveSpeedMultiplier: 1, attackSpeedMultiplier: 1, rangeMultiplier: 1 })

  const weaponRange = ref<WeaponRange | null>(null)
  const damageType = ref<DamageType | null>(null)
  const role = ref<Role | null>(null)
  const archetypeId = ref<ArchetypeId | null>(null)
  const chosenSkillIds = ref<string[]>([])
  const pendingCards = ref<SkillNode[]>([])

  const affinityArchetypeId = computed<ArchetypeId | null>(() =>
    chosenGodId.value ? (AFFINITY[chosenGodId.value] ?? null) : null,
  )
  const affinityAligned = computed<boolean>(
    () => !!archetypeId.value && archetypeId.value === affinityArchetypeId.value,
  )

  const startRun = (): void => {
    hp.value = maxHp.value
    level.value = 1
    xp.value = 0
    leaks.value = 0
    enemiesKilled.value = 0
    survivalTimeMs.value = 0
    chosenGodId.value = null
    archetype.value = null
    zone.value = 'neutra'
    fixedPosition.value = null
    stamina.value = maxStamina.value
    gameOverReason.value = null
    fireMode.value = 'auto'
    gameSpeed.value = 1
    weaponRange.value = null
    damageType.value = null
    role.value = null
    archetypeId.value = null
    chosenSkillIds.value = []
    pendingCards.value = []
    runState.value = 'playing'
  }

  const takeDamage = (amount: number): void => {
    hp.value = Math.max(0, hp.value - amount)
    if (hp.value <= 0) {
      gameOverReason.value = 'hp'
      runState.value = 'gameover'
    }
  }

  const addLeak = (): void => {
    leaks.value += 1
    if (leaks.value >= leaksLimit.value) {
      gameOverReason.value = 'leaks'
      runState.value = 'gameover'
    }
  }

  const currentBuildState = (): BuildState => ({
    weaponRange: weaponRange.value,
    damageType: damageType.value,
    role: role.value,
    archetypeId: archetypeId.value,
    affinityArchetypeId: affinityArchetypeId.value,
    chosenIds: chosenSkillIds.value,
  })

  const enterLevel = (): void => {
    const healPercent = Math.min(tunables.healCapPercent, tunables.healBasePercent + level.value * tunables.healPerLevelPercent)
    heal(maxHp.value * (healPercent / 100))
    leaks.value = Math.max(0, leaks.value - (1 + Math.floor(level.value / 10)))

    const levelDef = levelDefFor(level.value)
    if (levelDef.kind === 'fixed') return
    if (levelDef.kind === 'god-select') {
      runState.value = 'classselect'
      return
    }
    if (levelDef.kind === 'fork-range' || levelDef.kind === 'fork-damage' || levelDef.kind === 'fork-role') {
      runState.value = FORK_RUN_STATE[levelDef.kind.replace('fork-', '') as ForkAxis]
      return
    }
    if (levelDef.kind === 'capstone') {
      runState.value = 'capstone'
      return
    }
    pendingCards.value = draftCards(levelDef, currentBuildState())
    runState.value = 'levelup'
  }

  const heal = (amount: number): void => {
    hp.value = Math.min(maxHp.value, hp.value + amount)
  }

  const setMaxHp = (newMaxHp: number): void => {
    const ratio = maxHp.value > 0 ? hp.value / maxHp.value : 1
    maxHp.value = newMaxHp
    hp.value = Math.min(newMaxHp, newMaxHp * ratio)
  }

  const addXp = (amount: number): void => {
    xp.value += amount
    while (xp.value >= xpToNext.value) {
      xp.value -= xpToNext.value
      level.value += 1
      if (runState.value === 'playing') {
        enterLevel()
      }
    }
  }

  const chooseGod = (godId: string, chosenArchetype: Archetype): void => {
    chosenGodId.value = godId
    archetype.value = chosenArchetype
    if (chosenArchetype === 'nomade-entre-zonas') {
      zone.value = 'norte'
      runState.value = 'playing'
    } else if (chosenArchetype === 'errante-na-zona') {
      runState.value = 'zoneselect'
    } else {
      runState.value = 'placement'
    }
  }

  const chooseZone = (chosenZone: Zone): void => {
    zone.value = chosenZone
    runState.value = 'playing'
  }

  const chooseFixedPosition = (x: number, y: number): void => {
    fixedPosition.value = { x, y }
    zone.value = sideOfRoad(x, y)
    runState.value = 'playing'
  }

  const chooseFork = (axis: ForkAxis, value: WeaponRange | DamageType | Role): void => {
    if (axis === 'range') weaponRange.value = value as WeaponRange
    if (axis === 'damage') damageType.value = value as DamageType
    if (axis === 'role') role.value = value as Role

    if (weaponRange.value && damageType.value && role.value) {
      archetypeId.value = resolveArchetypeId(weaponRange.value, damageType.value, role.value)
    }

    runState.value = 'playing'
  }

  const chooseSkillCard = (nodeId: string): void => {
    chosenSkillIds.value.push(nodeId)
    pendingCards.value = []
    runState.value = 'playing'
  }

  const chooseCapstone = (): void => {
    if (archetypeId.value) {
      chosenSkillIds.value.push(`capstone:${archetypeId.value}`)
    }
    runState.value = 'playing'
  }

  const updateStamina = (deltaMs: number, wantsSprint: boolean): boolean => {
    const active = wantsSprint && stamina.value > 0
    if (active) {
      stamina.value = Math.max(0, stamina.value - (tunables.staminaDrainPerSec * deltaMs) / 1000)
    } else {
      stamina.value = Math.min(maxStamina.value, stamina.value + (tunables.staminaRegenPerSec * deltaMs) / 1000)
    }
    return active
  }

  const setGameSpeed = (value: number): void => {
    gameSpeed.value = Math.min(10, Math.max(1, value))
  }

  const setLiveStats = (stats: LiveStats): void => {
    liveStats.value = stats
  }

  const acknowledgeSkill = (): void => {
    runState.value = 'playing'
  }

  const registerKill = (): void => {
    enemiesKilled.value += 1
  }

  const tickSurvivalTime = (deltaMs: number): void => {
    if (runState.value === 'playing') {
      survivalTimeMs.value += deltaMs
    }
  }

  const cycleFireMode = (): void => {
    const currentIndex = FIRE_MODE_CYCLE.indexOf(fireMode.value)
    fireMode.value = FIRE_MODE_CYCLE[(currentIndex + 1) % FIRE_MODE_CYCLE.length] as FireMode
  }

  const backToMenu = (): void => {
    runState.value = 'menu'
  }

  return {
    hp,
    maxHp,
    level,
    xp,
    xpToNext,
    leaks,
    leaksLimit,
    fireMode,
    chosenGodId,
    archetype,
    zone,
    fixedPosition,
    stamina,
    maxStamina,
    enemiesKilled,
    survivalTimeMs,
    runState,
    gameOverReason,
    gameSpeed,
    liveStats,
    weaponRange,
    damageType,
    role,
    archetypeId,
    chosenSkillIds,
    pendingCards,
    affinityArchetypeId,
    affinityAligned,
    startRun,
    takeDamage,
    heal,
    setMaxHp,
    addLeak,
    addXp,
    chooseGod,
    chooseZone,
    chooseFixedPosition,
    chooseFork,
    chooseSkillCard,
    chooseCapstone,
    updateStamina,
    setGameSpeed,
    setLiveStats,
    acknowledgeSkill,
    registerKill,
    tickSurvivalTime,
    cycleFireMode,
    backToMenu,
  }
})
