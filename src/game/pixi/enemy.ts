import { Graphics } from 'pixi.js'
import { ENEMY_COLORS, WAYPOINTS } from '../mapDef'

const ENEMY_RADIUS = 20
const WAYPOINT_ARRIVAL_DISTANCE = 4

export interface Enemy {
  root: Graphics
  hp: number
  maxHp: number
  waypointIndex: number
  x: number
  y: number
  alive: boolean
}

const createEnemy = (): Enemy => {
  const root = new Graphics()
  return {
    root,
    hp: 0,
    maxHp: 0,
    waypointIndex: 0,
    x: WAYPOINTS[0]?.x ?? 0,
    y: WAYPOINTS[0]?.y ?? 0,
    alive: false,
  }
}

const paintEnemy = (enemy: Enemy, color: number): void => {
  enemy.root.clear()
  enemy.root.circle(0, 0, ENEMY_RADIUS).stroke({ width: 3, color })
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
    enemy.root.position.set(enemy.x, enemy.y)
    enemy.root.visible = true
    const color = ENEMY_COLORS[this.spawnCount % ENEMY_COLORS.length] ?? ENEMY_COLORS[0] ?? 0xffffff
    paintEnemy(enemy, color)
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

  update(deltaMs: number, onLeak: (enemy: Enemy) => void, speed: number): void {
    const toDespawn: Enemy[] = []

    for (const enemy of this.active) {
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
