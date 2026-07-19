import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTunablesStore = defineStore('tunables', () => {
  const moveSpeed = ref(220)
  const damagePerTick = ref(10)
  const fireIntervalMs = ref(1000)
  const maxHp = ref(100)
  const meleeRange = ref(90)
  const projectileRange = ref(180)
  const sprintMultiplier = ref(2)
  const affinityMultiplier = ref(1.15)
  const staminaDrainPerSec = ref(35)
  const staminaRegenPerSec = ref(20)

  const enemyHp = ref(40)
  const enemySpeed = ref(70)
  const enemyContactDamage = ref(8)
  const enemyContactRange = ref(40)
  const waveSpawnIntervalMs = ref(1800)

  const healBasePercent = ref(8)
  const healPerLevelPercent = ref(1)
  const healCapPercent = ref(50)
  const xpBase = ref(10)

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
