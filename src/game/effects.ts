export type UltimateGrant = 'aoe-melee' | 'aoe-ranged' | 'uninterruptible' | 'damage-boost' | 'lifesteal-boost'

export type EffectSpec =
  | { kind: 'stat-mod'; stat: 'damage' | 'maxHp' | 'moveSpeed' | 'attackSpeed' | 'range'; percent: number }
  | { kind: 'on-hit-dot'; damagePercent: number; durationMs: number; tickMs: number }
  | { kind: 'on-hit-stun'; durationMs: number; chancePercent: number }
  | { kind: 'on-hit-lifesteal'; percent: number }
  | { kind: 'on-hit-multistrike'; chancePercent: number }
  | { kind: 'on-hit-shred'; percent: number; durationMs: number }
  | { kind: 'pierce'; extraTargets: number }
  | { kind: 'combo-escalation'; percentPerStack: number; maxStacks: number; resetOnMiss: boolean }
  | { kind: 'combo-burst'; stacksRequired: number; radius: number; damagePercent: number }
  | { kind: 'on-kill-buff'; stat: 'damage' | 'moveSpeed'; percent: number; durationMs: number }
  | { kind: 'dash'; range: number; cooldownMs: number }
  | { kind: 'aura-shield'; absorbPercent: number; radius: number }
  | { kind: 'periodic-heal'; percent: number; radius: number; intervalMs: number }
  | { kind: 'summon-companion'; damagePerTick: number; durationMs: number }
  | { kind: 'ultimate-window'; durationMs: number; grants: UltimateGrant[] }
