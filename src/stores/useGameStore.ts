import { defineStore } from 'pinia'
import { ref } from 'vue'

export type FireMode = 'auto' | 'manual-mov' | 'manual-mouse'
export type Archetype = 'nomade-entre-zonas' | 'errante-na-zona' | 'imovel'
export type RunState = 'menu' | 'playing' | 'levelup' | 'classselect' | 'gameover'
export type GameOverReason = 'hp' | 'leaks' | null

const FIRE_MODE_CYCLE: FireMode[] = ['auto', 'manual-mov', 'manual-mouse']

const nextXpToNext = (level: number): number => Math.round(10 * Math.pow(1.5, level - 1))

export const useGameStore = defineStore('game', () => {
  const hp = ref<number>(100)
  const maxHp = ref<number>(100)
  const level = ref<number>(1)
  const xp = ref<number>(0)
  const xpToNext = ref<number>(10)
  const leaks = ref<number>(0)
  const leaksLimit = ref<number>(10)
  const fireMode = ref<FireMode>('auto')
  const chosenGodId = ref<string | null>(null)
  const archetype = ref<Archetype | null>(null)
  const enemiesKilled = ref<number>(0)
  const survivalTimeMs = ref<number>(0)
  const runState = ref<RunState>('menu')
  const gameOverReason = ref<GameOverReason>(null)

  const startRun = (): void => {
    hp.value = maxHp.value
    level.value = 1
    xp.value = 0
    xpToNext.value = nextXpToNext(1)
    leaks.value = 0
    enemiesKilled.value = 0
    survivalTimeMs.value = 0
    chosenGodId.value = null
    archetype.value = null
    gameOverReason.value = null
    fireMode.value = 'auto'
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

  const addXp = (amount: number): void => {
    xp.value += amount
    while (xp.value >= xpToNext.value) {
      xp.value -= xpToNext.value
      level.value += 1
      xpToNext.value = nextXpToNext(level.value)
      if (runState.value === 'playing') {
        runState.value = level.value === 2 ? 'classselect' : 'levelup'
      }
    }
  }

  const chooseGod = (godId: string, chosenArchetype: Archetype): void => {
    chosenGodId.value = godId
    archetype.value = chosenArchetype
    runState.value = 'playing'
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
    enemiesKilled,
    survivalTimeMs,
    runState,
    gameOverReason,
    startRun,
    takeDamage,
    addLeak,
    addXp,
    chooseGod,
    acknowledgeSkill,
    registerKill,
    tickSurvivalTime,
    cycleFireMode,
    backToMenu,
  }
})
