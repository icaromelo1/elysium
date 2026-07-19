import { Container, Graphics } from 'pixi.js'
import { COLOR, NEUTRAL_ZONE, ROAD_WIDTH, WORLD_H, WORLD_W, roadYAtX, sideOfRoad, type ZoneSide } from '../mapDef'

const PLAYER_RADIUS = 32
const ZONE_CLAMP_MARGIN = ROAD_WIDTH / 2 + PLAYER_RADIUS

export type MovementConstraint =
  | { kind: 'neutral' }
  | { kind: 'zone'; side: ZoneSide; canCross: boolean }

export class PlayerAvatar {
  root: Container
  x: number
  y: number
  facing: { x: number; y: number }
  private rangeRing: Graphics
  private currentRange = 0

  constructor(startX: number, startY: number) {
    this.root = new Container()
    const body = new Graphics()
    body.circle(0, 0, PLAYER_RADIUS).fill({ color: COLOR.player })
    this.root.addChild(body)
    this.rangeRing = new Graphics()
    this.root.addChild(this.rangeRing)
    this.x = startX
    this.y = startY
    this.facing = { x: 0, y: 1 }
    this.root.position.set(this.x, this.y)
  }

  setRange(range: number): void {
    if (range === this.currentRange) return
    this.currentRange = range
    this.rangeRing.clear()
    this.rangeRing.circle(0, 0, range).stroke({ width: 2, color: COLOR.ink, alpha: 0.25 })
  }

  move(dx: number, dy: number, constraint: MovementConstraint): void {
    let nextX = this.x + dx
    let nextY = this.y + dy

    if (constraint.kind === 'neutral') {
      const offsetX = nextX - NEUTRAL_ZONE.x
      const offsetY = nextY - NEUTRAL_ZONE.y
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
      if (distance > NEUTRAL_ZONE.radius) {
        const scale = NEUTRAL_ZONE.radius / distance
        nextX = NEUTRAL_ZONE.x + offsetX * scale
        nextY = NEUTRAL_ZONE.y + offsetY * scale
      }
    } else if (!constraint.canCross && sideOfRoad(nextX, nextY) !== constraint.side) {
      const roadY = roadYAtX(nextX)
      nextY = constraint.side === 'norte' ? Math.min(nextY, roadY - ZONE_CLAMP_MARGIN) : Math.max(nextY, roadY + ZONE_CLAMP_MARGIN)
    }

    nextX = Math.min(Math.max(nextX, PLAYER_RADIUS), WORLD_W - PLAYER_RADIUS)
    nextY = Math.min(Math.max(nextY, PLAYER_RADIUS), WORLD_H - PLAYER_RADIUS)

    this.x = nextX
    this.y = nextY

    if (dx !== 0 || dy !== 0) {
      const magnitude = Math.sqrt(dx * dx + dy * dy)
      this.facing = { x: dx / magnitude, y: dy / magnitude }
    }

    this.root.position.set(this.x, this.y)
  }

  destroy(): void {
    this.root.destroy()
  }
}
