import type { EffectSpec } from './effects'

export type ArchetypeId =
  | 'guerreiro'
  | 'sentinela'
  | 'chefe-de-guerra'
  | 'cacador'
  | 'guarda-de-arremesso'
  | 'estrategista'
  | 'lamina-arcana'
  | 'guardiao-runico'
  | 'xama-de-combate'
  | 'arquimago'
  | 'ilusionista'
  | 'invocador'

export type DamageType = 'fisico' | 'magico'
export type WeaponRange = 'melee' | 'projetil'
export type Role = 'ofensivo' | 'defensivo' | 'suporte'

export interface SkillNode {
  id: string
  archetypeId: ArchetypeId | 'any'
  tier: 1 | 2 | 3 | 4
  axes: { damage?: DamageType; range?: WeaponRange; role?: Role }
  name: string
  description: string
  effect: EffectSpec
  rarity: 'comum' | 'raro' | 'epico'
}

export interface LevelDef {
  level: number
  kind: 'fixed' | 'god-select' | 'cards' | 'fork-range' | 'fork-damage' | 'fork-role' | 'capstone' | 'infinite-draft'
  cardCount?: number
}

export interface CapstoneDef {
  archetypeId: ArchetypeId
  defaultName: string
  nameByGod: Record<string, string>
  effect: EffectSpec
}

export const ARCHETYPES: { id: ArchetypeId; damage: DamageType; range: WeaponRange; role: Role; name: string; theme: string }[] = [
  { id: 'guerreiro', damage: 'fisico', range: 'melee', role: 'ofensivo', name: 'Guerreiro', theme: 'Dano corpo a corpo cru, combos, crítico' },
  { id: 'sentinela', damage: 'fisico', range: 'melee', role: 'defensivo', name: 'Sentinela', theme: 'Tanque corpo a corpo, bloqueio, body-block' },
  { id: 'chefe-de-guerra', damage: 'fisico', range: 'melee', role: 'suporte', name: 'Chefe de Guerra', theme: 'Invoca aliados corpo a corpo, buffs de grupo' },
  { id: 'cacador', damage: 'fisico', range: 'projetil', role: 'ofensivo', name: 'Caçador', theme: 'Dano à distância cru, multi-tiro, penetração' },
  { id: 'guarda-de-arremesso', damage: 'fisico', range: 'projetil', role: 'defensivo', name: 'Guarda de Arremesso', theme: 'Escudo arremessável, negação de área física' },
  { id: 'estrategista', damage: 'fisico', range: 'projetil', role: 'suporte', name: 'Estrategista', theme: 'Armadilhas físicas, marcação de alvo, debuff' },
  { id: 'lamina-arcana', damage: 'magico', range: 'melee', role: 'ofensivo', name: 'Lâmina Arcana', theme: 'Arma encantada, explosões de curto alcance' },
  { id: 'guardiao-runico', damage: 'magico', range: 'melee', role: 'defensivo', name: 'Guardião Rúnico', theme: 'Barreiras mágicas, absorção de dano corpo a corpo' },
  { id: 'xama-de-combate', damage: 'magico', range: 'melee', role: 'suporte', name: 'Xamã de Combate', theme: 'Cura em área curta, totens, buffs mágicos' },
  { id: 'arquimago', damage: 'magico', range: 'projetil', role: 'ofensivo', name: 'Arquimago', theme: 'Dano mágico à distância puro (bolas de fogo etc)' },
  { id: 'ilusionista', damage: 'magico', range: 'projetil', role: 'defensivo', name: 'Ilusionista', theme: 'Clones, desvio, controle de área mágico' },
  { id: 'invocador', damage: 'magico', range: 'projetil', role: 'suporte', name: 'Invocador', theme: 'Spawna cópias mágicas à distância, cura à distância' },
]

export const AFFINITY: Record<string, ArchetypeId> = {
  marte: 'guerreiro',
  guanyu: 'sentinela',
  atena: 'estrategista',
  anubis: 'guardiao-runico',
  odin: 'arquimago',
}

export const LEVEL_DEFS: LevelDef[] = [
  { level: 1, kind: 'fixed' },
  { level: 2, kind: 'god-select' },
  { level: 3, kind: 'cards', cardCount: 3 },
  { level: 4, kind: 'cards', cardCount: 3 },
  { level: 5, kind: 'cards', cardCount: 3 },
  { level: 6, kind: 'fork-range' },
  { level: 7, kind: 'cards', cardCount: 3 },
  { level: 8, kind: 'cards', cardCount: 3 },
  { level: 9, kind: 'cards', cardCount: 3 },
  { level: 10, kind: 'fork-damage' },
  { level: 11, kind: 'cards', cardCount: 3 },
  { level: 12, kind: 'cards', cardCount: 3 },
  { level: 13, kind: 'cards', cardCount: 3 },
  { level: 14, kind: 'cards', cardCount: 3 },
  { level: 15, kind: 'fork-role' },
  { level: 16, kind: 'cards', cardCount: 3 },
  { level: 17, kind: 'cards', cardCount: 3 },
  { level: 18, kind: 'cards', cardCount: 3 },
  { level: 19, kind: 'cards', cardCount: 3 },
  { level: 20, kind: 'capstone' },
]

export const INFINITE_LEVEL_DEF: LevelDef = { level: -1, kind: 'infinite-draft', cardCount: 3 }

export function levelDefFor(level: number): LevelDef {
  return LEVEL_DEFS.find((def) => def.level === level) ?? INFINITE_LEVEL_DEF
}

// ---------------------------------------------------------------------------
// Tier 1 — genérico (nível 3-5), arquétipo-agnóstico
// ---------------------------------------------------------------------------

const TIER1_NODES: SkillNode[] = [
  { id: 't1-dano', archetypeId: 'any', tier: 1, axes: {}, name: '+12% Dano', description: 'Aumenta o dano do ataque básico.', effect: { kind: 'stat-mod', stat: 'damage', percent: 12 }, rarity: 'comum' },
  { id: 't1-vida', archetypeId: 'any', tier: 1, axes: {}, name: '+10% Vida Máxima', description: 'Aumenta a vida máxima.', effect: { kind: 'stat-mod', stat: 'maxHp', percent: 10 }, rarity: 'comum' },
  { id: 't1-velocidade', archetypeId: 'any', tier: 1, axes: {}, name: '+8% Velocidade de Movimento', description: 'Aumenta a velocidade de deslocamento.', effect: { kind: 'stat-mod', stat: 'moveSpeed', percent: 8 }, rarity: 'comum' },
  { id: 't1-vel-ataque', archetypeId: 'any', tier: 1, axes: {}, name: '+10% Velocidade de Ataque', description: 'Ataca com mais frequência.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 10 }, rarity: 'comum' },
  { id: 't1-alcance', archetypeId: 'any', tier: 1, axes: {}, name: '+8% Alcance', description: 'Aumenta o alcance de ataque.', effect: { kind: 'stat-mod', stat: 'range', percent: 8 }, rarity: 'comum' },
  { id: 't1-stamina-max', archetypeId: 'any', tier: 1, axes: {}, name: '+15% Stamina Máxima', description: 'Aumenta a capacidade de stamina.', effect: { kind: 'stat-mod', stat: 'maxStamina', percent: 15 }, rarity: 'comum' },
  { id: 't1-stamina-regen', archetypeId: 'any', tier: 1, axes: {}, name: '+20% Regeneração de Stamina', description: 'Recupera stamina mais rápido parado ou andando normal.', effect: { kind: 'stat-mod', stat: 'staminaRegen', percent: 20 }, rarity: 'comum' },
]

// ---------------------------------------------------------------------------
// Tier 2 — por eixo de alcance (nível 7-9)
// ---------------------------------------------------------------------------

const TIER2_NODES: SkillNode[] = [
  { id: 't2-melee-alcance', archetypeId: 'any', tier: 2, axes: { range: 'melee' }, name: 'Alcance de Swing', description: 'O golpe corpo a corpo alcança mais longe.', effect: { kind: 'stat-mod', stat: 'range', percent: 15 }, rarity: 'comum' },
  { id: 't2-melee-atordoa', archetypeId: 'any', tier: 2, axes: { range: 'melee' }, name: 'Impacto Atordoante', description: 'Chance de atordoar o alvo ao acertar.', effect: { kind: 'on-hit-stun', durationMs: 300, chancePercent: 20 }, rarity: 'comum' },
  { id: 't2-melee-vel', archetypeId: 'any', tier: 2, axes: { range: 'melee' }, name: '+15% Velocidade de Ataque Melee', description: 'Golpeia mais rápido corpo a corpo.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 15 }, rarity: 'comum' },
  { id: 't2-melee-vida', archetypeId: 'any', tier: 2, axes: { range: 'melee' }, name: '+12% Vida Máxima', description: 'Aguenta mais dano no combate corpo a corpo.', effect: { kind: 'stat-mod', stat: 'maxHp', percent: 12 }, rarity: 'comum' },
  { id: 't2-melee-dano', archetypeId: 'any', tier: 2, axes: { range: 'melee' }, name: '+15% Dano Melee', description: 'Golpes corpo a corpo mais fortes.', effect: { kind: 'stat-mod', stat: 'damage', percent: 15 }, rarity: 'raro' },
  { id: 't2-proj-penetra', archetypeId: 'any', tier: 2, axes: { range: 'projetil' }, name: 'Perfurante', description: 'O ataque atravessa um inimigo extra.', effect: { kind: 'pierce', extraTargets: 1 }, rarity: 'raro' },
  { id: 't2-proj-alcance', archetypeId: 'any', tier: 2, axes: { range: 'projetil' }, name: '+20% Alcance de Tiro', description: 'Aumenta o alcance à distância.', effect: { kind: 'stat-mod', stat: 'range', percent: 20 }, rarity: 'comum' },
  { id: 't2-proj-vel', archetypeId: 'any', tier: 2, axes: { range: 'projetil' }, name: '+15% Velocidade de Ataque à Distância', description: 'Atira mais rápido.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 15 }, rarity: 'comum' },
  { id: 't2-proj-dano', archetypeId: 'any', tier: 2, axes: { range: 'projetil' }, name: '+15% Dano à Distância', description: 'Tiros mais fortes.', effect: { kind: 'stat-mod', stat: 'damage', percent: 15 }, rarity: 'comum' },
]

// ---------------------------------------------------------------------------
// Tier 3 — por quadrante dano×alcance (nível 11-14)
// ---------------------------------------------------------------------------

const TIER3_NODES: SkillNode[] = [
  // Físico-Melee
  { id: 't3-fm-sangramento', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'melee' }, name: 'Sangramento', description: 'O alvo sangra ao longo do tempo após ser atingido.', effect: { kind: 'on-hit-dot', damagePercent: 8, durationMs: 3000, tickMs: 500 }, rarity: 'raro' },
  { id: 't3-fm-investida', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'melee' }, name: 'Investida', description: 'Avança até o inimigo mais próximo.', effect: { kind: 'dash', range: 220, cooldownMs: 4000 }, rarity: 'raro' },
  { id: 't3-fm-golpeduplo', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'melee' }, name: 'Golpe Duplo', description: 'Chance de golpear duas vezes.', effect: { kind: 'on-hit-multistrike', chancePercent: 20 }, rarity: 'raro' },
  { id: 't3-fm-quebrarmadura', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'melee' }, name: 'Quebra-Armadura', description: 'O alvo recebe mais dano por um tempo após ser atingido.', effect: { kind: 'on-hit-shred', percent: 15, durationMs: 3000 }, rarity: 'raro' },
  // Mágico-Melee
  { id: 't3-mm-queimadura', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'melee' }, name: 'Queimadura Arcana', description: 'O alvo queima ao longo do tempo após ser atingido.', effect: { kind: 'on-hit-dot', damagePercent: 10, durationMs: 2500, tickMs: 500 }, rarity: 'raro' },
  { id: 't3-mm-choque', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'melee' }, name: 'Onda de Choque', description: 'A cada 3 acertos, libera uma explosão em área.', effect: { kind: 'combo-burst', stacksRequired: 3, radius: 140, damagePercent: 40 }, rarity: 'raro' },
  { id: 't3-mm-drenar', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'melee' }, name: 'Drenar Essência', description: 'Recupera vida com base no dano causado.', effect: { kind: 'on-hit-lifesteal', percent: 12 }, rarity: 'raro' },
  { id: 't3-mm-lampejo', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'melee' }, name: 'Lampejo', description: 'Teleporta até o inimigo mais próximo.', effect: { kind: 'dash', range: 200, cooldownMs: 5000 }, rarity: 'raro' },
  // Físico-Projétil
  { id: 't3-fp-flechadupla', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'projetil' }, name: 'Flecha Dupla', description: 'Chance de disparar dois projéteis.', effect: { kind: 'on-hit-multistrike', chancePercent: 25 }, rarity: 'raro' },
  { id: 't3-fp-tiroperfurante', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'projetil' }, name: 'Tiro Perfurante', description: 'O projétil atravessa mais um inimigo.', effect: { kind: 'pierce', extraTargets: 1 }, rarity: 'raro' },
  { id: 't3-fp-fratura', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'projetil' }, name: 'Fratura Óssea', description: 'O alvo recebe mais dano por um tempo após ser atingido.', effect: { kind: 'on-hit-shred', percent: 12, durationMs: 2500 }, rarity: 'raro' },
  { id: 't3-fp-recuo', archetypeId: 'any', tier: 3, axes: { damage: 'fisico', range: 'projetil' }, name: 'Recuo Calculado', description: 'Aumenta a velocidade de disparo.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 18 }, rarity: 'raro' },
  // Mágico-Projétil
  { id: 't3-pm-napalm', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'projetil' }, name: 'Napalm Arcano', description: 'O alvo queima ao longo do tempo após ser atingido.', effect: { kind: 'on-hit-dot', damagePercent: 9, durationMs: 3000, tickMs: 600 }, rarity: 'raro' },
  { id: 't3-pm-eco', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'projetil' }, name: 'Eco Mágico', description: 'Chance do feitiço ecoar num segundo disparo.', effect: { kind: 'on-hit-multistrike', chancePercent: 22 }, rarity: 'raro' },
  { id: 't3-pm-vortice', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'projetil' }, name: 'Vórtice', description: 'A cada 4 acertos, libera uma explosão em área.', effect: { kind: 'combo-burst', stacksRequired: 4, radius: 160, damagePercent: 35 }, rarity: 'raro' },
  { id: 't3-pm-absorcao', archetypeId: 'any', tier: 3, axes: { damage: 'magico', range: 'projetil' }, name: 'Absorção Etérea', description: 'Recupera vida com base no dano causado.', effect: { kind: 'on-hit-lifesteal', percent: 10 }, rarity: 'raro' },
]

// ---------------------------------------------------------------------------
// Tier 4 — temático por arquétipo (nível 16-19)
// ---------------------------------------------------------------------------

const TIER4_NODES: SkillNode[] = [
  // Guerreiro
  { id: 't4-guerreiro-furia', archetypeId: 'guerreiro', tier: 4, axes: {}, name: 'Fúria de Batalha', description: 'Cada acerto consecutivo aumenta o dano; erra e o combo reseta.', effect: { kind: 'combo-escalation', percentPerStack: 6, maxStacks: 5, resetOnMiss: true }, rarity: 'epico' },
  { id: 't4-guerreiro-sismico', archetypeId: 'guerreiro', tier: 4, axes: {}, name: 'Golpe Sísmico', description: 'Ao completar um combo, causa dano em área ao redor.', effect: { kind: 'combo-burst', stacksRequired: 5, radius: 160, damagePercent: 50 }, rarity: 'raro' },
  { id: 't4-guerreiro-sede', archetypeId: 'guerreiro', tier: 4, axes: {}, name: 'Sede de Sangue', description: 'Recupera vida com base no dano causado.', effect: { kind: 'on-hit-lifesteal', percent: 14 }, rarity: 'raro' },
  { id: 't4-guerreiro-grito', archetypeId: 'guerreiro', tier: 4, axes: {}, name: 'Grito de Guerra', description: 'Matar um inimigo concede um breve bônus de dano.', effect: { kind: 'on-kill-buff', stat: 'damage', percent: 20, durationMs: 4000 }, rarity: 'raro' },
  // Sentinela
  { id: 't4-sentinela-postura', archetypeId: 'sentinela', tier: 4, axes: {}, name: 'Postura de Ferro', description: 'Absorve parte do dano recebido.', effect: { kind: 'aura-shield', absorbPercent: 20, radius: 60 }, rarity: 'epico' },
  { id: 't4-sentinela-resiliencia', archetypeId: 'sentinela', tier: 4, axes: {}, name: 'Resiliência', description: '+18% de vida máxima.', effect: { kind: 'stat-mod', stat: 'maxHp', percent: 18 }, rarity: 'raro' },
  { id: 't4-sentinela-contra', archetypeId: 'sentinela', tier: 4, axes: {}, name: 'Contra-Ataque', description: 'Chance de atordoar o atacante ao ser atingido.', effect: { kind: 'on-hit-stun', durationMs: 500, chancePercent: 30 }, rarity: 'raro' },
  { id: 't4-sentinela-guarda', archetypeId: 'sentinela', tier: 4, axes: {}, name: 'Guarda Erguida', description: 'Golpes corpo a corpo mais fortes.', effect: { kind: 'stat-mod', stat: 'damage', percent: 12 }, rarity: 'comum' },
  // Chefe de Guerra
  { id: 't4-chefe-convocar', archetypeId: 'chefe-de-guerra', tier: 4, axes: {}, name: 'Convocar Aliado', description: 'Invoca um aliado que causa dano por um tempo.', effect: { kind: 'summon-companion', damagePerTick: 6, durationMs: 8000 }, rarity: 'epico' },
  { id: 't4-chefe-comando', archetypeId: 'chefe-de-guerra', tier: 4, axes: {}, name: 'Grito de Comando', description: 'Matar um inimigo concede um bônus de dano.', effect: { kind: 'on-kill-buff', stat: 'damage', percent: 15, durationMs: 5000 }, rarity: 'raro' },
  { id: 't4-chefe-estandarte', archetypeId: 'chefe-de-guerra', tier: 4, axes: {}, name: 'Estandarte de Guerra', description: 'Absorve parte do dano recebido.', effect: { kind: 'aura-shield', absorbPercent: 10, radius: 200 }, rarity: 'raro' },
  { id: 't4-chefe-furia', archetypeId: 'chefe-de-guerra', tier: 4, axes: {}, name: 'Fúria Compartilhada', description: '+15% de velocidade de ataque.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 15 }, rarity: 'comum' },
  // Caçador
  { id: 't4-cacador-multitiro', archetypeId: 'cacador', tier: 4, axes: {}, name: 'Multi-Tiro', description: 'Chance de disparar múltiplas flechas.', effect: { kind: 'on-hit-multistrike', chancePercent: 30 }, rarity: 'epico' },
  { id: 't4-cacador-perfurante', archetypeId: 'cacador', tier: 4, axes: {}, name: 'Flecha Perfurante', description: 'O tiro atravessa dois inimigos extras.', effect: { kind: 'pierce', extraTargets: 2 }, rarity: 'raro' },
  { id: 't4-cacador-precisao', archetypeId: 'cacador', tier: 4, axes: {}, name: 'Precisão Mortal', description: '+20% de dano.', effect: { kind: 'stat-mod', stat: 'damage', percent: 20 }, rarity: 'raro' },
  { id: 't4-cacador-instinto', archetypeId: 'cacador', tier: 4, axes: {}, name: 'Instinto de Caça', description: 'Matar um inimigo concede um bônus de dano.', effect: { kind: 'on-kill-buff', stat: 'damage', percent: 12, durationMs: 4000 }, rarity: 'comum' },
  // Guarda de Arremesso
  { id: 't4-guarda-escudo', archetypeId: 'guarda-de-arremesso', tier: 4, axes: {}, name: 'Escudo Arremessável', description: 'Chance de atordoar o alvo ao acertar.', effect: { kind: 'on-hit-stun', durationMs: 600, chancePercent: 25 }, rarity: 'epico' },
  { id: 't4-guarda-negacao', archetypeId: 'guarda-de-arremesso', tier: 4, axes: {}, name: 'Zona de Negação', description: 'A cada 3 acertos, causa dano em área.', effect: { kind: 'combo-burst', stacksRequired: 3, radius: 150, damagePercent: 25 }, rarity: 'raro' },
  { id: 't4-guarda-retorno', archetypeId: 'guarda-de-arremesso', tier: 4, axes: {}, name: 'Retorno do Escudo', description: 'Chance de atingir o alvo duas vezes.', effect: { kind: 'on-hit-multistrike', chancePercent: 15 }, rarity: 'comum' },
  { id: 't4-guarda-reforcada', archetypeId: 'guarda-de-arremesso', tier: 4, axes: {}, name: 'Guarda Reforçada', description: 'Absorve parte do dano recebido.', effect: { kind: 'aura-shield', absorbPercent: 15, radius: 60 }, rarity: 'raro' },
  // Estrategista
  { id: 't4-estrategista-armadilha', archetypeId: 'estrategista', tier: 4, axes: {}, name: 'Armadilha de Contenção', description: 'Chance de atordoar o alvo ao acertar.', effect: { kind: 'on-hit-stun', durationMs: 800, chancePercent: 35 }, rarity: 'epico' },
  { id: 't4-estrategista-marca', archetypeId: 'estrategista', tier: 4, axes: {}, name: 'Marca do Caçador', description: 'O alvo recebe mais dano por um tempo após ser atingido.', effect: { kind: 'on-hit-shred', percent: 20, durationMs: 3500 }, rarity: 'raro' },
  { id: 't4-estrategista-rede', archetypeId: 'estrategista', tier: 4, axes: {}, name: 'Rede de Aço', description: 'O alvo sangra ao longo do tempo após ser atingido.', effect: { kind: 'on-hit-dot', damagePercent: 6, durationMs: 2500, tickMs: 500 }, rarity: 'raro' },
  { id: 't4-estrategista-coordenacao', archetypeId: 'estrategista', tier: 4, axes: {}, name: 'Coordenação Tática', description: '+18% de velocidade de ataque.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 18 }, rarity: 'comum' },
  // Lâmina Arcana
  { id: 't4-lamina-explosao', archetypeId: 'lamina-arcana', tier: 4, axes: {}, name: 'Explosão Arcana', description: 'A cada 2 acertos, libera uma explosão em área.', effect: { kind: 'combo-burst', stacksRequired: 2, radius: 130, damagePercent: 45 }, rarity: 'epico' },
  { id: 't4-lamina-fio', archetypeId: 'lamina-arcana', tier: 4, axes: {}, name: 'Fio Encantado', description: 'O alvo queima ao longo do tempo após ser atingido.', effect: { kind: 'on-hit-dot', damagePercent: 9, durationMs: 2500, tickMs: 500 }, rarity: 'raro' },
  { id: 't4-lamina-corte', archetypeId: 'lamina-arcana', tier: 4, axes: {}, name: 'Corte Dimensional', description: 'Avança até o inimigo mais próximo.', effect: { kind: 'dash', range: 180, cooldownMs: 3500 }, rarity: 'raro' },
  { id: 't4-lamina-ressonancia', archetypeId: 'lamina-arcana', tier: 4, axes: {}, name: 'Ressonância', description: '+18% de dano.', effect: { kind: 'stat-mod', stat: 'damage', percent: 18 }, rarity: 'comum' },
  // Guardião Rúnico
  { id: 't4-guardiao-barreira', archetypeId: 'guardiao-runico', tier: 4, axes: {}, name: 'Barreira Rúnica', description: 'Absorve parte do dano recebido.', effect: { kind: 'aura-shield', absorbPercent: 25, radius: 60 }, rarity: 'epico' },
  { id: 't4-guardiao-runa', archetypeId: 'guardiao-runico', tier: 4, axes: {}, name: 'Runa de Retorno', description: 'Chance de atordoar o atacante ao ser atingido.', effect: { kind: 'on-hit-stun', durationMs: 500, chancePercent: 20 }, rarity: 'raro' },
  { id: 't4-guardiao-casco', archetypeId: 'guardiao-runico', tier: 4, axes: {}, name: 'Casco Arcano', description: '+20% de vida máxima.', effect: { kind: 'stat-mod', stat: 'maxHp', percent: 20 }, rarity: 'raro' },
  { id: 't4-guardiao-selo', archetypeId: 'guardiao-runico', tier: 4, axes: {}, name: 'Selo de Proteção', description: 'Absorve parte do dano recebido numa área maior.', effect: { kind: 'aura-shield', absorbPercent: 12, radius: 220 }, rarity: 'comum' },
  // Xamã de Combate
  { id: 't4-xama-totem', archetypeId: 'xama-de-combate', tier: 4, axes: {}, name: 'Totem de Cura', description: 'Cura em área a cada intervalo.', effect: { kind: 'periodic-heal', percent: 6, radius: 150, intervalMs: 2000 }, rarity: 'epico' },
  { id: 't4-xama-bencao', archetypeId: 'xama-de-combate', tier: 4, axes: {}, name: 'Bênção do Combate', description: 'Matar um inimigo concede um bônus de dano.', effect: { kind: 'on-kill-buff', stat: 'damage', percent: 14, durationMs: 5000 }, rarity: 'raro' },
  { id: 't4-xama-vinculo', archetypeId: 'xama-de-combate', tier: 4, axes: {}, name: 'Vínculo Espiritual', description: 'Recupera vida com base no dano causado.', effect: { kind: 'on-hit-lifesteal', percent: 10 }, rarity: 'raro' },
  { id: 't4-xama-fluxo', archetypeId: 'xama-de-combate', tier: 4, axes: {}, name: 'Fluxo Vital', description: '+15% de vida máxima.', effect: { kind: 'stat-mod', stat: 'maxHp', percent: 15 }, rarity: 'comum' },
  // Arquimago
  { id: 't4-arquimago-bola', archetypeId: 'arquimago', tier: 4, axes: {}, name: 'Bola de Fogo', description: 'O alvo queima ao longo do tempo após ser atingido.', effect: { kind: 'on-hit-dot', damagePercent: 12, durationMs: 3000, tickMs: 500 }, rarity: 'epico' },
  { id: 't4-arquimago-sobrecarga', archetypeId: 'arquimago', tier: 4, axes: {}, name: 'Sobrecarga Arcana', description: '+22% de dano.', effect: { kind: 'stat-mod', stat: 'damage', percent: 22 }, rarity: 'raro' },
  { id: 't4-arquimago-retardada', archetypeId: 'arquimago', tier: 4, axes: {}, name: 'Explosão Retardada', description: 'A cada 3 acertos, causa dano em área.', effect: { kind: 'combo-burst', stacksRequired: 3, radius: 160, damagePercent: 40 }, rarity: 'raro' },
  { id: 't4-arquimago-fluxo', archetypeId: 'arquimago', tier: 4, axes: {}, name: 'Fluxo de Mana', description: '+18% de velocidade de ataque.', effect: { kind: 'stat-mod', stat: 'attackSpeed', percent: 18 }, rarity: 'comum' },
  // Ilusionista
  { id: 't4-ilusionista-clone', archetypeId: 'ilusionista', tier: 4, axes: {}, name: 'Clone Espelho', description: 'Invoca um clone que causa dano por um tempo.', effect: { kind: 'summon-companion', damagePerTick: 4, durationMs: 6000 }, rarity: 'epico' },
  { id: 't4-ilusionista-desvio', archetypeId: 'ilusionista', tier: 4, axes: {}, name: 'Desvio Dimensional', description: 'Teleporta até o inimigo mais próximo.', effect: { kind: 'dash', range: 220, cooldownMs: 4500 }, rarity: 'raro' },
  { id: 't4-ilusionista-nevoa', archetypeId: 'ilusionista', tier: 4, axes: {}, name: 'Névoa Confusa', description: 'Chance de atordoar o alvo ao acertar.', effect: { kind: 'on-hit-stun', durationMs: 600, chancePercent: 22 }, rarity: 'raro' },
  { id: 't4-ilusionista-persistente', archetypeId: 'ilusionista', tier: 4, axes: {}, name: 'Ilusão Persistente', description: 'Absorve parte do dano recebido.', effect: { kind: 'aura-shield', absorbPercent: 14, radius: 60 }, rarity: 'comum' },
  // Invocador
  { id: 't4-invocador-servo', archetypeId: 'invocador', tier: 4, axes: {}, name: 'Servo Arcano', description: 'Invoca um servo que causa dano por um tempo.', effect: { kind: 'summon-companion', damagePerTick: 7, durationMs: 9000 }, rarity: 'epico' },
  { id: 't4-invocador-cura', archetypeId: 'invocador', tier: 4, axes: {}, name: 'Cura à Distância', description: 'Cura em área a cada intervalo.', effect: { kind: 'periodic-heal', percent: 5, radius: 999, intervalMs: 2500 }, rarity: 'raro' },
  { id: 't4-invocador-vinculo', archetypeId: 'invocador', tier: 4, axes: {}, name: 'Vínculo dos Invocados', description: 'Matar um inimigo concede um bônus de dano.', effect: { kind: 'on-kill-buff', stat: 'damage', percent: 10, durationMs: 4000 }, rarity: 'raro' },
  { id: 't4-invocador-fluxo', archetypeId: 'invocador', tier: 4, axes: {}, name: 'Fluxo Arcano', description: '+12% de velocidade de movimento.', effect: { kind: 'stat-mod', stat: 'moveSpeed', percent: 12 }, rarity: 'comum' },
]

export const SKILL_NODES: SkillNode[] = [...TIER1_NODES, ...TIER2_NODES, ...TIER3_NODES, ...TIER4_NODES]

// ---------------------------------------------------------------------------
// Capstones (nível 20) — 1 por arquétipo, reskinado por deus afim
// ---------------------------------------------------------------------------

export const CAPSTONES: Record<ArchetypeId, CapstoneDef> = {
  guerreiro: {
    archetypeId: 'guerreiro',
    defaultName: 'Fúria do Guerreiro',
    nameByGod: { marte: 'Fúria de Marte' },
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['aoe-melee', 'uninterruptible'] },
  },
  sentinela: {
    archetypeId: 'sentinela',
    defaultName: 'Muralha Inabalável',
    nameByGod: { guanyu: 'Muralha de Guan Yu' },
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['uninterruptible', 'damage-boost'] },
  },
  'chefe-de-guerra': {
    archetypeId: 'chefe-de-guerra',
    defaultName: 'Grito Ancestral',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['damage-boost', 'aoe-melee'] },
  },
  cacador: {
    archetypeId: 'cacador',
    defaultName: 'Chuva de Flechas',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 5000, grants: ['aoe-ranged', 'damage-boost'] },
  },
  'guarda-de-arremesso': {
    archetypeId: 'guarda-de-arremesso',
    defaultName: 'Fortaleza Móvel',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['uninterruptible', 'aoe-ranged'] },
  },
  estrategista: {
    archetypeId: 'estrategista',
    defaultName: 'Campo Minado',
    nameByGod: { atena: 'Campo Tático de Atena' },
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['aoe-ranged', 'damage-boost'] },
  },
  'lamina-arcana': {
    archetypeId: 'lamina-arcana',
    defaultName: 'Corte do Vazio',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 5000, grants: ['aoe-melee', 'damage-boost'] },
  },
  'guardiao-runico': {
    archetypeId: 'guardiao-runico',
    defaultName: 'Aegis Absoluto',
    nameByGod: { anubis: 'Aegis de Anúbis' },
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['uninterruptible', 'lifesteal-boost'] },
  },
  'xama-de-combate': {
    archetypeId: 'xama-de-combate',
    defaultName: 'Comunhão Espiritual',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['lifesteal-boost', 'aoe-melee'] },
  },
  arquimago: {
    archetypeId: 'arquimago',
    defaultName: 'Cataclismo Arcano',
    nameByGod: { odin: 'Cataclismo de Odin' },
    effect: { kind: 'ultimate-window', durationMs: 5000, grants: ['aoe-ranged', 'damage-boost'] },
  },
  ilusionista: {
    archetypeId: 'ilusionista',
    defaultName: 'Véu de Mil Faces',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 6000, grants: ['uninterruptible', 'aoe-ranged'] },
  },
  invocador: {
    archetypeId: 'invocador',
    defaultName: 'Legião Espectral',
    nameByGod: {},
    effect: { kind: 'ultimate-window', durationMs: 7000, grants: ['aoe-ranged', 'lifesteal-boost'] },
  },
}

export function resolveArchetypeId(range: WeaponRange, damage: DamageType, role: Role): ArchetypeId {
  const found = ARCHETYPES.find((a) => a.range === range && a.damage === damage && a.role === role)
  if (!found) throw new Error(`Nenhum arquétipo encontrado para ${damage}/${range}/${role}`)
  return found.id
}

export function capstoneNameFor(archetypeId: ArchetypeId, godId: string | null): string {
  const def = CAPSTONES[archetypeId]
  if (godId && def.nameByGod[godId]) return def.nameByGod[godId] as string
  return def.defaultName
}
