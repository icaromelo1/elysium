export type PropType = 'coluna-dorica' | 'coluna-quebrada' | 'estatua' | 'oliveira' | 'cipreste' | 'anfora'

export interface PropDef {
  type: PropType
  x: number
  y: number
}

export const MAP_PROPS: PropDef[] = [
  { type: 'coluna-dorica', x: 150, y: 350 },
  { type: 'coluna-dorica', x: 1550, y: 300 },
  { type: 'coluna-quebrada', x: 500, y: 550 },
  { type: 'coluna-quebrada', x: 1350, y: 950 },
  { type: 'estatua', x: 1050, y: 150 },
  { type: 'estatua', x: 1650, y: 950 },
  { type: 'oliveira', x: 750, y: 950 },
  { type: 'oliveira', x: 1850, y: 200 },
  { type: 'cipreste', x: 1150, y: 700 },
  { type: 'cipreste', x: 250, y: 950 },
  { type: 'anfora', x: 50, y: 950 },
  { type: 'anfora', x: 1900, y: 750 },
]
