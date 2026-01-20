<template>
  <svg id="gradients">
    <defs>
      <radialGradient id="townsfolk">
        <stop offset="0%" stop-color="#1f65ff" />
        <stop offset="100%" stop-color="#0a2155" />
      </radialGradient>
      <radialGradient id="outsider">
        <stop offset="0%" stop-color="#46d5ff" />
        <stop offset="100%" stop-color="#0a4a55" />
      </radialGradient>
      <radialGradient id="minion">
        <stop offset="0%" stop-color="#ff6900" />
        <stop offset="100%" stop-color="#552a0a" />
      </radialGradient>
      <radialGradient id="demon">
        <stop offset="0%" stop-color="#ce0100" />
        <stop offset="100%" stop-color="#550a0a" />
      </radialGradient>
      <radialGradient id="traveler">
        <stop offset="0%" stop-color="#cc04ff" />
        <stop offset="100%" stop-color="#440a55" />
      </radialGradient>
      <radialGradient id="fabled">
        <stop offset="0%" stop-color="#ffe91f" />
        <stop offset="100%" stop-color="#554a0a" />
      </radialGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
// SVG gradients for role tokens
</script>

<style scoped>
#gradients {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
