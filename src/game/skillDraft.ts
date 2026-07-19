import type { ArchetypeId, DamageType, LevelDef, Role, SkillNode, WeaponRange } from './skillTree'
import { SKILL_NODES } from './skillTree'

export interface BuildState {
  weaponRange: WeaponRange | null
  damageType: DamageType | null
  role: Role | null
  archetypeId: ArchetypeId | null
  affinityArchetypeId: ArchetypeId | null
}

const RARITY_WEIGHT: Record<SkillNode['rarity'], number> = { comum: 10, raro: 4, epico: 1 }
const AFFINITY_WEIGHT_MULTIPLIER = 1.5

function tierForLevel(level: number): 1 | 2 | 3 | 4 {
  if (level <= 5) return 1
  if (level <= 9) return 2
  if (level <= 14) return 3
  return 4
}

function poolForLevel(levelDef: LevelDef, build: BuildState): SkillNode[] {
  if (levelDef.kind === 'infinite-draft') {
    return SKILL_NODES.filter((node) => node.tier >= 1)
  }

  const tier = tierForLevel(levelDef.level)

  return SKILL_NODES.filter((node) => {
    if (node.tier !== tier) return false
    if (node.axes.range && build.weaponRange && node.axes.range !== build.weaponRange) return false
    if (node.axes.damage && build.damageType && node.axes.damage !== build.damageType) return false
    if (node.archetypeId !== 'any' && node.archetypeId !== build.archetypeId) return false
    return true
  })
}

function weightFor(node: SkillNode, build: BuildState): number {
  const base = RARITY_WEIGHT[node.rarity]
  const isCurrentPath = node.archetypeId === build.archetypeId || node.archetypeId === 'any'
  const isAffinity = node.archetypeId === build.affinityArchetypeId
  return base * (isCurrentPath || isAffinity ? AFFINITY_WEIGHT_MULTIPLIER : 1)
}

function weightedSampleWithoutReplacement(pool: SkillNode[], weights: number[], count: number): SkillNode[] {
  const remainingPool = [...pool]
  const remainingWeights = [...weights]
  const picked: SkillNode[] = []

  while (picked.length < count && remainingPool.length > 0) {
    const totalWeight = remainingWeights.reduce((sum, w) => sum + w, 0)
    let roll = Math.random() * totalWeight
    let index = 0
    for (; index < remainingWeights.length; index += 1) {
      roll -= remainingWeights[index] ?? 0
      if (roll <= 0) break
    }
    const clampedIndex = Math.min(index, remainingPool.length - 1)
    const [node] = remainingPool.splice(clampedIndex, 1)
    remainingWeights.splice(clampedIndex, 1)
    if (node) picked.push(node)
  }

  return picked
}

export function draftCards(levelDef: LevelDef, build: BuildState): SkillNode[] {
  const count = levelDef.cardCount ?? 3
  const pool = poolForLevel(levelDef, build)
  const weights = pool.map((node) => weightFor(node, build))
  return weightedSampleWithoutReplacement(pool, weights, count)
}
