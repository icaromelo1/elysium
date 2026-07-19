import { Container, Graphics } from 'pixi.js'
import { COLOR, ENEMY_COLORS, WAYPOINTS } from '../mapDef'

const ENEMY_RADIUS = 20
const WAYPOINT_ARRIVAL_DISTANCE = 4
const HP_BAR_WIDTH = 36
const HP_BAR_HEIGHT = 5
const HP_BAR_OFFSET_Y = -ENEMY_RADIUS - 12
const FLASH_DURATION_MS = 150

export interface Enemy {
  root: Container
  body: Graphics
  hpBarBg: Graphics
  hpBarFill: Graphics
  flashOverlay: Graphics
  hp: number
  maxHp: number
  waypointIndex: number
  x: number
  y: number
  alive: boolean
  flashElapsedMs: number
  stunRemainingMs: number
  shredRemainingMs: number
  shredPercent: number
  dotRemainingMs: number
  dotTickMs: number
  dotNextTickMs: number
  dotDamagePerTick: number
}

const createEnemy = (): Enemy => {
  const root = new Container()

  const hpBarBg = new Graphics()
  hpBarBg.rect(-HP_BAR_WIDTH / 2, HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT).fill({ color: COLOR.roadFill })
  hpBarBg.visible = false
  root.addChild(hpBarBg)

  const hpBarFill = new Graphics()
  hpBarFill.visible = false
  root.addChild(hpBarFill)

  const body = new Graphics()
  root.addChild(body)

  const flashOverlay = new Graphics()
  flashOverlay.circle(0, 0, ENEMY_RADIUS).fill({ color: COLOR.ink })
  flashOverlay.alpha = 0
  root.addChild(flashOverlay)

  return {
    root,
    body,
    hpBarBg,
    hpBarFill,
    flashOverlay,
    hp: 0,
    maxHp: 0,
    waypointIndex: 0,
    x: WAYPOINTS[0]?.x ?? 0,
    y: WAYPOINTS[0]?.y ?? 0,
    alive: false,
    flashElapsedMs: 0,
    stunRemainingMs: 0,
    shredRemainingMs: 0,
    shredPercent: 0,
    dotRemainingMs: 0,
    dotTickMs: 0,
    dotNextTickMs: 0,
    dotDamagePerTick: 0,
  }
}

const paintEnemy = (enemy: Enemy, color: number): void => {
  enemy.body.clear()
  enemy.body.circle(0, 0, ENEMY_RADIUS).stroke({ width: 3, color })
}

const paintHpBar = (enemy: Enemy): void => {
  const ratio = enemy.maxHp > 0 ? Math.max(0, enemy.hp / enemy.maxHp) : 0
  const visible = ratio < 1
  enemy.hpBarBg.visible = visible
  enemy.hpBarFill.visible = visible
  enemy.hpBarFill.clear()
  if (visible) {
    enemy.hpBarFill
      .rect(-HP_BAR_WIDTH / 2, HP_BAR_OFFSET_Y, HP_BAR_WIDTH * ratio, HP_BAR_HEIGHT)
      .fill({ color: COLOR.danger })
  }
}

export class EnemyPool {
  private available: Enemy[] = []
  private active: Enemy[] = []
  private spawnCount = 0

  spawn(hp: number): Enemy {
    const enemy = this.available.pop() ?? createEnemy()
    const start = WAYPOINTS[0]
    enemy.hp = hp
    enemy.maxHp = hp
    enemy.waypointIndex = 0
    enemy.x = start?.x ?? 0
    enemy.y = start?.y ?? 0
    enemy.alive = true
    enemy.flashElapsedMs = 0
    enemy.flashOverlay.alpha = 0
    enemy.stunRemainingMs = 0
    enemy.shredRemainingMs = 0
    enemy.shredPercent = 0
    enemy.dotRemainingMs = 0
    enemy.dotTickMs = 0
    enemy.dotNextTickMs = 0
    enemy.dotDamagePerTick = 0
    enemy.root.position.set(enemy.x, enemy.y)
    enemy.root.visible = true
    const color = ENEMY_COLORS[this.spawnCount % ENEMY_COLORS.length] ?? ENEMY_COLORS[0] ?? 0xffffff
    paintEnemy(enemy, color)
    paintHpBar(enemy)
    this.spawnCount += 1
    this.active.push(enemy)
    return enemy
  }

  despawn(enemy: Enemy): void {
    enemy.alive = false
    enemy.root.visible = false
    const index = this.active.indexOf(enemy)
    if (index !== -1) {
      this.active.splice(index, 1)
    }
    this.available.push(enemy)
  }

  applyDamage(enemy: Enemy, amount: number): void {
    const shredMultiplier = enemy.shredRemainingMs > 0 ? 1 + enemy.shredPercent / 100 : 1
    enemy.hp -= amount * shredMultiplier
    paintHpBar(enemy)
    enemy.flashElapsedMs = FLASH_DURATION_MS
    enemy.flashOverlay.alpha = 1
  }

  applyShred(enemy: Enemy, percent: number, durationMs: number): void {
    enemy.shredPercent = percent
    enemy.shredRemainingMs = durationMs
  }

  applyStun(enemy: Enemy, durationMs: number): void {
    enemy.stunRemainingMs = Math.max(enemy.stunRemainingMs, durationMs)
  }

  applyDot(enemy: Enemy, damagePerTick: number, durationMs: number, tickMs: number): void {
    enemy.dotDamagePerTick = damagePerTick
    enemy.dotRemainingMs = durationMs
    enemy.dotTickMs = tickMs
    enemy.dotNextTickMs = tickMs
  }

  update(deltaMs: number, onLeak: (enemy: Enemy) => void, speed: number, onDotDamage?: (enemy: Enemy, damage: number) => void): void {
    const toDespawn: Enemy[] = []

    for (const enemy of this.active) {
      if (enemy.flashElapsedMs > 0) {
        enemy.flashElapsedMs = Math.max(0, enemy.flashElapsedMs - deltaMs)
        enemy.flashOverlay.alpha = enemy.flashElapsedMs / FLASH_DURATION_MS
      }

      if (enemy.shredRemainingMs > 0) {
        enemy.shredRemainingMs = Math.max(0, enemy.shredRemainingMs - deltaMs)
      }

      if (enemy.dotRemainingMs > 0) {
        enemy.dotRemainingMs = Math.max(0, enemy.dotRemainingMs - deltaMs)
        enemy.dotNextTickMs -= deltaMs
        if (enemy.dotNextTickMs <= 0) {
          enemy.dotNextTickMs += enemy.dotTickMs
          onDotDamage?.(enemy, enemy.dotDamagePerTick)
        }
      }

      if (enemy.stunRemainingMs > 0) {
        enemy.stunRemainingMs = Math.max(0, enemy.stunRemainingMs - deltaMs)
        continue
      }

      const target = WAYPOINTS[enemy.waypointIndex]
      if (!target) {
        toDespawn.push(enemy)
        continue
      }

      const dx = target.x - enemy.x
      const dy = target.y - enemy.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= WAYPOINT_ARRIVAL_DISTANCE) {
        enemy.waypointIndex += 1
        if (enemy.waypointIndex >= WAYPOINTS.length) {
          onLeak(enemy)
          toDespawn.push(enemy)
          continue
        }
      } else {
        const step = (speed * deltaMs) / 1000
        const ratio = step / distance
        enemy.x += dx * ratio
        enemy.y += dy * ratio
        enemy.root.position.set(enemy.x, enemy.y)
      }
    }

    for (const enemy of toDespawn) {
      this.despawn(enemy)
    }
  }

  get activeEnemies(): Enemy[] {
    return this.active
  }
}
