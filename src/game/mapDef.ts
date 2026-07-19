export interface Point {
  x: number
  y: number
}

export const WORLD_W = 1920
export const WORLD_H = 1080

export const WAYPOINTS: Point[] = [
  { x: 0, y: 540 },
  { x: 310, y: 760 },
  { x: 620, y: 820 },
  { x: 860, y: 520 },
  { x: 1020, y: 260 },
  { x: 1220, y: 480 },
  { x: 1460, y: 860 },
  { x: 1700, y: 640 },
  { x: 1920, y: 460 },
]

export const SPAWN_POINT: Point = { x: 0, y: 540 }
export const LEAK_POINT: Point = { x: 1920, y: 460 }

export const ROAD_WIDTH = 46

const ROAD_MARGIN = 220

/**
 * Pontos usados pra DESENHAR a estrada — os mesmos WAYPOINTS que os inimigos
 * percorrem (garante que o traçado visual nunca desvie de onde eles andam),
 * só com as pontas estendidas pra fora da tela.
 */
export const ROAD_DRAW_POINTS: Point[] = [
  { x: (WAYPOINTS[0]?.x ?? 0) - ROAD_MARGIN, y: WAYPOINTS[0]?.y ?? 0 },
  ...WAYPOINTS,
  { x: (WAYPOINTS[WAYPOINTS.length - 1]?.x ?? 0) + ROAD_MARGIN, y: WAYPOINTS[WAYPOINTS.length - 1]?.y ?? 0 },
]

export const NEUTRAL_ZONE = { x: 900, y: 430, radius: 180 }
export const PLAYER_START: Point = { x: 900, y: 430 }

export type ZoneSide = 'norte' | 'sul'

export function roadYAtX(x: number): number {
  const clampedX = Math.min(Math.max(x, WAYPOINTS[0]?.x ?? 0), WAYPOINTS[WAYPOINTS.length - 1]?.x ?? 0)

  for (let i = 0; i < WAYPOINTS.length - 1; i += 1) {
    const a = WAYPOINTS[i]
    const b = WAYPOINTS[i + 1]
    if (!a || !b) continue
    if (clampedX >= a.x && clampedX <= b.x) {
      const span = b.x - a.x
      const ratio = span === 0 ? 0 : (clampedX - a.x) / span
      return a.y + (b.y - a.y) * ratio
    }
  }

  return WAYPOINTS[WAYPOINTS.length - 1]?.y ?? 0
}

export function sideOfRoad(x: number, y: number): ZoneSide {
  return y < roadYAtX(x) ? 'norte' : 'sul'
}

export const PALETTE = {
  oliveira: 0x6f9a52,
  terra: 0xd8b177,
  egeu: 0x3b6e8f,
  terracota: 0xc1592f,
  marmore: 0xf2e8d5,
  ouro: 0xb5872a,
}

export const COLOR = {
  bg: 0x0d0b08,
  ink: 0xece3d0,
  gold: 0xc9a227,
  danger: 0xad5a3c,
  player: 0x6f8f7a,
  purple: 0x8f7aa8,
  steel: 0x7a8fa3,
  roadFill: 0x332c22,
  roadDash: 0x4a4132,
  waypointBorder: 0x7a7263,
}

export const ENEMY_COLORS: number[] = [0xad5a3c, 0xc9a227, 0x6f8f7a, 0x8f7aa8]
