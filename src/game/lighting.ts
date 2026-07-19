export type TimeOfDay = 'amanhecer' | 'dia' | 'tarde' | 'entardecer' | 'noite'

export const STAGE_ORDER: TimeOfDay[] = ['amanhecer', 'dia', 'tarde', 'entardecer', 'noite']

export const CYCLE_STAGE_DURATION_MS = 3 * 60 * 1000

export interface LightingPreset {
  tintColor: number
  tintAlpha: number
  sunAngleDeg: number
  shadowStrength: number
}

export const LIGHTING_PRESETS: Record<TimeOfDay, LightingPreset> = {
  amanhecer: { tintColor: 0xffc896, tintAlpha: 0.35, sunAngleDeg: 20, shadowStrength: 1 },
  dia: { tintColor: 0xffffff, tintAlpha: 0.05, sunAngleDeg: 90, shadowStrength: 0.3 },
  tarde: { tintColor: 0xffe1b4, tintAlpha: 0.2, sunAngleDeg: 110, shadowStrength: 0.6 },
  entardecer: { tintColor: 0xc1592f, tintAlpha: 0.4, sunAngleDeg: 160, shadowStrength: 1 },
  noite: { tintColor: 0x14193c, tintAlpha: 0.72, sunAngleDeg: 200, shadowStrength: 0 },
}

export const MAP_TIME_OF_DAY: Record<string, TimeOfDay> = {
  'grecia-romana': 'dia',
}

export interface LightingState {
  tintColor: number
  tintAlpha: number
  sunAngleDeg: number
  shadowStrength: number
}

function lerpColor(colorA: number, colorB: number, t: number): number {
  const rA = (colorA >> 16) & 0xff
  const gA = (colorA >> 8) & 0xff
  const bA = colorA & 0xff
  const rB = (colorB >> 16) & 0xff
  const gB = (colorB >> 8) & 0xff
  const bB = colorB & 0xff
  const r = Math.round(rA + (rB - rA) * t)
  const g = Math.round(gA + (gB - gA) * t)
  const b = Math.round(bA + (bB - bA) * t)
  return (r << 16) | (g << 8) | b
}

export function computeLightingState(survivalTimeMs: number): LightingState {
  const totalStageProgress = survivalTimeMs / CYCLE_STAGE_DURATION_MS
  const stageIndex = Math.min(Math.floor(totalStageProgress), STAGE_ORDER.length - 1)
  const nextIndex = Math.min(stageIndex + 1, STAGE_ORDER.length - 1)
  const t = stageIndex === STAGE_ORDER.length - 1 ? 1 : totalStageProgress - stageIndex

  const presetA = LIGHTING_PRESETS[STAGE_ORDER[stageIndex]]
  const presetB = LIGHTING_PRESETS[STAGE_ORDER[nextIndex]]

  return {
    tintColor: lerpColor(presetA.tintColor, presetB.tintColor, t),
    tintAlpha: presetA.tintAlpha + (presetB.tintAlpha - presetA.tintAlpha) * t,
    sunAngleDeg: presetA.sunAngleDeg + (presetB.sunAngleDeg - presetA.sunAngleDeg) * t,
    shadowStrength: presetA.shadowStrength + (presetB.shadowStrength - presetA.shadowStrength) * t,
  }
}
