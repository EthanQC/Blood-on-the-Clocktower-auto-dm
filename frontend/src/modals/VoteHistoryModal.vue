<template>
  <Modal
    :show="grimoire.modals.voteHistory"
    title="Vote History"
    size="medium"
    modal-name="voteHistory"
  >
    <div v-if="session.voteHistory.length === 0" class="empty">
      <font-awesome-icon icon="history" />
      <p>No votes recorded yet</p>
    </div>

    <div v-else class="vote-history">
      <div v-for="(vote, index) in session.voteHistory" :key="index" class="vote-record">
        <div class="header">
          <span class="nominee">Player #{{ vote.nominated }}</span>
          <span class="result" :class="vote.isExile ? 'exile' : 'nomination'">
            {{ vote.isExile ? 'EXILE' : 'NOMINATION' }}
          </span>
        </div>
        <div class="details">
          <span class="votes">Votes: {{ countVotes(vote.votes) }} / {{ vote.votes.length }}</span>
          <span class="nominator">Nominated by: Player #{{ vote.nominator }}</span>
        </div>
        <div class="voters">
          <span
            v-for="(voted, i) in vote.votes"
            :key="i"
            class="vote-marker"
            :class="{ 'voted-yes': voted }"
          >
            {{ i + 1 }}
          </span>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useGrimoireStore, useSessionStore } from '@/stores'
import Modal from './Modal.vue'

const grimoire = useGrimoireStore()
const session = useSessionStore()

function countVotes(votes: boolean[]): number {
  return votes.filter(v => v).length
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.empty {
  text-align: center;
  padding: 40px;
  opacity: 0.6;

  svg {
    font-size: 3em;
    margin-bottom: 15px;
  }

  p {
    margin: 0;
  }
}

.vote-history {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.vote-record {
  padding: 15px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .nominee {
      font-weight: 600;
      font-size: 1.1em;
    }

    .result {
      font-size: 0.85em;
      padding: 3px 10px;
      border-radius: 15px;
      font-weight: bold;

      &.executed {
        background: rgba($demon, 0.3);
        color: $demon;
      }

      &.survived {
        background: rgba($townsfolk, 0.3);
        color: $townsfolk;
      }
    }
  }

  .details {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    opacity: 0.8;
    margin-bottom: 10px;
  }

  .voters {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;

    .voted-for {
      font-size: 0.8em;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
