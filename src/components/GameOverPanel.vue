<template>
  <div class="gameover-overlay">
    <div class="gameover-heading">
      <div class="gameover-icon-ring" :style="{ borderColor: reasonColor }">
        <div class="gameover-icon-shape" :style="iconStyle" />
      </div>
      <div class="gameover-label" :style="{ color: reasonColor }">DERROTA</div>
      <div class="gameover-title">{{ reasonTitle }}</div>
      <div class="gameover-subtitle">{{ reasonSubtitle }}</div>
    </div>
    <div class="gameover-stats">
      <div v-for="stat in stats" :key="stat.label" class="gameover-stat-card">
        <div class="gameover-stat-label">{{ stat.label }}</div>
        <div class="gameover-stat-value">{{ stat.value }}</div>
      </div>
    </div>
    <div class="gameover-actions">
      <div class="k-btn-primary gameover-btn" @click="retry">TENTAR NOVAMENTE</div>
      <div class="k-btn-ghost gameover-btn" @click="goToMenu">MENU PRINCIPAL</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/useGameStore'

const gameStore = useGameStore()
const router = useRouter()

const reasonColor = computed(() => (gameStore.gameOverReason === 'hp' ? '#ad5a3c' : '#c9a227'))

const iconStyle = computed(() => {
  if (gameStore.gameOverReason === 'hp') {
    return {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      background: reasonColor.value,
    }
  }
  return {
    width: '26px',
    height: '26px',
    clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
    background: reasonColor.value,
  }
})

const reasonTitle = computed(() =>
  gameStore.gameOverReason === 'hp' ? 'Sua vida chegou a zero' : 'Excesso de vazamentos',
)

const reasonSubtitle = computed(() =>
  gameStore.gameOverReason === 'hp'
    ? 'Os inimigos superaram sua defesa.'
    : `Mais de ${gameStore.leaksLimit} inimigos escaparam pela estrada.`,
)

const formatSurvivalTime = (ms: number): string => {
  const minutes = String(Math.floor(ms / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const stats = computed(() => [
  { label: 'NÍVEL ALCANÇADO', value: gameStore.level },
  { label: 'INIMIGOS DERROTADOS', value: gameStore.enemiesKilled },
  { label: 'TEMPO DE SOBREVIVÊNCIA', value: formatSurvivalTime(gameStore.survivalTimeMs) },
])

const retry = (): void => {
  gameStore.startRun()
}

const goToMenu = (): void => {
  gameStore.backToMenu()
  void router.push('/')
}
</script>

<style scoped>
.gameover-overlay {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 30%, #1a120d 0%, var(--bg) 70%);
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 3vw, 36px);
  padding: 32px 16px;
  box-sizing: border-box;
}

.gameover-heading {
  position: relative;
  text-align: center;
  animation: floatUp 0.5s ease both;
}

.gameover-icon-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gameover-label {
  font-family: 'Cinzel', serif;
  font-size: clamp(12px, 1.4vw, 15px);
  letter-spacing: 5px;
  margin-bottom: 12px;
}

.gameover-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 700;
  margin-bottom: 10px;
}

.gameover-subtitle {
  font-size: clamp(14px, 1.6vw, 16px);
  color: var(--ink-muted);
}

.gameover-stats {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 94vw;
  animation: floatUp 0.5s ease 0.1s both;
}

.gameover-stat-card {
  width: min(220px, 80vw);
  padding: 22px 18px;
  background: var(--panel);
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  text-align: center;
  box-sizing: border-box;
}

.gameover-stat-label {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--ink-muted);
  margin-bottom: 10px;
}

.gameover-stat-value {
  font-family: 'Cinzel', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--gold);
}

.gameover-actions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  animation: floatUp 0.5s ease 0.2s both;
}

.gameover-btn {
  padding: 16px clamp(24px, 4vw, 40px);
  font-size: 16px;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
