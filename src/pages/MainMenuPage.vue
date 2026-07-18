<template>
  <div class="main-menu">
    <div class="main-menu__glyphs">
      <div
        v-for="(glyph, i) in glyphs"
        :key="glyph.shape"
        class="main-menu__glyph"
        :class="`main-menu__glyph--${glyph.shape}`"
        :style="{ background: glyph.color, animationDelay: `${i * 0.4}s` }"
      />
    </div>

    <div class="main-menu__hero">
      <div class="main-menu__title k-title">ELYSIUM</div>
      <div class="main-menu__subtitle">ONDE TODOS OS PANTEÕES SE ENCONTRAM</div>
    </div>

    <div class="main-menu__actions">
      <div class="main-menu__btn main-menu__btn--primary k-btn-primary" @click="onPlay">JOGAR</div>
      <div class="main-menu__btn main-menu__btn--ghost k-btn-ghost" @click="onSettings">CONFIGURAÇÕES</div>
    </div>

    <div class="main-menu__footer">v0.1 · protótipo</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGameStore } from '@/stores/useGameStore'

const router = useRouter()
const $q = useQuasar()
const gameStore = useGameStore()

const glyphs = [
  { shape: 'circle', color: 'var(--gold)' },
  { shape: 'triangle', color: 'var(--danger)' },
  { shape: 'diamond', color: 'var(--player)' },
  { shape: 'pentagon', color: 'var(--purple)' },
  { shape: 'square', color: 'var(--steel)' },
]

const onPlay = (): void => {
  gameStore.startRun()
  router.push('/play')
}

const onSettings = (): void => {
  $q.notify({ type: 'info', message: 'Em breve' })
}
</script>

<style scoped>
.main-menu {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 20%, var(--bg-soft) 0%, var(--bg) 65%);
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 80px 16px 60px;
}

.main-menu__glyphs {
  position: absolute;
  top: clamp(50px, 8vh, 130px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 90vw;
  gap: clamp(20px, 5vw, 56px);
  opacity: 0.4;
}

.main-menu__glyph {
  width: clamp(20px, 3vw, 34px);
  height: clamp(20px, 3vw, 34px);
  animation: drift 5s ease-in-out infinite;
}

.main-menu__glyph--circle {
  border-radius: 50%;
}

.main-menu__glyph--triangle {
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.main-menu__glyph--diamond {
  transform: rotate(45deg);
}

.main-menu__glyph--pentagon {
  clip-path: polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%);
}

.main-menu__glyph--square {
  border-radius: 6px;
}

.main-menu__hero {
  text-align: center;
}

.main-menu__title {
  font-size: clamp(44px, 9vw, 96px);
  font-weight: 700;
  letter-spacing: clamp(3px, 0.8vw, 8px);
  background: linear-gradient(180deg, var(--ink), var(--gold));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.main-menu__subtitle {
  font-size: clamp(13px, 1.6vw, 18px);
  letter-spacing: 3px;
  color: var(--ink-muted);
  margin-top: 8px;
}

.main-menu__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-top: clamp(36px, 7vh, 64px);
}

.main-menu__btn {
  cursor: pointer;
}

.main-menu__btn--primary {
  padding: 20px clamp(40px, 9vw, 76px);
  font-size: 20px;
}

.main-menu__btn--ghost {
  padding: 14px clamp(30px, 7vw, 60px);
  font-size: 14px;
}

.main-menu__footer {
  position: absolute;
  bottom: 20px;
  font-size: 12px;
  color: var(--ink-faint);
  letter-spacing: 1px;
}

@keyframes drift {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-14px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
