<template>
  <SkillTreeMap :closable="true" @close="router.push('/')" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SkillTreeMap from '@/components/SkillTreeMap.vue'

const router = useRouter()
</script>
