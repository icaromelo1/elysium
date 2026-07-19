import { Container, Graphics, Text } from 'pixi.js'
import { COLOR } from '../mapDef'

const DAMAGE_NUMBER_LIFETIME_MS = 600
const DAMAGE_NUMBER_RISE_PX = 26
const ATTACK_LINE_LIFETIME_MS = 120

interface DamageNumber {
  text: Text
  elapsedMs: number
  active: boolean
}

interface AttackLine {
  graphic: Graphics
  elapsedMs: number
  active: boolean
}

export class CombatFxLayer {
  container: Container
  private damageNumbers: DamageNumber[] = []
  private attackLines: AttackLine[] = []

  constructor() {
    this.container = new Container()
  }

  spawnDamageNumber(x: number, y: number, amount: number): void {
    let entry = this.damageNumbers.find((item) => !item.active)
    if (!entry) {
      const text = new Text({
        text: '',
        style: { fill: COLOR.ink, fontSize: 18, fontWeight: 'bold' },
      })
      text.anchor.set(0.5)
      this.container.addChild(text)
      entry = { text, elapsedMs: 0, active: false }
      this.damageNumbers.push(entry)
    }

    entry.text.text = `-${Math.round(amount)}`
    entry.text.position.set(x, y)
    entry.text.alpha = 1
    entry.text.visible = true
    entry.elapsedMs = 0
    entry.active = true
  }

  spawnAttackLine(fromX: number, fromY: number, toX: number, toY: number): void {
    let entry = this.attackLines.find((item) => !item.active)
    if (!entry) {
      const graphic = new Graphics()
      this.container.addChild(graphic)
      entry = { graphic, elapsedMs: 0, active: false }
      this.attackLines.push(entry)
    }

    entry.graphic.clear()
    entry.graphic.moveTo(fromX, fromY).lineTo(toX, toY).stroke({ width: 2, color: COLOR.gold })
    entry.graphic.alpha = 0.85
    entry.graphic.visible = true
    entry.elapsedMs = 0
    entry.active = true
  }

  update(deltaMs: number): void {
    for (const entry of this.damageNumbers) {
      if (!entry.active) continue
      entry.elapsedMs += deltaMs
      const progress = Math.min(1, entry.elapsedMs / DAMAGE_NUMBER_LIFETIME_MS)
      entry.text.y -= (DAMAGE_NUMBER_RISE_PX * deltaMs) / DAMAGE_NUMBER_LIFETIME_MS
      entry.text.alpha = 1 - progress
      if (progress >= 1) {
        entry.active = false
        entry.text.visible = false
      }
    }

    for (const entry of this.attackLines) {
      if (!entry.active) continue
      entry.elapsedMs += deltaMs
      const progress = Math.min(1, entry.elapsedMs / ATTACK_LINE_LIFETIME_MS)
      entry.graphic.alpha = 0.85 * (1 - progress)
      if (progress >= 1) {
        entry.active = false
        entry.graphic.visible = false
      }
    }
  }

  clear(): void {
    for (const entry of this.damageNumbers) {
      entry.active = false
      entry.text.visible = false
    }
    for (const entry of this.attackLines) {
      entry.active = false
      entry.graphic.visible = false
    }
  }
}
