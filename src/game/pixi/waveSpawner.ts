const DEFAULT_INTERVAL_MS = 1800

export class WaveSpawner {
  private accumulatorMs = 0

  update(deltaMs: number, spawnFn: () => void, intervalMs: number = DEFAULT_INTERVAL_MS): void {
    this.accumulatorMs += deltaMs
    while (this.accumulatorMs >= intervalMs) {
      this.accumulatorMs -= intervalMs
      spawnFn()
    }
  }
}
