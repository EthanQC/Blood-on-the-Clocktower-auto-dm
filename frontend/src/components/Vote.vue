<template>
  <div id="vote">
    <div class="nomination">
      <h2>Nomination</h2>
      <div class="players">
        <div class="nominator">
          <Token :role="nominator?.role" />
          <span>{{ nominator?.name }}</span>
          <span class="label">Nominator</span>
        </div>
        <font-awesome-icon icon="hand-point-right" />
        <div class="nominee">
          <Token :role="nominee?.role" />
          <span>{{ nominee?.name }}</span>
          <span class="label">Nominee</span>
        </div>
      </div>
    </div>

    <div class="vote-status">
      <div class="votes-needed">
        Votes needed: {{ session.votesMajority }}
      </div>
      <div class="current-votes">
        Current: {{ yesVotes }} / {{ players.length }}
      </div>
    </div>

    <div class="actions" v-if="!session.isSpectator">
      <button class="button demon" @click="endNomination">
        End Nomination
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayersStore, useSessionStore } from '@/stores'
import Token from './Token.vue'

const playersStore = usePlayersStore()
const session = useSessionStore()

const { players } = storeToRefs(playersStore)

const nominator = computed(() => {
  if (!session.nomination) return null
  return players.value[session.nomination[0]]
})

const nominee = computed(() => {
  if (!session.nomination) return null
  return players.value[session.nomination[1]]
})

const yesVotes = computed(() => {
  return session.votes.filter(v => v).length
})

function endNomination() {
  session.setNomination(null)
  session.clearVotes()
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

#vote {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px 30px;
  border-radius: 10px;

  h2 {
    margin-bottom: 15px;
  }

  .players {
    display: flex;
    align-items: center;
    gap: 20px;

    .nominator,
    .nominee {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;

      .token {
        width: 60px;
        height: 60px;
      }

      .label {
        font-size: 0.8em;
        opacity: 0.7;
      }
    }

    > svg {
      font-size: 2em;
      color: $demon;
    }
  }

  .vote-status {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .actions {
    margin-top: 15px;
  }
}
</style>
