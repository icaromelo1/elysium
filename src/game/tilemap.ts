import { WORLD_H, WORLD_W } from './mapDef'

export type TileType = 'grama' | 'agua'

export const TILE_SIZE = 64

/**
 * Margem de tiles além da borda visível do mundo, pra cobrir pan de câmera livre.
 */
export const GRID_MARGIN_TILES = 3

export interface TileGrid {
  cols: number
  rows: number
  cells: TileType[][]
}

const WATER_PATCHES = [
  { x: 1500, y: 400, radius: 150 },
  { x: -50, y: 600, radius: 110 },
]

const GRID_ORIGIN_X = -GRID_MARGIN_TILES * TILE_SIZE
const GRID_ORIGIN_Y = -GRID_MARGIN_TILES * TILE_SIZE

export function buildTileGrid(): TileGrid {
  const gridW = WORLD_W + 2 * GRID_MARGIN_TILES * TILE_SIZE
  const gridH = WORLD_H + 2 * GRID_MARGIN_TILES * TILE_SIZE
  const cols = Math.ceil(gridW / TILE_SIZE)
  const rows = Math.ceil(gridH / TILE_SIZE)

  const cells: TileType[][] = []

  for (let row = 0; row < rows; row += 1) {
    const rowCells: TileType[] = []
    for (let col = 0; col < cols; col += 1) {
      const { x, y } = cellToWorld(col, row)
      const isWater = WATER_PATCHES.some((patch) => {
        const dx = x - patch.x
        const dy = y - patch.y
        return dx * dx + dy * dy <= patch.radius * patch.radius
      })
      rowCells.push(isWater ? 'agua' : 'grama')
    }
    cells.push(rowCells)
  }

  return { cols, rows, cells }
}

export function worldToCell(x: number, y: number): { col: number; row: number } {
  return {
    col: Math.floor((x - GRID_ORIGIN_X) / TILE_SIZE),
    row: Math.floor((y - GRID_ORIGIN_Y) / TILE_SIZE),
  }
}

export function cellToWorld(col: number, row: number): { x: number; y: number } {
  return {
    x: GRID_ORIGIN_X + col * TILE_SIZE + TILE_SIZE / 2,
    y: GRID_ORIGIN_Y + row * TILE_SIZE + TILE_SIZE / 2,
  }
}
