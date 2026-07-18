<template>
  <div class="skill-card-overlay">
    <div class="skill-card-backdrop" />
    <div class="skill-card-content">
      <div class="skill-card-heading">
        <div class="skill-card-level">NÍVEL {{ gameStore.level }} ALCANÇADO</div>
        <div class="skill-card-title">Escolha uma Habilidade</div>
      </div>
      <div class="skill-card-list">
        <div
          v-for="card in skills"
          :key="card.name"
          class="skill-card"
          :style="{ borderColor: card.border }"
          @click="confirm"
        >
          <div
            class="skill-card-icon"
            :style="{ background: card.iconBg, borderColor: card.accent }"
          >
            <div class="skill-card-icon-shape" :style="[card.iconShape, { background: card.accent }]" />
          </div>
          <div class="skill-card-rarity" :style="{ color: card.accent }">{{ card.rarity }}</div>
          <div class="skill-card-name">{{ card.name }}</div>
          <div class="skill-card-description">{{ card.description }}</div>
          <div class="skill-card-effect" :style="{ color: card.accent }">{{ card.effect }}</div>
          <div class="skill-card-choose" :style="{ background: card.accent }">ESCOLHER</div>
        </div>
      </div>
      <div class="skill-card-hint">
        use <span class="skill-card-key">↵</span> ou clique para confirmar
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/useGameStore'

const emit = defineEmits(['close'])

const gameStore = useGameStore()

const skills = [
  {
    name: 'Fúria de Ares',
    description: 'Aumenta o dano do ataque básico.',
    effect: '+18% dano',
    iconShape: { clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' },
    rarity: 'COMUM',
    accent: '#c9a227',
    iconBg: 'rgba(201,162,39,0.12)',
    border: 'rgba(201,162,39,0.35)',
  },
]

const confirm = (): void => {
  gameStore.acknowledgeSkill()
  emit('close')
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    confirm()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.skill-card-overlay {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
}

.skill-card-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, var(--bg-soft) 0%, var(--bg) 75%);
  filter: blur(3px);
  opacity: 0.65;
}

.skill-card-content {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 8, 0.74);
  backdrop-filter: blur(1.5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 4vw, 44px);
  box-sizing: border-box;
  padding: 32px 16px;
}

.skill-card-heading {
  text-align: center;
}

.skill-card-level {
  font-family: 'Cinzel', serif;
  font-size: clamp(12px, 1.4vw, 16px);
  letter-spacing: 6px;
  color: var(--gold);
  margin-bottom: 14px;
}

.skill-card-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
}

.skill-card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 36px;
  max-width: 94vw;
}

.skill-card {
  width: min(320px, 86vw);
  padding: 32px 26px;
  background: var(--panel-solid);
  border: 1px solid;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
  animation: floatUp 0.5s ease both;
  cursor: pointer;
}

.skill-card-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-card-icon-shape {
  width: 34px;
  height: 34px;
}

.skill-card-rarity {
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
}

.skill-card-name {
  font-family: 'Cinzel', serif;
  font-size: 24px;
  font-weight: 700;
}

.skill-card-description {
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink-dim);
  min-height: 66px;
}

.skill-card-effect {
  padding: 8px 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-faint);
  font-size: 15px;
  font-weight: 600;
}

.skill-card-choose {
  margin-top: 8px;
  width: 100%;
  padding: 14px 0;
  border-radius: 8px;
  color: var(--bg);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
  cursor: pointer;
}

.skill-card-hint {
  font-size: 13px;
  color: var(--ink-faint);
}

.skill-card-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin: 0 3px;
  border-radius: 5px;
  background: var(--panel-solid);
  border: 1px solid var(--border-faint);
  font-weight: 700;
  color: var(--ink);
  font-size: 11px;
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
