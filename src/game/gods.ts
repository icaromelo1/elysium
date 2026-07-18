import type { Archetype } from '@/stores/useGameStore'

export interface GodDef {
  id: string
  name: string
  pantheon: string
  archetype: Archetype
  archetypeLabel: string
  description: string
  color: number
  colorCss: string
}

export const GODS: GodDef[] = [
  {
    id: 'atena',
    name: 'Atena',
    pantheon: 'GRÉCIA',
    archetype: 'nomade-entre-zonas',
    archetypeLabel: 'Nômade entre zonas',
    description: 'Move-se livremente por todas as zonas do mapa.',
    color: 0xc9a227,
    colorCss: '#c9a227',
  },
  {
    id: 'marte',
    name: 'Marte',
    pantheon: 'ROMA',
    archetype: 'nomade-entre-zonas',
    archetypeLabel: 'Nômade entre zonas',
    description: 'Move-se livremente por todas as zonas do mapa.',
    color: 0xad5a3c,
    colorCss: '#ad5a3c',
  },
  {
    id: 'anubis',
    name: 'Anúbis',
    pantheon: 'EGITO',
    archetype: 'errante-na-zona',
    archetypeLabel: 'Errante na zona',
    description: 'Move-se livremente dentro da própria zona.',
    color: 0x6f8f7a,
    colorCss: '#6f8f7a',
  },
  {
    id: 'odin',
    name: 'Odin',
    pantheon: 'NÓRDICO',
    archetype: 'imovel',
    archetypeLabel: 'Imóvel',
    description: 'Permanece fixo, mas ataca com poder ampliado.',
    color: 0x7a8fa3,
    colorCss: '#7a8fa3',
  },
  {
    id: 'guanyu',
    name: 'Guan Yu',
    pantheon: 'CHINA',
    archetype: 'errante-na-zona',
    archetypeLabel: 'Errante na zona',
    description: 'Move-se livremente dentro da própria zona.',
    color: 0x8f7aa8,
    colorCss: '#8f7aa8',
  },
]
