import { defineStore } from 'pinia'
import { ref } from 'vue'

export const TUNABLE_DEFAULTS = {
  moveSpeed: 220,
  damagePerTick: 10,
  fireIntervalMs: 1000,
  maxHp: 100,
  meleeRange: 90,
  projectileRange: 180,
  sprintMultiplier: 2,
  affinityMultiplier: 1.15,
  staminaDrainPerSec: 35,
  staminaRegenPerSec: 20,

  enemyHp: 40,
  enemySpeed: 70,
  enemyContactDamage: 8,
  enemyContactRange: 40,
  waveSpawnIntervalMs: 1800,

  healBasePercent: 8,
  healPerLevelPercent: 1,
  healCapPercent: 50,
  xpBase: 10,
} as const

export type TunableKey = keyof typeof TUNABLE_DEFAULTS

export const useTunablesStore = defineStore('tunables', () => {
  const moveSpeed = ref<number>(TUNABLE_DEFAULTS.moveSpeed)
  const damagePerTick = ref<number>(TUNABLE_DEFAULTS.damagePerTick)
  const fireIntervalMs = ref<number>(TUNABLE_DEFAULTS.fireIntervalMs)
  const maxHp = ref<number>(TUNABLE_DEFAULTS.maxHp)
  const meleeRange = ref<number>(TUNABLE_DEFAULTS.meleeRange)
  const projectileRange = ref<number>(TUNABLE_DEFAULTS.projectileRange)
  const sprintMultiplier = ref<number>(TUNABLE_DEFAULTS.sprintMultiplier)
  const affinityMultiplier = ref<number>(TUNABLE_DEFAULTS.affinityMultiplier)
  const staminaDrainPerSec = ref<number>(TUNABLE_DEFAULTS.staminaDrainPerSec)
  const staminaRegenPerSec = ref<number>(TUNABLE_DEFAULTS.staminaRegenPerSec)

  const enemyHp = ref<number>(TUNABLE_DEFAULTS.enemyHp)
  const enemySpeed = ref<number>(TUNABLE_DEFAULTS.enemySpeed)
  const enemyContactDamage = ref<number>(TUNABLE_DEFAULTS.enemyContactDamage)
  const enemyContactRange = ref<number>(TUNABLE_DEFAULTS.enemyContactRange)
  const waveSpawnIntervalMs = ref<number>(TUNABLE_DEFAULTS.waveSpawnIntervalMs)

  const healBasePercent = ref<number>(TUNABLE_DEFAULTS.healBasePercent)
  const healPerLevelPercent = ref<number>(TUNABLE_DEFAULTS.healPerLevelPercent)
  const healCapPercent = ref<number>(TUNABLE_DEFAULTS.healCapPercent)
  const xpBase = ref<number>(TUNABLE_DEFAULTS.xpBase)

  return {
    moveSpeed,
    damagePerTick,
    fireIntervalMs,
    maxHp,
    meleeRange,
    projectileRange,
    sprintMultiplier,
    affinityMultiplier,
    staminaDrainPerSec,
    staminaRegenPerSec,
    enemyHp,
    enemySpeed,
    enemyContactDamage,
    enemyContactRange,
    waveSpawnIntervalMs,
    healBasePercent,
    healPerLevelPercent,
    healCapPercent,
    xpBase,
  }
})
