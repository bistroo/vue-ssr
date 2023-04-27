<script setup lang="ts">
import { onServerPrefetch } from 'vue'
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()

onServerPrefetch(() => {
  store.increment()
})
</script>

<template>
  {{ store.count }}

  <button @click="store.increment">Increment</button>
</template>
