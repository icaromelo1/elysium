import { Application, Container, Graphics, Sprite, type Texture } from 'pixi.js'
import {
  COLOR,
  LEAK_POINT,
  NEUTRAL_ZONE,
  PALETTE,
  ROAD_DRAW_POINTS,
  ROAD_WIDTH,
  SPAWN_POINT,
  WAYPOINTS,
  WORLD_H,
  WORLD_W,
} from '../mapDef'
import { TILE_SIZE, buildTileGrid, cellToWorld, type TileGrid, type TileType } from '../tilemap'
import { MAP_PROPS, type PropType } from '../props'
import { buildPathStamps } from './pathGeometry'
import { loadTextureOrFallback } from './textures'
import {
  CYCLE_STAGE_DURATION_MS,
  LIGHTING_PRESETS,
  MAP_TIME_OF_DAY,
  STAGE_ORDER,
  computeLightingState,
  type LightingState,
  type TimeOfDay,
} from '../lighting'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 2
const ROAD_CORNER_RADIUS = 40
const PATH_STAMP_SPACING = 28
const SHADOW_UPDATE_INTERVAL_MS = 500

const MAP_ID = 'grecia-romana'

/**
 * A Fase 3 (horário estático por mapa) e a Fase 4 (ciclo dinâmico) coexistem:
 * o ciclo dinâmico começa exatamente no estágio configurado pro mapa, em vez de
 * sempre começar em "amanhecer" — assim o horário padrão do mapa nunca é
 * imediatamente sobrescrito assim que o primeiro tick do ciclo dinâmico chega.
 */
const LIGHTING_START_OFFSET_MS =
  Math.max(0, STAGE_ORDER.indexOf(MAP_TIME_OF_DAY[MAP_ID] ?? 'amanhecer')) * CYCLE_STAGE_DURATION_MS

const TILE_ASSET_URLS: Record<TileType, string> = {
  grama: '/tiles/grama.png',
  agua: '/tiles/agua.png',
}

const PATH_ASSET_URL = '/tiles/caminho-reto.png'

const PROP_ASSET_URLS: Record<PropType, string> = {
  'coluna-dorica': '/props/coluna-dorica.png',
  'coluna-quebrada': '/props/coluna-quebrada.png',
  estatua: '/props/estatua.png',
  oliveira: '/props/oliveira.png',
  cipreste: '/props/cipreste.png',
  anfora: '/props/anfora.png',
}

const PROP_FALLBACK_SHAPE: Record<PropType, { w: number; h: number; color: number }> = {
  'coluna-dorica': { w: 20, h: 56, color: PALETTE.marmore },
  'coluna-quebrada': { w: 22, h: 34, color: PALETTE.marmore },
  estatua: { w: 26, h: 60, color: PALETTE.marmore },
  oliveira: { w: 44, h: 44, color: PALETTE.oliveira },
  cipreste: { w: 24, h: 58, color: 0x3f5e30 },
  anfora: { w: 18, h: 26, color: PALETTE.terracota },
}

export class MapScene {
  app: Application
  world: Container
  private tileLayer: Container
  private tileShadingLayer: Graphics
  private pathLayer: Container
  private propShadowLayer: Graphics
  private propsLayer: Container
  private markerLayer: Container
  private zoneMarker: Graphics
  private entityLayer: Container
  private lightingOverlay: Graphics
  private tileGrid: TileGrid | null = null
  private lastShadowSurvivalMs = -Infinity
  private zoom = 1
  private panX = 0
  private panY = 0
  private freeMode = false

  constructor() {
    this.app = new Application()
    this.world = new Container()
    this.tileLayer = new Container()
    this.tileShadingLayer = new Graphics()
    this.pathLayer = new Container()
    this.propShadowLayer = new Graphics()
    this.propsLayer = new Container()
    this.markerLayer = new Container()
    this.zoneMarker = new Graphics()
    this.entityLayer = new Container()
    this.entityLayer.sortableChildren = true
    this.lightingOverlay = new Graphics()
  }

  async init(host: HTMLElement): Promise<void> {
    await this.app.init({ background: COLOR.bg, resizeTo: host, antialias: true })
    host.appendChild(this.app.canvas)
    this.world.addChild(
      this.tileLayer,
      this.tileShadingLayer,
      this.pathLayer,
      this.propShadowLayer,
      this.propsLayer,
      this.markerLayer,
      this.zoneMarker,
      this.entityLayer,
    )
    this.app.stage.addChild(this.world)
    this.app.stage.addChild(this.lightingOverlay)
    await this.drawStatic()
  }

  private async drawStatic(): Promise<void> {
    await this.createTileLayer()
    await this.createPathLayer()
    await this.createPropsLayer()
    this.createMarkers()
  }

  private async createTileLayer(): Promise<void> {
    const grid = buildTileGrid()
    this.tileGrid = grid

    const grassTexture = await loadTextureOrFallback(this.app.renderer, TILE_ASSET_URLS.grama, (g) => {
      g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({ color: PALETTE.oliveira })
    })
    const waterTexture = await loadTextureOrFallback(this.app.renderer, TILE_ASSET_URLS.agua, (g) => {
      g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({ color: PALETTE.egeu })
    })
    const textureByType: Record<TileType, Texture> = { grama: grassTexture, agua: waterTexture }

    for (let row = 0; row < grid.rows; row += 1) {
      const gridRow = grid.cells[row]
      if (!gridRow) continue
      for (let col = 0; col < grid.cols; col += 1) {
        const type = gridRow[col]
        if (!type) continue
        const { x, y } = cellToWorld(col, row)
        const sprite = new Sprite(textureByType[type])
        sprite.anchor.set(0.5)
        sprite.width = TILE_SIZE
        sprite.height = TILE_SIZE
        sprite.position.set(x, y)
        this.tileLayer.addChild(sprite)
      }
    }
  }

  private async createPathLayer(): Promise<void> {
    const texture = await loadTextureOrFallback(this.app.renderer, PATH_ASSET_URL, (g) => {
      g.roundRect(0, 0, 40, ROAD_WIDTH, 6).fill({ color: PALETTE.terra })
    })
    const stamps = buildPathStamps(ROAD_DRAW_POINTS, ROAD_CORNER_RADIUS, PATH_STAMP_SPACING)
    for (const stamp of stamps) {
      const sprite = new Sprite(texture)
      sprite.anchor.set(0.5)
      sprite.position.set(stamp.x, stamp.y)
      sprite.rotation = stamp.angle
      this.pathLayer.addChild(sprite)
    }
  }

  private async createPropsLayer(): Promise<void> {
    const types = Object.keys(PROP_ASSET_URLS) as PropType[]
    const textureByType = {} as Record<PropType, Texture>
    for (const type of types) {
      const shape = PROP_FALLBACK_SHAPE[type]
      textureByType[type] = await loadTextureOrFallback(this.app.renderer, PROP_ASSET_URLS[type], (g) => {
        g.roundRect(0, 0, shape.w, shape.h, 4).fill({ color: shape.color })
      })
    }

    for (const prop of MAP_PROPS) {
      const sprite = new Sprite(textureByType[prop.type])
      sprite.anchor.set(0.5, 1)
      sprite.position.set(prop.x, prop.y)
      this.propsLayer.addChild(sprite)
    }
  }

  private createMarkers(): void {
    for (const waypoint of WAYPOINTS) {
      const g = new Graphics()
      g.circle(waypoint.x, waypoint.y, 8).stroke({ width: 2, color: COLOR.waypointBorder })
      this.markerLayer.addChild(g)
    }

    const spawnMarker = new Graphics()
    spawnMarker
      .circle(SPAWN_POINT.x, SPAWN_POINT.y, 16)
      .stroke({ width: 2, color: COLOR.gold })
    spawnMarker.circle(SPAWN_POINT.x, SPAWN_POINT.y, 5).fill({ color: COLOR.gold })
    this.markerLayer.addChild(spawnMarker)

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
    this.markerLayer.addChild(leakMarker)

    this.zoneMarker
      .circle(NEUTRAL_ZONE.x, NEUTRAL_ZONE.y, NEUTRAL_ZONE.radius)
      .stroke({ width: 2, color: COLOR.player, alpha: 0.35 })
  }

  setNeutralZoneVisible(visible: boolean): void {
    this.zoneMarker.visible = visible
  }

  /** Fase 3 — aplica um horário fixo uma única vez (sem o ciclo dinâmico). */
  setTimeOfDay(preset: TimeOfDay): void {
    const config = LIGHTING_PRESETS[preset]
    this.paintLightingOverlay(config.tintColor, config.tintAlpha)
  }

  /** Fase 4 — chamado a cada tick com o tempo de sobrevivência atual (ms). */
  updateLighting(survivalTimeMs: number): void {
    const state = computeLightingState(survivalTimeMs + LIGHTING_START_OFFSET_MS)
    this.paintLightingOverlay(state.tintColor, state.tintAlpha)

    if (survivalTimeMs - this.lastShadowSurvivalMs >= SHADOW_UPDATE_INTERVAL_MS) {
      this.lastShadowSurvivalMs = survivalTimeMs
      this.paintPropShadows(state)
      this.paintTileShading(state)
    }
  }

  private paintLightingOverlay(tintColor: number, tintAlpha: number): void {
    const w = this.app.renderer.width
    const h = this.app.renderer.height
    this.lightingOverlay.clear()
    this.lightingOverlay.rect(0, 0, w, h).fill({ color: tintColor, alpha: tintAlpha })
  }

  private paintPropShadows(state: LightingState): void {
    this.propShadowLayer.clear()
    if (state.shadowStrength <= 0) return

    const angleRad = (state.sunAngleDeg * Math.PI) / 180
    const length = 10 + 30 * state.shadowStrength
    const dx = Math.cos(angleRad) * length
    const dy = Math.sin(angleRad) * length * 0.4

    for (const prop of MAP_PROPS) {
      this.propShadowLayer
        .ellipse(prop.x + dx * 0.5, prop.y + dy * 0.5, Math.abs(dx) * 0.6 + 6, Math.abs(dy) * 0.6 + 4)
        .fill({ color: 0x000000, alpha: 0.28 * state.shadowStrength })
    }
  }

  private paintTileShading(state: LightingState): void {
    this.tileShadingLayer.clear()
    if (!this.tileGrid) return

    const angleRad = (state.sunAngleDeg * Math.PI) / 180
    const lightDir = { x: Math.cos(angleRad), y: Math.sin(angleRad) }
    const perp = { x: -lightDir.y, y: lightDir.x }
    const half = TILE_SIZE / 2
    const alpha = 0.14

    for (let row = 0; row < this.tileGrid.rows; row += 1) {
      for (let col = 0; col < this.tileGrid.cols; col += 1) {
        const { x: cx, y: cy } = cellToWorld(col, row)
        const p1 = { x: cx + perp.x * half, y: cy + perp.y * half }
        const p2 = { x: cx - perp.x * half, y: cy - perp.y * half }
        const lightCorner = { x: cx + lightDir.x * half, y: cy + lightDir.y * half }
        const darkCorner = { x: cx - lightDir.x * half, y: cy - lightDir.y * half }
        this.tileShadingLayer
          .poly([p1.x, p1.y, lightCorner.x, lightCorner.y, p2.x, p2.y])
          .fill({ color: 0xffffff, alpha })
        this.tileShadingLayer
          .poly([p1.x, p1.y, darkCorner.x, darkCorner.y, p2.x, p2.y])
          .fill({ color: 0x000000, alpha })
      }
    }
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
