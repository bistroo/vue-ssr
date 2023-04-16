<script setup lang="ts">
import { onServerPrefetch, ref } from 'vue'

const counter = ref(2)

onServerPrefetch(() => {
  console.log('hi from server')
})
</script>

<template>
  {{ counter }}11

  <button @click="counter++">Increment1</button>
</template>
