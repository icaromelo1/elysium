<template>
  <div class="game-page">
    <div ref="hostEl" class="game-canvas-host" />

    <HUD v-if="gameStore.runState === 'playing'" />
    <SkillCard v-if="gameStore.runState === 'levelup'" @close="onSkillClosed" />
    <ClassSelect v-if="gameStore.runState === 'classselect'" @close="onClassClosed" />
    <ZoneSelect v-if="gameStore.runState === 'zoneselect'" @close="onZoneClosed" />
    <ForkSelect
      v-if="gameStore.runState === 'fork-range'"
      eyebrow="NÍVEL 6 · UM CAMINHO SE ABRE"
      title="Melee ou Projétil?"
      :options="RANGE_OPTIONS"
      @choose="(value) => onForkChosen('range', value)"
    />
    <ForkSelect
      v-if="gameStore.runState === 'fork-damage'"
      eyebrow="NÍVEL 10 · UM CAMINHO SE ABRE"
      title="Físico ou Mágico?"
      :options="DAMAGE_OPTIONS"
      @choose="(value) => onForkChosen('damage', value)"
    />
    <ForkSelect
      v-if="gameStore.runState === 'fork-role'"
      eyebrow="NÍVEL 15 · UM CAMINHO SE ABRE"
      title="Qual seu papel em combate?"
      :options="ROLE_OPTIONS"
      @choose="(value) => onForkChosen('role', value)"
    />
    <ForkSelect
      v-if="gameStore.runState === 'capstone'"
      eyebrow="NÍVEL 20 · CAPSTONE"
      title="Sua habilidade definidora"
      :options="capstoneOptions"
      @choose="onCapstoneChosen"
    />
    <GameOverPanel v-if="gameStore.runState === 'gameover'" />
    <SkillTreeMap v-if="showSkillMap" @close="showSkillMap = false" />
    <AdminPanel v-if="showAdminPanel" @close="showAdminPanel = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ticker } from 'pixi.js'
import { useGameStore } from '@/stores/useGameStore'
import type { ForkAxis } from '@/stores/useGameStore'
import { useTunablesStore } from '@/stores/useTunablesStore'
import { MapScene } from '@/game/pixi/scene'
import { PlayerAvatar, type MovementConstraint } from '@/game/pixi/player'
import { EnemyPool, type Enemy } from '@/game/pixi/enemy'
import { CombatTicker, type CombatContext } from '@/game/pixi/combat'
import { CombatFxLayer } from '@/game/pixi/combatFx'
import { WaveSpawner } from '@/game/pixi/waveSpawner'
import { PLAYER_START, WORLD_H, WORLD_W } from '@/game/mapDef'
import { CAPSTONES, SKILL_NODES, capstoneNameFor, type DamageType, type Role, type WeaponRange } from '@/game/skillTree'
import ForkSelect, { type ForkOption } from '@/components/ForkSelect.vue'
import {
  activateUltimateIfReady,
  auraShieldPercent,
  comboDamageBonusPercent,
  createEffectsState,
  equipNode,
  pierceExtraTargets as effectsPierceExtraTargets,
  registerKill as registerEffectKill,
  resetCombo,
  resolveOnHit,
  statMultiplier,
  tick as tickEffects,
  tryDash,
  type EffectSpec,
  type PlayerEffectsState,
} from '@/game/effects'
import HUD from '@/components/HUD.vue'
import SkillCard from '@/components/SkillCard.vue'
import ClassSelect from '@/components/ClassSelect.vue'
import ZoneSelect from '@/components/ZoneSelect.vue'
import GameOverPanel from '@/components/GameOverPanel.vue'
import SkillTreeMap from '@/components/SkillTreeMap.vue'
import AdminPanel from '@/components/AdminPanel.vue'

const IMMOBILE_DAMAGE_MULTIPLIER = 1.5
const XP_PER_KILL = 4
const SUMMON_TARGET_RANGE = 400
const ULTIMATE_AOE_RADIUS = 150

const RANGE_OPTIONS: ForkOption[] = [
  { value: 'melee', label: 'Melee', description: 'Combate corpo a corpo, alcance curto.' },
  { value: 'projetil', label: 'Projétil', description: 'Combate à distância, 3 modos de mira.' },
]
const DAMAGE_OPTIONS: ForkOption[] = [
  { value: 'fisico', label: 'Físico', description: 'Dano bruto, sangramento, quebra de armadura.' },
  { value: 'magico', label: 'Mágico', description: 'Dano arcano, queimaduras, efeitos elementais.' },
]
const ROLE_OPTIONS: ForkOption[] = [
  { value: 'ofensivo', label: 'Ofensivo', description: 'Foco total em causar dano.' },
  { value: 'defensivo', label: 'Defensivo', description: 'Foco em sobreviver e absorver dano.' },
  { value: 'suporte', label: 'Suporte', description: 'Foco em cura, invocações e buffs.' },
]

const gameStore = useGameStore()
const tunables = useTunablesStore()
const hostEl = ref<HTMLElement | null>(null)
const showSkillMap = ref(false)
const showAdminPanel = ref(false)

const capstoneOptions = computed<ForkOption[]>(() => {
  if (!gameStore.archetypeId) return []
  const capstone = CAPSTONES[gameStore.archetypeId]
  return [
    {
      value: gameStore.archetypeId,
      label: capstoneNameFor(gameStore.archetypeId, gameStore.chosenGodId),
      description: capstone.effect.kind === 'ultimate-window' ? `Por ${capstone.effect.durationMs / 1000}s, seu ataque ganha poder supremo.` : '',
    },
  ]
})

let scene: MapScene | null = null
let player: PlayerAvatar | null = null
let enemyPool: EnemyPool | null = null
let combatTicker: CombatTicker | null = null
let combatFx: CombatFxLayer | null = null
let waveSpawner: WaveSpawner | null = null
let mouseWorldPos: { x: number; y: number } | null = null
let effectsState: PlayerEffectsState = createEffectsState()

const pressedKeys = new Set<string>()

function isTextInputTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

function onKeyDown(event: KeyboardEvent): void {
  if (isTextInputTarget(event.target)) return
  const key = event.key.toLowerCase()
  if (key === 'q') {
    if (gameStore.weaponRange === 'projetil') {
      gameStore.cycleFireMode()
    }
    return
  }
  if (key === 'tab') {
    event.preventDefault()
    if (scene) {
      scene.setFreeMode(!scene.isFreeMode())
    }
    return
  }
  if (key === 'm') {
    showSkillMap.value = !showSkillMap.value
    return
  }
  if (event.code === 'Backquote') {
    showAdminPanel.value = !showAdminPanel.value
    return
  }
  pressedKeys.add(key)
}

function onKeyUp(event: KeyboardEvent): void {
  pressedKeys.delete(event.key.toLowerCase())
}

function onWindowBlur(): void {
  pressedKeys.clear()
}

function onPointerMove(event: PointerEvent): void {
  if (!scene || !hostEl.value) return
  const rect = hostEl.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  const scaleX = scene.world.scale.x
  const scaleY = scene.world.scale.y
  if (!scaleX || !scaleY) return
  mouseWorldPos = {
    x: (screenX - scene.world.position.x) / scaleX,
    y: (screenY - scene.world.position.y) / scaleY,
  }
}

function onWindowResize(): void {
  scene?.fitToViewport()
}

function movementInput(): { dx: number; dy: number } {
  if (gameStore.archetype === 'imovel') return { dx: 0, dy: 0 }
  let x = 0
  let y = 0
  if (pressedKeys.has('w') || pressedKeys.has('arrowup')) y -= 1
  if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) y += 1
  if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) x -= 1
  if (pressedKeys.has('d') || pressedKeys.has('arrowright')) x += 1
  if (x === 0 && y === 0) return { dx: 0, dy: 0 }
  const magnitude = Math.sqrt(x * x + y * y)
  return { dx: x / magnitude, dy: y / magnitude }
}

function resetGameplayState(): void {
  if (!enemyPool || !player) return
  for (const enemy of [...enemyPool.activeEnemies]) {
    enemyPool.despawn(enemy)
  }
  player.x = PLAYER_START.x
  player.y = PLAYER_START.y
  player.facing = { x: 0, y: 1 }
  player.root.position.set(player.x, player.y)
  combatTicker = new CombatTicker()
  combatFx?.clear()
  waveSpawner = new WaveSpawner()
  effectsState = createEffectsState()
  syncEquippedSkills()
  scene?.follow(player.x, player.y)
}

function spawnEnemy(): void {
  if (!enemyPool || !scene) return
  const enemy = enemyPool.spawn(tunables.enemyHp)
  scene.addEntity(enemy.root)
}

function checkDeath(target: Enemy): void {
  if (!enemyPool) return
  if (target.hp <= 0) {
    enemyPool.despawn(target)
    gameStore.registerKill()
    registerEffectKill(effectsState)
    gameStore.addXp(XP_PER_KILL)
  }
}

function applyRawDamage(target: Enemy, damage: number): void {
  if (!enemyPool) return
  enemyPool.applyDamage(target, damage)
  checkDeath(target)
}

function applyBurst(originX: number, originY: number, radius: number, damage: number): void {
  if (!enemyPool) return
  for (const enemy of [...enemyPool.activeEnemies]) {
    const dx = enemy.x - originX
    const dy = enemy.y - originY
    if (Math.sqrt(dx * dx + dy * dy) <= radius) {
      combatFx?.spawnDamageNumber(enemy.x, enemy.y, damage)
      applyRawDamage(enemy, damage)
    }
  }
}

function handleHit(target: Enemy, damage: number, isPrimary: boolean): void {
  if (!enemyPool || !player) return
  combatFx?.spawnAttackLine(player.x, player.y, target.x, target.y)
  combatFx?.spawnDamageNumber(target.x, target.y, damage)
  enemyPool.applyDamage(target, damage)

  if (isPrimary) {
    const outcome = resolveOnHit(effectsState, damage, false)
    if (outcome.stunDurationMs) enemyPool.applyStun(target, outcome.stunDurationMs)
    if (outcome.shred) enemyPool.applyShred(target, outcome.shred.percent, outcome.shred.durationMs)
    if (outcome.dot) enemyPool.applyDot(target, outcome.dot.damagePerTick, outcome.dot.durationMs, outcome.dot.tickMs)
    let lifestealHeal = outcome.lifestealHeal
    if (effectsState.ultimateRemainingMs > 0 && effectsState.ultimateGrants.includes('lifesteal-boost')) {
      lifestealHeal += damage * 0.2
    }
    if (lifestealHeal > 0) gameStore.heal(lifestealHeal)
    for (let i = 0; i < outcome.extraHits; i += 1) {
      combatFx?.spawnDamageNumber(target.x, target.y, damage)
      applyRawDamage(target, damage)
    }
    if (outcome.burst) {
      applyBurst(target.x, target.y, outcome.burst.radius, damage * (outcome.burst.damagePercent / 100))
    }
    if (effectsState.ultimateRemainingMs > 0) {
      const aoe = effectsState.ultimateGrants.includes('aoe-melee') || effectsState.ultimateGrants.includes('aoe-ranged')
      if (aoe) applyBurst(target.x, target.y, ULTIMATE_AOE_RADIUS, damage * 0.5)
    }
  }

  checkDeath(target)
}

function applyEnemyContactDamage(deltaMs: number): void {
  if (!player || !enemyPool) return
  const shieldPercent = auraShieldPercent(effectsState)
  for (const enemy of enemyPool.activeEnemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance <= tunables.enemyContactRange) {
      const raw = (tunables.enemyContactDamage * deltaMs) / 1000
      gameStore.takeDamage(raw * (1 - shieldPercent / 100))
    }
  }
}

function syncEquippedSkills(): void {
  effectsState = createEffectsState()
  for (const id of gameStore.chosenSkillIds) {
    if (id.startsWith('capstone:')) {
      const archId = id.slice('capstone:'.length) as keyof typeof CAPSTONES
      const capstone = CAPSTONES[archId]
      if (capstone) equipNode(effectsState, id, capstone.effect)
      continue
    }
    const node = SKILL_NODES.find((n) => n.id === id)
    if (node) equipNode(effectsState, id, node.effect)
  }
  const newMaxHp = tunables.maxHp * statMultiplier(effectsState, 'maxHp')
  gameStore.setMaxHp(newMaxHp)
}

function capstoneEffectFor(): EffectSpec | null {
  if (!gameStore.archetypeId) return null
  return CAPSTONES[gameStore.archetypeId]?.effect ?? null
}

function movementConstraint(): MovementConstraint {
  const zone = gameStore.zone
  if (zone === 'neutra') {
    return { kind: 'neutral' }
  }
  return { kind: 'zone', side: zone, canCross: gameStore.archetype === 'nomade-entre-zonas' }
}

function nearestEnemyWithin(range: number): Enemy | null {
  if (!player || !enemyPool) return null
  let closest: Enemy | null = null
  let closestDistance = Infinity
  for (const enemy of enemyPool.activeEnemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance <= range && distance < closestDistance) {
      closest = enemy
      closestDistance = distance
    }
  }
  return closest
}

function onTick(deltaMs: number): void {
  if (!scene || !player || !enemyPool || !combatTicker || !waveSpawner || !combatFx) return

  if (gameStore.runState !== 'playing') {
    return
  }

  const scaledDeltaMs = deltaMs * gameStore.gameSpeed

  const damageMultiplier =
    statMultiplier(effectsState, 'damage') *
    (1 + comboDamageBonusPercent(effectsState) / 100) *
    (gameStore.affinityAligned ? tunables.affinityMultiplier : 1) *
    (effectsState.ultimateRemainingMs > 0 && effectsState.ultimateGrants.includes('damage-boost') ? 1.3 : 1)
  const moveSpeedMultiplier = statMultiplier(effectsState, 'moveSpeed')
  const attackSpeedMultiplier = statMultiplier(effectsState, 'attackSpeed')
  const rangeMultiplier = statMultiplier(effectsState, 'range')

  gameStore.setLiveStats({ damageMultiplier, moveSpeedMultiplier, attackSpeedMultiplier, rangeMultiplier })

  const { dx, dy } = movementInput()
  const wantsSprint = pressedKeys.has('shift') && (dx !== 0 || dy !== 0)
  const sprintActive = gameStore.updateStamina(scaledDeltaMs, wantsSprint)
  if (dx !== 0 || dy !== 0) {
    const step = (tunables.moveSpeed * moveSpeedMultiplier * (sprintActive ? tunables.sprintMultiplier : 1) * scaledDeltaMs) / 1000
    player.move(dx * step, dy * step, movementConstraint())
  }

  if (!scene.isFreeMode()) {
    scene.follow(player.x, player.y)
  }

  enemyPool.update(scaledDeltaMs, () => gameStore.addLeak(), tunables.enemySpeed, (enemy, damage) => {
    combatFx?.spawnDamageNumber(enemy.x, enemy.y, damage)
    applyRawDamage(enemy, damage)
  })

  const isMelee = gameStore.weaponRange !== 'projetil'
  const baseRange = isMelee ? tunables.meleeRange : tunables.projectileRange
  const range = baseRange * rangeMultiplier

  const ctx: CombatContext = {
    player,
    enemies: enemyPool.activeEnemies,
    fireMode: isMelee ? 'auto' : gameStore.fireMode,
    range,
    damagePerTick:
      tunables.damagePerTick * damageMultiplier * (gameStore.archetype === 'imovel' ? IMMOBILE_DAMAGE_MULTIPLIER : 1),
    fireIntervalMs: tunables.fireIntervalMs / attackSpeedMultiplier,
    mouseWorldPos,
  }
  combatTicker.update(scaledDeltaMs, ctx, handleHit, effectsPierceExtraTargets(effectsState), () => resetCombo(effectsState))
  player.setRange(ctx.range)

  if (isMelee && !nearestEnemyWithin(range)) {
    const dash = tryDash(effectsState)
    if (dash) {
      const target = nearestEnemyWithin(dash.range)
      if (target) {
        player.move(target.x - player.x, target.y - player.y, movementConstraint())
      }
    }
  }

  activateUltimateIfReady(effectsState, capstoneEffectFor())

  const tickResult = tickEffects(effectsState, scaledDeltaMs)
  if (tickResult.selfHealPercent) {
    gameStore.heal(gameStore.maxHp * (tickResult.selfHealPercent / 100))
  }
  if (tickResult.summonDamage) {
    const target = nearestEnemyWithin(SUMMON_TARGET_RANGE)
    if (target) {
      combatFx.spawnDamageNumber(target.x, target.y, tickResult.summonDamage)
      applyRawDamage(target, tickResult.summonDamage)
    }
  }

  applyEnemyContactDamage(scaledDeltaMs)
  waveSpawner.update(scaledDeltaMs, spawnEnemy, tunables.waveSpawnIntervalMs)
  gameStore.tickSurvivalTime(scaledDeltaMs)
  combatFx.update(scaledDeltaMs)
}

function onSkillClosed(): void {}

function onClassClosed(): void {}

function onZoneClosed(): void {}

function onForkChosen(axis: ForkAxis, value: string): void {
  gameStore.chooseFork(axis, value as WeaponRange | DamageType | Role)
}

function onCapstoneChosen(): void {
  gameStore.chooseCapstone()
}

watch(
  () => gameStore.runState,
  (next, prev) => {
    if (prev === 'gameover' && next === 'playing') {
      resetGameplayState()
    }
    if (next === 'zoneselect') {
      scene?.follow(WORLD_W / 2, WORLD_H / 2)
    }
  },
)

watch(
  () => gameStore.chosenSkillIds.length,
  () => syncEquippedSkills(),
)

watch(
  () => gameStore.zone,
  (zone) => scene?.setNeutralZoneVisible(zone === 'neutra'),
)

onMounted(async () => {
  if (!hostEl.value) return

  scene = new MapScene()
  await scene.init(hostEl.value)
  player = new PlayerAvatar(PLAYER_START.x, PLAYER_START.y)
  scene.addEntity(player.root)
  enemyPool = new EnemyPool()
  combatTicker = new CombatTicker()
  combatFx = new CombatFxLayer()
  scene.addEntity(combatFx.container)
  waveSpawner = new WaveSpawner()

  scene.fitToViewport()
  scene.follow(player.x, player.y)

  scene.app.ticker.add((ticker: Ticker) => {
    onTick(ticker.deltaMS)
  })

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('resize', onWindowResize)
  hostEl.value.addEventListener('pointermove', onPointerMove)

  if (gameStore.runState === 'menu') {
    gameStore.startRun()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', onWindowBlur)
  window.removeEventListener('resize', onWindowResize)
  hostEl.value?.removeEventListener('pointermove', onPointerMove)
  player?.destroy()
  scene?.destroy()
  scene = null
  player = null
  enemyPool = null
  combatTicker = null
  combatFx = null
  waveSpawner = null
})
</script>

<style scoped>
.game-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.game-canvas-host {
  position: absolute;
  inset: 0;
}
</style>
