import { Application, Container, Graphics } from 'pixi.js'
import {
  COLOR,
  LEAK_POINT,
  NEUTRAL_ZONE,
  ROAD_DRAW_POINTS,
  ROAD_WIDTH,
  SPAWN_POINT,
  TERRAIN_BLOBS,
  WAYPOINTS,
  WORLD_H,
  WORLD_W,
  type Point,
} from '../mapDef'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 2
const ROAD_CORNER_RADIUS = 40

/**
 * Desenha uma polilinha com cantos arredondados por raio fixo — o desvio
 * máximo do caminho reto real (o que os inimigos percorrem) é sempre
 * `radius`, nunca mais, diferente de uma curva suave que pode "estourar"
 * pra fora em viradas fechadas.
 */
function drawFilletPath(g: Graphics, points: Point[], radius: number): void {
  const first = points[0]
  if (!first) return
  g.moveTo(first.x, first.y)
  for (let i = 1; i < points.length - 1; i += 1) {
    const corner = points[i]
    const next = points[i + 1]
    if (!corner || !next) continue
    g.arcTo(corner.x, corner.y, next.x, next.y, radius)
  }
  const last = points[points.length - 1]
  if (last) g.lineTo(last.x, last.y)
}

export class MapScene {
  app: Application
  world: Container
  private terrainLayer: Container
  private roadLayer: Container
  private entityLayer: Container
  private zoneMarker: Graphics
  private zoom = 1
  private panX = 0
  private panY = 0
  private freeMode = false

  constructor() {
    this.app = new Application()
    this.world = new Container()
    this.terrainLayer = new Container()
    this.roadLayer = new Container()
    this.entityLayer = new Container()
    this.entityLayer.sortableChildren = true
    this.zoneMarker = new Graphics()
  }

  async init(host: HTMLElement): Promise<void> {
    await this.app.init({ background: COLOR.bg, resizeTo: host, antialias: true })
    host.appendChild(this.app.canvas)
    this.world.addChild(this.terrainLayer, this.roadLayer, this.entityLayer)
    this.app.stage.addChild(this.world)
    this.drawStatic()
  }

  private drawStatic(): void {
    for (const blob of TERRAIN_BLOBS) {
      const g = new Graphics()
      g.circle(blob.x, blob.y, blob.radius).fill({ color: blob.color, alpha: 0.14 })
      this.terrainLayer.addChild(g)
    }

    const roadPath = new Graphics()
    drawFilletPath(roadPath, ROAD_DRAW_POINTS, ROAD_CORNER_RADIUS)
    roadPath.stroke({ width: ROAD_WIDTH, color: COLOR.roadFill })
    this.roadLayer.addChild(roadPath)

    const roadDash = new Graphics()
    drawFilletPath(roadDash, ROAD_DRAW_POINTS, ROAD_CORNER_RADIUS)
    roadDash.stroke({ width: 4, color: COLOR.roadDash })
    this.roadLayer.addChild(roadDash)

    for (const waypoint of WAYPOINTS) {
      const g = new Graphics()
      g.circle(waypoint.x, waypoint.y, 8).stroke({ width: 2, color: COLOR.waypointBorder })
      this.roadLayer.addChild(g)
    }

    const spawnMarker = new Graphics()
    spawnMarker
      .circle(SPAWN_POINT.x, SPAWN_POINT.y, 16)
      .stroke({ width: 2, color: COLOR.gold })
    spawnMarker.circle(SPAWN_POINT.x, SPAWN_POINT.y, 5).fill({ color: COLOR.gold })
    this.roadLayer.addChild(spawnMarker)

    const leakMarker = new Graphics()
    leakMarker
      .circle(LEAK_POINT.x, LEAK_POINT.y, 16)
      .stroke({ width: 2, color: COLOR.danger })
    const triangleSize = 7
    leakMarker
      .poly([
        LEAK_POINT.x,
        LEAK_POINT.y - triangleSize,
        LEAK_POINT.x - triangleSize,
        LEAK_POINT.y + triangleSize,
        LEAK_POINT.x + triangleSize,
        LEAK_POINT.y + triangleSize,
      ])
      .fill({ color: COLOR.danger })
    this.roadLayer.addChild(leakMarker)

    this.zoneMarker
      .circle(NEUTRAL_ZONE.x, NEUTRAL_ZONE.y, NEUTRAL_ZONE.radius)
      .stroke({ width: 2, color: COLOR.player, alpha: 0.35 })
    this.terrainLayer.addChild(this.zoneMarker)
  }

  setNeutralZoneVisible(visible: boolean): void {
    this.zoneMarker.visible = visible
  }

  private zoomScale(): number {
    const fitScale = Math.min(this.app.renderer.width / WORLD_W, this.app.renderer.height / WORLD_H)
    return fitScale * this.zoom
  }

  fitToViewport(): void {
    if (this.freeMode) {
      const s = this.zoomScale()
      this.world.scale.set(s)
      this.world.position.set(this.panX, this.panY)
      return
    }
    this.follow(NEUTRAL_ZONE.x, NEUTRAL_ZONE.y)
  }

  follow(targetX: number, targetY: number): void {
    const s = this.zoomScale()
    const vw = this.app.renderer.width
    const vh = this.app.renderer.height
    this.world.scale.set(s)
    this.world.position.set(vw / 2 - targetX * s + this.panX, vh / 2 - targetY * s + this.panY)
  }

  panBy(dx: number, dy: number): void {
    this.panX += dx
    this.panY += dy
  }

  resetPan(): void {
    this.panX = 0
    this.panY = 0
  }

  setZoom(z: number): void {
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))
  }

  getZoom(): number {
    return this.zoom
  }

  setFreeMode(v: boolean): void {
    this.freeMode = v
    if (!v) {
      this.resetPan()
    }
  }

  isFreeMode(): boolean {
    return this.freeMode
  }

  addEntity(displayObject: Container): void {
    this.entityLayer.addChild(displayObject)
  }

  removeEntity(displayObject: Container): void {
    this.entityLayer.removeChild(displayObject)
  }

  destroy(): void {
    this.app.destroy(true, true)
  }
}
