const DEFAULT_INTERVAL_MS = 1800

export class WaveSpawner {
  private accumulatorMs = 0
  private intervalMs: number

  constructor(intervalMs?: number) {
    this.intervalMs = intervalMs ?? DEFAULT_INTERVAL_MS
  }

  update(deltaMs: number, spawnFn: () => void): void {
    this.accumulatorMs += deltaMs
    while (this.accumulatorMs >= this.intervalMs) {
      this.accumulatorMs -= this.intervalMs
      spawnFn()
    }
  }
}
