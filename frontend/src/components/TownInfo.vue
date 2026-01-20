<template>
  <div id="towninfo">
    <h2>{{ edition.name }}</h2>
    <div class="player-count">
      {{ players.length }} Players
      <span v-if="players.length < minPlayers"> (need {{ minPlayers - players.length }} more)</span>
    </div>
    <div class="team-counts">
      <span class="townsfolk">{{ counts.townsfolk }} Townsfolk</span>
      <span class="outsider">{{ counts.outsider }} Outsiders</span>
      <span class="minion">{{ counts.minion }} Minions</span>
      <span class="demon">{{ counts.demon }} Demon</span>
    </div>
    <div class="info">
      <span v-if="aliveCount.alive">{{ aliveCount.alive }} alive</span>
      <span v-if="aliveCount.votes"> / {{ aliveCount.votes }} ghost votes</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGrimoireStore, usePlayersStore } from '@/stores'

const grimoire = useGrimoireStore()
const playersStore = usePlayersStore()

const { edition } = storeToRefs(grimoire)
const { players } = storeToRefs(playersStore)

const minPlayers = 5

const counts = computed(() => {
  const result = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 }
  players.value.forEach(p => {
    if (p.role.team && p.role.team in result) {
      result[p.role.team as keyof typeof result]++
    }
  })
  return result
})

const aliveCount = computed(() => {
  const alive = players.value.filter(p => !p.isDead).length
  const votes = players.value.filter(p => p.isDead && !p.isVoteless).length
  return { alive, votes }
})
</script>

<style scoped lang="scss">
@import '@/styles/vars';

#towninfo {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 15px 25px;
  border-radius: 10px;

  h2 {
    margin-bottom: 5px;
  }

  .player-count {
    font-size: 1.2em;
    margin-bottom: 10px;
  }

  .team-counts {
    display: flex;
    gap: 15px;
    justify-content: center;
    font-size: 0.9em;
    margin-bottom: 10px;

    .townsfolk { color: $townsfolk; }
    .outsider { color: $outsider; }
    .minion { color: $minion; }
    .demon { color: $demon; }
  }

  .info {
    font-size: 0.85em;
    opacity: 0.8;
  }
}
</style>
