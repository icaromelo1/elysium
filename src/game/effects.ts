export type UltimateGrant = 'aoe-melee' | 'aoe-ranged' | 'uninterruptible' | 'damage-boost' | 'lifesteal-boost'

export type EffectSpec =
  | { kind: 'stat-mod'; stat: 'damage' | 'maxHp' | 'moveSpeed' | 'attackSpeed' | 'range' | 'maxStamina' | 'staminaRegen'; percent: number }
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

export interface EquippedSkill {
  id: string
  effect: EffectSpec
}

interface TimedBuff {
  stat: 'damage' | 'moveSpeed'
  percent: number
  remainingMs: number
}

export interface PlayerEffectsState {
  nodes: EquippedSkill[]
  comboStacks: number
  dashCooldownRemainingMs: number
  buffs: TimedBuff[]
  summonRemainingMs: number
  summonDamagePerTick: number
  summonNextTickMs: number
  ultimateRemainingMs: number
  ultimateGrants: UltimateGrant[]
  ultimateCooldownRemainingMs: number
  healNextTickMs: number
}

const STAT_MOD_STATS = ['damage', 'maxHp', 'moveSpeed', 'attackSpeed', 'range', 'maxStamina', 'staminaRegen'] as const
type StatModStat = (typeof STAT_MOD_STATS)[number]

const SUMMON_TICK_MS = 800
const ULTIMATE_COOLDOWN_MS = 15000

export function createEffectsState(): PlayerEffectsState {
  return {
    nodes: [],
    comboStacks: 0,
    dashCooldownRemainingMs: 0,
    buffs: [],
    summonRemainingMs: 0,
    summonDamagePerTick: 0,
    summonNextTickMs: 0,
    ultimateRemainingMs: 0,
    ultimateGrants: [],
    ultimateCooldownRemainingMs: 0,
    healNextTickMs: 0,
  }
}

export function equipNode(state: PlayerEffectsState, id: string, effect: EffectSpec): void {
  state.nodes.push({ id, effect })
}

export function statMultiplier(state: PlayerEffectsState, stat: StatModStat): number {
  let percent = 0
  for (const node of state.nodes) {
    if (node.effect.kind === 'stat-mod' && node.effect.stat === stat) {
      percent += node.effect.percent
    }
  }
  for (const buff of state.buffs) {
    if (buff.stat === stat) percent += buff.percent
  }
  if (state.ultimateRemainingMs > 0 && stat === 'damage' && state.ultimateGrants.includes('damage-boost')) {
    percent += 30
  }
  return 1 + percent / 100
}

export function lifestealMultiplier(state: PlayerEffectsState): number {
  let percent = 0
  for (const node of state.nodes) {
    if (node.effect.kind === 'on-hit-lifesteal') percent += node.effect.percent
  }
  if (state.ultimateRemainingMs > 0 && state.ultimateGrants.includes('lifesteal-boost')) {
    percent += 20
  }
  return percent / 100
}

export function pierceExtraTargets(state: PlayerEffectsState): number {
  let extra = 0
  for (const node of state.nodes) {
    if (node.effect.kind === 'pierce') extra += node.effect.extraTargets
  }
  return extra
}

export function auraShieldPercent(state: PlayerEffectsState): number {
  let percent = 0
  for (const node of state.nodes) {
    if (node.effect.kind === 'aura-shield') percent += node.effect.absorbPercent
  }
  return Math.min(80, percent)
}

export interface OnHitOutcome {
  extraHits: number
  lifestealHeal: number
  stunDurationMs: number | null
  shred: { percent: number; durationMs: number } | null
  dot: { damagePerTick: number; durationMs: number; tickMs: number } | null
  burst: { radius: number; damagePercent: number } | null
}

export function resolveOnHit(state: PlayerEffectsState, damage: number, missed: boolean): OnHitOutcome {
  const outcome: OnHitOutcome = { extraHits: 0, lifestealHeal: 0, stunDurationMs: null, shred: null, dot: null, burst: null }

  for (const node of state.nodes) {
    const effect = node.effect
    if (effect.kind === 'on-hit-multistrike' && Math.random() * 100 < effect.chancePercent) {
      outcome.extraHits += 1
    } else if (effect.kind === 'on-hit-lifesteal') {
      outcome.lifestealHeal += damage * (effect.percent / 100)
    } else if (effect.kind === 'on-hit-stun' && Math.random() * 100 < effect.chancePercent) {
      outcome.stunDurationMs = Math.max(outcome.stunDurationMs ?? 0, effect.durationMs)
    } else if (effect.kind === 'on-hit-shred') {
      outcome.shred = { percent: effect.percent, durationMs: effect.durationMs }
    } else if (effect.kind === 'on-hit-dot') {
      outcome.dot = { damagePerTick: damage * (effect.damagePercent / 100), durationMs: effect.durationMs, tickMs: effect.tickMs }
    } else if (effect.kind === 'combo-escalation') {
      if (missed && effect.resetOnMiss) {
        state.comboStacks = 0
      } else if (!missed) {
        state.comboStacks = Math.min(effect.maxStacks, state.comboStacks + 1)
      }
    } else if (effect.kind === 'combo-burst' && !missed) {
      state.comboStacks += 1
      if (state.comboStacks >= effect.stacksRequired) {
        state.comboStacks = 0
        outcome.burst = { radius: effect.radius, damagePercent: effect.damagePercent }
      }
    }
  }

  return outcome
}

export function comboDamageBonusPercent(state: PlayerEffectsState): number {
  for (const node of state.nodes) {
    if (node.effect.kind === 'combo-escalation') {
      return state.comboStacks * node.effect.percentPerStack
    }
  }
  return 0
}

export function resetCombo(state: PlayerEffectsState): void {
  for (const node of state.nodes) {
    if (node.effect.kind === 'combo-escalation' && node.effect.resetOnMiss) {
      state.comboStacks = 0
      return
    }
  }
}

export function registerKill(state: PlayerEffectsState): void {
  for (const node of state.nodes) {
    if (node.effect.kind === 'on-kill-buff') {
      state.buffs.push({ stat: node.effect.stat, percent: node.effect.percent, remainingMs: node.effect.durationMs })
    }
  }
}

export function tryDash(state: PlayerEffectsState): { range: number } | null {
  if (state.dashCooldownRemainingMs > 0) return null
  for (const node of state.nodes) {
    if (node.effect.kind === 'dash') {
      state.dashCooldownRemainingMs = node.effect.cooldownMs
      return { range: node.effect.range }
    }
  }
  return null
}

export function activateUltimateIfReady(state: PlayerEffectsState, capstoneEffect: EffectSpec | null): void {
  if (!capstoneEffect || capstoneEffect.kind !== 'ultimate-window') return
  if (state.ultimateCooldownRemainingMs > 0 || state.ultimateRemainingMs > 0) return
  state.ultimateRemainingMs = capstoneEffect.durationMs
  state.ultimateGrants = capstoneEffect.grants
  state.ultimateCooldownRemainingMs = ULTIMATE_COOLDOWN_MS
}

export interface EffectsTickResult {
  summonDamage: number | null
  selfHealPercent: number | null
}

export function tick(state: PlayerEffectsState, deltaMs: number): EffectsTickResult {
  const result: EffectsTickResult = { summonDamage: null, selfHealPercent: null }

  if (state.dashCooldownRemainingMs > 0) {
    state.dashCooldownRemainingMs = Math.max(0, state.dashCooldownRemainingMs - deltaMs)
  }
  if (state.ultimateCooldownRemainingMs > 0) {
    state.ultimateCooldownRemainingMs = Math.max(0, state.ultimateCooldownRemainingMs - deltaMs)
  }
  if (state.ultimateRemainingMs > 0) {
    state.ultimateRemainingMs = Math.max(0, state.ultimateRemainingMs - deltaMs)
  }

  state.buffs = state.buffs.filter((buff) => {
    buff.remainingMs -= deltaMs
    return buff.remainingMs > 0
  })

  if (state.summonRemainingMs <= 0) {
    for (const node of state.nodes) {
      if (node.effect.kind === 'summon-companion' && state.summonRemainingMs <= 0) {
        state.summonRemainingMs = node.effect.durationMs
        state.summonDamagePerTick = node.effect.damagePerTick
        state.summonNextTickMs = SUMMON_TICK_MS
      }
    }
  }
  if (state.summonRemainingMs > 0) {
    state.summonRemainingMs = Math.max(0, state.summonRemainingMs - deltaMs)
    state.summonNextTickMs -= deltaMs
    if (state.summonNextTickMs <= 0) {
      state.summonNextTickMs += SUMMON_TICK_MS
      result.summonDamage = state.summonDamagePerTick
    }
  }

  const healNode = state.nodes.find((node) => node.effect.kind === 'periodic-heal')
  if (healNode && healNode.effect.kind === 'periodic-heal') {
    if (state.healNextTickMs <= 0) state.healNextTickMs = healNode.effect.intervalMs
    state.healNextTickMs -= deltaMs
    if (state.healNextTickMs <= 0) {
      state.healNextTickMs += healNode.effect.intervalMs
      result.selfHealPercent = healNode.effect.percent
    }
  }

  return result
}
