import type { Point } from '../mapDef'

export interface Fillet {
  tangentIn: Point
  tangentOut: Point
  center: Point
  startAngle: number
  endAngle: number
  clockwise: boolean
}

export interface Stamp {
  x: number
  y: number
  angle: number
}

const EPSILON = 1e-6

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y }
}

function length(v: Point): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

function normalize(v: Point): Point {
  const len = length(v)
  if (len < EPSILON) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y }
}

function scale(v: Point, s: number): Point {
  return { x: v.x * s, y: v.y * s }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function computeFillet(prev: Point, corner: Point, next: Point, radius: number): Fillet {
  const v1 = normalize(sub(prev, corner))
  const v2 = normalize(sub(next, corner))
  const theta = Math.acos(clamp(dot(v1, v2), -1, 1))

  if (theta < EPSILON || theta > Math.PI - EPSILON) {
    return {
      tangentIn: corner,
      tangentOut: corner,
      center: corner,
      startAngle: 0,
      endAngle: 0,
      clockwise: true,
    }
  }

  let t = radius / Math.tan(theta / 2)
  const legPrev = length(sub(corner, prev))
  const legNext = length(sub(corner, next))
  const maxT = Math.min(legPrev, legNext) / 2

  let effectiveRadius = radius
  if (t > maxT) {
    t = maxT
    effectiveRadius = t * Math.tan(theta / 2)
  }

  const tangentIn = add(corner, scale(v1, t))
  const tangentOut = add(corner, scale(v2, t))

  const bisector = normalize(add(v1, v2))
  const distToCenter = effectiveRadius / Math.sin(theta / 2)
  const center = add(corner, scale(bisector, distToCenter))

  const startAngle = Math.atan2(tangentIn.y - center.y, tangentIn.x - center.x)
  const endAngle = Math.atan2(tangentOut.y - center.y, tangentOut.x - center.x)

  // The fillet always sweeps the "short way" (its arc angle is π - theta, always < π),
  // so the sign of the shortest angular delta from start to end tells us the true
  // sweep direction — more reliable than the raw cross-product sign, which can come
  // out inverted depending on how startAngle/endAngle land relative to the branch cut.
  let delta = endAngle - startAngle
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  const clockwise = delta < 0

  return { tangentIn, tangentOut, center, startAngle, endAngle, clockwise }
}

function walkStraight(a: Point, b: Point, spacing: number, out: Stamp[]): void {
  const dist = length(sub(b, a))
  const angle = Math.atan2(b.y - a.y, b.x - a.x)
  if (dist < EPSILON) return
  const steps = Math.floor(dist / spacing)
  for (let i = 0; i <= steps; i += 1) {
    const d = i * spacing
    if (d >= dist) break
    out.push({ x: a.x + (b.x - a.x) * (d / dist), y: a.y + (b.y - a.y) * (d / dist), angle })
  }
}

function walkArc(fillet: Fillet, spacing: number, out: Stamp[]): void {
  const { center, tangentIn, startAngle, endAngle, clockwise } = fillet
  // Radius may have been clamped inside computeFillet, so derive it from the
  // actual center/tangent distance rather than trusting the caller's value.
  const radius = length(sub(tangentIn, center))
  let sweep = endAngle - startAngle
  if (clockwise) {
    while (sweep > 0) sweep -= Math.PI * 2
  } else {
    while (sweep < 0) sweep += Math.PI * 2
  }

  const arcLength = Math.abs(sweep) * radius
  const angularStep = spacing / radius
  const steps = Math.max(1, Math.floor(arcLength / spacing))

  for (let i = 0; i < steps; i += 1) {
    const angleAtual = startAngle + (clockwise ? -1 : 1) * angularStep * i
    const x = center.x + radius * Math.cos(angleAtual)
    const y = center.y + radius * Math.sin(angleAtual)
    // Tangent to the circle at this angle: perpendicular to the radius, oriented by travel direction.
    const stampAngle = clockwise ? angleAtual - Math.PI / 2 : angleAtual + Math.PI / 2
    out.push({ x, y, angle: stampAngle })
  }
}

export function buildPathStamps(points: Point[], radius: number, spacing: number): Stamp[] {
  const stamps: Stamp[] = []
  if (points.length < 2) return stamps

  let anchor = points[0]
  if (!anchor) return stamps

  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1]
    const corner = points[i]
    const next = points[i + 1]
    if (!prev || !corner || !next) continue

    const fillet = computeFillet(prev, corner, next, radius)

    if (fillet.tangentIn.x === fillet.tangentOut.x && fillet.tangentIn.y === fillet.tangentOut.y) {
      continue
    }

    walkStraight(anchor, fillet.tangentIn, spacing, stamps)
    walkArc(fillet, spacing, stamps)
    anchor = fillet.tangentOut
  }

  const last = points[points.length - 1]
  if (!last) return stamps

  walkStraight(anchor, last, spacing, stamps)
  const prevStamp = stamps[stamps.length - 1]
  const finalAngle = prevStamp ? prevStamp.angle : 0
  stamps.push({ x: last.x, y: last.y, angle: finalAngle })

  return stamps
}
