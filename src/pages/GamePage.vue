<template>
  <div class="game-page">
    <div ref="hostEl" class="game-canvas-host" />

    <HUD v-if="gameStore.runState === 'playing'" />
    <SkillCard v-if="gameStore.runState === 'levelup'" @close="onSkillClosed" />
    <ClassSelect v-if="gameStore.runState === 'classselect'" @close="onClassClosed" />
    <ZoneSelect v-if="gameStore.runState === 'zoneselect'" @close="onZoneClosed" />
    <GameOverPanel v-if="gameStore.runState === 'gameover'" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ticker } from 'pixi.js'
import { useGameStore } from '@/stores/useGameStore'
import { MapScene } from '@/game/pixi/scene'
import { PlayerAvatar, type MovementConstraint } from '@/game/pixi/player'
import { EnemyPool, type Enemy } from '@/game/pixi/enemy'
import { CombatTicker, type CombatContext } from '@/game/pixi/combat'
import { CombatFxLayer } from '@/game/pixi/combatFx'
import { WaveSpawner } from '@/game/pixi/waveSpawner'
import { PLAYER_START, NEUTRAL_ZONE, WORLD_H, WORLD_W } from '@/game/mapDef'
import HUD from '@/components/HUD.vue'
import SkillCard from '@/components/SkillCard.vue'
import ClassSelect from '@/components/ClassSelect.vue'
import ZoneSelect from '@/components/ZoneSelect.vue'
import GameOverPanel from '@/components/GameOverPanel.vue'

const MOVE_SPEED = 220
const SPRINT_MULTIPLIER = 2
const ENEMY_SPEED = 70
const ENEMY_HP = 40
const FIRE_INTERVAL_MS = 1000
const DAMAGE_PER_TICK = 10
const IMMOBILE_DAMAGE_MULTIPLIER = 1.5
const XP_PER_KILL = 4
const ENEMY_HIT_PLAYER_DAMAGE = 8
const ENEMY_HIT_RANGE = 40

const gameStore = useGameStore()
const hostEl = ref<HTMLElement | null>(null)

let scene: MapScene | null = null
let player: PlayerAvatar | null = null
let enemyPool: EnemyPool | null = null
let combatTicker: CombatTicker | null = null
let combatFx: CombatFxLayer | null = null
let waveSpawner: WaveSpawner | null = null
let mouseWorldPos: { x: number; y: number } | null = null

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
    gameStore.cycleFireMode()
    return
  }
  if (key === 'tab') {
    event.preventDefault()
    if (scene) {
      scene.setFreeMode(!scene.isFreeMode())
    }
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
  scene?.follow(player.x, player.y)
}

function spawnEnemy(): void {
  if (!enemyPool || !scene) return
  const enemy = enemyPool.spawn(ENEMY_HP)
  scene.addEntity(enemy.root)
}

function handleHit(target: Enemy, damage: number): void {
  if (!enemyPool || !player) return
  combatFx?.spawnAttackLine(player.x, player.y, target.x, target.y)
  combatFx?.spawnDamageNumber(target.x, target.y, damage)
  enemyPool.applyDamage(target, damage)
  if (target.hp <= 0) {
    enemyPool.despawn(target)
    gameStore.registerKill()
    gameStore.addXp(XP_PER_KILL)
  }
}

function applyEnemyContactDamage(deltaMs: number): void {
  if (!player || !enemyPool) return
  for (const enemy of enemyPool.activeEnemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance <= ENEMY_HIT_RANGE) {
      gameStore.takeDamage((ENEMY_HIT_PLAYER_DAMAGE * deltaMs) / 1000)
    }
  }
}

function movementConstraint(): MovementConstraint {
  const zone = gameStore.zone
  if (zone === 'neutra') {
    return { kind: 'neutral' }
  }
  return { kind: 'zone', side: zone, canCross: gameStore.archetype === 'nomade-entre-zonas' }
}

function onTick(deltaMs: number): void {
  if (!scene || !player || !enemyPool || !combatTicker || !waveSpawner || !combatFx) return

  if (gameStore.runState !== 'playing') {
    return
  }

  const { dx, dy } = movementInput()
  const wantsSprint = pressedKeys.has('shift') && (dx !== 0 || dy !== 0)
  const sprintActive = gameStore.updateStamina(deltaMs, wantsSprint)
  if (dx !== 0 || dy !== 0) {
    const step = (MOVE_SPEED * (sprintActive ? SPRINT_MULTIPLIER : 1) * deltaMs) / 1000
    player.move(dx * step, dy * step, movementConstraint())
  }

  if (!scene.isFreeMode()) {
    scene.follow(player.x, player.y)
  }

  enemyPool.update(deltaMs, () => gameStore.addLeak(), ENEMY_SPEED)

  const ctx: CombatContext = {
    player,
    enemies: enemyPool.activeEnemies,
    fireMode: gameStore.fireMode,
    range: NEUTRAL_ZONE.radius,
    damagePerTick: gameStore.archetype === 'imovel' ? DAMAGE_PER_TICK * IMMOBILE_DAMAGE_MULTIPLIER : DAMAGE_PER_TICK,
    fireIntervalMs: FIRE_INTERVAL_MS,
    mouseWorldPos,
  }
  combatTicker.update(deltaMs, ctx, handleHit)
  player.setRange(ctx.range)

  applyEnemyContactDamage(deltaMs)
  waveSpawner.update(deltaMs, spawnEnemy)
  gameStore.tickSurvivalTime(deltaMs)
  combatFx.update(deltaMs)
}

function onSkillClosed(): void {
  gameStore.acknowledgeSkill()
}

function onClassClosed(): void {}

function onZoneClosed(): void {}

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
