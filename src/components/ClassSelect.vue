<template>
  <div class="class-select-overlay">
    <div class="class-select-backdrop" />
    <div class="class-select-content">
      <div class="class-select-heading">
        <div class="class-select-level">NÍVEL 2 · UM CAMINHO SE ABRE</div>
        <div class="class-select-title">Escolha seu Deus</div>
      </div>
      <div class="class-select-list">
        <div
          v-for="(god, index) in gods"
          :key="god.id"
          class="class-select-card"
          :style="{ borderColor: `${god.colorCss}55`, animationDelay: `${index * 100}ms` }"
        >
          <div
            class="class-select-icon"
            :style="{ borderColor: god.colorCss, background: `${god.colorCss}22`, color: god.colorCss }"
          >
            {{ god.name.charAt(0) }}
          </div>
          <div class="class-select-pantheon">{{ god.pantheon }}</div>
          <div class="class-select-name">{{ god.name }}</div>
          <div
            class="class-select-archetype"
            :style="{ background: `${god.colorCss}22`, borderColor: `${god.colorCss}66`, color: god.colorCss }"
          >
            {{ god.archetypeLabel }}
          </div>
          <div class="class-select-description">{{ god.description }}</div>
          <div
            class="class-select-choose"
            :style="{ background: god.colorCss }"
            @click="choose(god)"
          >
            ESCOLHER
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/useGameStore'
import { GODS, type GodDef } from '@/game/gods'

const emit = defineEmits(['close'])

const gameStore = useGameStore()

const gods = GODS

const choose = (god: GodDef): void => {
  gameStore.chooseGod(god.id, god.archetype)
  emit('close')
}
</script>

<style scoped>
.class-select-overlay {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
}

.class-select-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, var(--bg-soft) 0%, var(--bg) 75%);
  filter: blur(3px);
  opacity: 0.65;
}

.class-select-content {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 8, 0.74);
  backdrop-filter: blur(1.5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(20px, 3.5vw, 36px);
  box-sizing: border-box;
  padding: 60px 16px 40px;
  overflow-y: auto;
}

.class-select-heading {
  text-align: center;
}

.class-select-level {
  font-family: 'Cinzel', serif;
  font-size: clamp(12px, 1.4vw, 16px);
  letter-spacing: 6px;
  color: var(--gold);
  margin-bottom: 14px;
}

.class-select-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
}

.class-select-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 94vw;
}

.class-select-card {
  width: min(260px, 80vw);
  padding: 24px 18px;
  background: var(--panel-solid);
  border: 1px solid;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
  animation: floatUp 0.5s ease both;
}

.class-select-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-size: 32px;
  font-weight: 700;
}

.class-select-pantheon {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--ink-muted);
}

.class-select-name {
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 700;
}

.class-select-archetype {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 600;
}

.class-select-description {
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-dim);
  min-height: 60px;
}

.class-select-choose {
  margin-top: 4px;
  width: 100%;
  padding: 12px 0;
  border-radius: 8px;
  color: var(--bg);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
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
