import { createRouter, createWebHistory } from 'vue-router'
import MainMenuPage from '@/pages/MainMenuPage.vue'
import GamePage from '@/pages/GamePage.vue'
import SkillTreeMapPage from '@/pages/SkillTreeMapPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: MainMenuPage },
    { path: '/play', component: GamePage },
    { path: '/skills', component: SkillTreeMapPage },
  ],
})

export default router
