<template>
  <div class="k-dialog-overlay">
    <div class="k-dialog-backdrop" />
    <div class="k-dialog-content k-dialog-content--scroll">
      <div class="k-dialog-heading">
        <div class="k-dialog-eyebrow">NÍVEL 2 · UM CAMINHO SE ABRE</div>
        <div class="k-dialog-title">Escolha seu Deus</div>
      </div>
      <div class="class-select-list">
        <div
          v-for="(god, index) in gods"
          :key="god.id"
          class="class-select-card k-dialog-fade-up"
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

const gameStore = useGameStore()

const gods = GODS

const choose = (god: GodDef): void => {
  gameStore.chooseGod(god.id, god.archetype)
}
</script>

<style scoped>
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
</style>
