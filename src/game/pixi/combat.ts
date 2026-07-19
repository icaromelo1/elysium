import type { FireMode } from '../../stores/useGameStore'
import type { Enemy } from './enemy'
import type { PlayerAvatar } from './player'

const DIRECTION_THRESHOLD = 0.5

export interface CombatContext {
  player: PlayerAvatar
  enemies: Enemy[]
  fireMode: FireMode
  range: number
  damagePerTick: number
  fireIntervalMs: number
  mouseWorldPos: { x: number; y: number } | null
}

const distanceTo = (fromX: number, fromY: number, toX: number, toY: number): number => {
  const dx = toX - fromX
  const dy = toY - fromY
  return Math.sqrt(dx * dx + dy * dy)
}

const closestEnemyInRange = (ctx: CombatContext): Enemy | null => {
  let closest: Enemy | null = null
  let closestDistance = Infinity

  for (const enemy of ctx.enemies) {
    const distance = distanceTo(ctx.player.x, ctx.player.y, enemy.x, enemy.y)
    if (distance <= ctx.range && distance < closestDistance) {
      closest = enemy
      closestDistance = distance
    }
  }

  return closest
}

const closestEnemyInDirection = (
  ctx: CombatContext,
  directionX: number,
  directionY: number,
): Enemy | null => {
  const directionMagnitude = Math.sqrt(directionX * directionX + directionY * directionY)
  if (directionMagnitude === 0) {
    return null
  }
  const normalizedDirX = directionX / directionMagnitude
  const normalizedDirY = directionY / directionMagnitude

  let closest: Enemy | null = null
  let closestDistance = Infinity

  for (const enemy of ctx.enemies) {
    const toEnemyX = enemy.x - ctx.player.x
    const toEnemyY = enemy.y - ctx.player.y
    const distance = Math.sqrt(toEnemyX * toEnemyX + toEnemyY * toEnemyY)
    if (distance > ctx.range || distance === 0) {
      continue
    }

    const dot = (toEnemyX / distance) * normalizedDirX + (toEnemyY / distance) * normalizedDirY
    if (dot > DIRECTION_THRESHOLD && distance < closestDistance) {
      closest = enemy
      closestDistance = distance
    }
  }

  return closest
}

export function resolveExtraTargets(ctx: CombatContext, primary: Enemy, count: number): Enemy[] {
  if (count <= 0) return []

  const candidates = ctx.enemies
    .filter((enemy) => enemy !== primary)
    .map((enemy) => ({ enemy, distance: distanceTo(ctx.player.x, ctx.player.y, enemy.x, enemy.y) }))
    .filter((entry) => entry.distance <= ctx.range)
    .sort((a, b) => a.distance - b.distance)

  return candidates.slice(0, count).map((entry) => entry.enemy)
}

export function resolveAttackTarget(ctx: CombatContext): Enemy | null {
  if (ctx.fireMode === 'auto') {
    return closestEnemyInRange(ctx)
  }

  if (ctx.fireMode === 'manual-mov') {
    return closestEnemyInDirection(ctx, ctx.player.facing.x, ctx.player.facing.y)
  }

  if (ctx.fireMode === 'manual-mouse') {
    if (!ctx.mouseWorldPos) {
      return null
    }
    return closestEnemyInDirection(
      ctx,
      ctx.mouseWorldPos.x - ctx.player.x,
      ctx.mouseWorldPos.y - ctx.player.y,
    )
  }

  return null
}

export class CombatTicker {
  private accumulatorMs = 0

  update(
    deltaMs: number,
    ctx: CombatContext,
    onHit: (target: Enemy, damage: number, isPrimary: boolean) => void,
    pierceExtraTargets = 0,
    onMiss?: () => void,
  ): void {
    this.accumulatorMs += deltaMs
    while (this.accumulatorMs >= ctx.fireIntervalMs) {
      this.accumulatorMs -= ctx.fireIntervalMs
      const target = resolveAttackTarget(ctx)
      if (target) {
        onHit(target, ctx.damagePerTick, true)
        for (const extra of resolveExtraTargets(ctx, target, pierceExtraTargets)) {
          onHit(extra, ctx.damagePerTick, false)
        }
      } else {
        onMiss?.()
      }
    }
  }
}
