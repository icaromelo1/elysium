export interface Point {
  x: number
  y: number
}

export const WORLD_W = 1920
export const WORLD_H = 1080

export const ROAD_CURVES: [Point, Point, Point][] = [
  [{ x: 250, y: 540 }, { x: 300, y: 860 }, { x: 620, y: 820 }],
  [{ x: 940, y: 780 }, { x: 700, y: 300 }, { x: 1020, y: 260 }],
  [{ x: 1340, y: 220 }, { x: 1120, y: 880 }, { x: 1460, y: 860 }],
  [{ x: 1680, y: 846 }, { x: 1750, y: 600 }, { x: 2140, y: 460 }],
]

export const ROAD_START: Point = { x: -220, y: 540 }

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

export const TERRAIN_BLOBS: { x: number; y: number; radius: number; color: number }[] = [
  { x: -120, y: 340, radius: 320, color: 0x7a8f5a },
  { x: 760, y: 60, radius: 350, color: 0xc9a227 },
  { x: 1500, y: 400, radius: 340, color: 0x7a8fa3 },
]

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
