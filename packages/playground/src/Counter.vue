<script setup lang="ts">
import { onServerPrefetch, ref } from 'vue'

const counter = ref(0)

onServerPrefetch(() => {
  console.log('hi from server')
})
</script>

<template>
  {{ counter }}

  <button @click="counter++">Increment</button>
</template>
