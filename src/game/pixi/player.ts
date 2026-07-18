import { Container, Graphics } from 'pixi.js'
import { COLOR, PLAYER_ZONE } from '../mapDef'

const PLAYER_RADIUS = 32

export class PlayerAvatar {
  root: Container
  x: number
  y: number
  facing: { x: number; y: number }

  constructor(startX: number, startY: number) {
    this.root = new Container()
    const body = new Graphics()
    body.circle(0, 0, PLAYER_RADIUS).fill({ color: COLOR.player })
    this.root.addChild(body)
    this.x = startX
    this.y = startY
    this.facing = { x: 0, y: 1 }
    this.root.position.set(this.x, this.y)
  }

  move(dx: number, dy: number): void {
    let nextX = this.x + dx
    let nextY = this.y + dy

    const offsetX = nextX - PLAYER_ZONE.x
    const offsetY = nextY - PLAYER_ZONE.y
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    if (distance > PLAYER_ZONE.radius) {
      const scale = PLAYER_ZONE.radius / distance
      nextX = PLAYER_ZONE.x + offsetX * scale
      nextY = PLAYER_ZONE.y + offsetY * scale
    }

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
