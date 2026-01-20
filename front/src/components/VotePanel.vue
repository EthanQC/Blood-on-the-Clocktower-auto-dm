<template>
  <section class="vote">
    <h2>投票</h2>
    <div class="nomination">
      <span class="label">提名</span>
      <div class="nomination-row">
        <select v-model="selection">
          <option value="">选择被提名者</option>
          <option v-for="player in alivePlayers" :key="player.id" :value="player.id">
            {{ player.name }}
          </option>
        </select>
        <button class="ghost" :disabled="!!nomineeName" @click="emit('nominate', selection)">提名</button>
      </div>
      <p v-if="nomineeName" class="muted">当前提名：{{ nominatorName }} → {{ nomineeName }}</p>
      <p v-else class="muted">暂无提名。</p>
    </div>
    <div class="actions">
      <button class="cta" :disabled="!canVote || !nomineeId || voted" @click="emit('vote', true)">
        赞成
      </button>
      <button class="ghost" :disabled="!canVote || !nomineeId || voted" @click="emit('vote', false)">
        反对
      </button>
    </div>
    <p v-if="currentVoterName" class="muted">当前点名：{{ currentVoterName }}</p>
    <div class="status">
      <span class="label">投票状态</span>
      <ul>
        <li v-for="player in players" :key="player.id" :class="{ off: !player.alive }">
          <span>{{ player.name }}</span>
          <strong>{{ voteLabel(player) }}</strong>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const emit = defineEmits(["vote", "nominate"]);

const props = defineProps({
  canVote: {
    type: Boolean,
    default: true,
  },
  voted: {
    type: Boolean,
    default: false,
  },
  players: {
    type: Array,
    default: () => [],
  },
  votes: {
    type: Object,
    default: () => ({}),
  },
  ghostVotesUsed: {
    type: Object,
    default: () => ({}),
  },
  nomineeId: {
    type: String,
    default: "",
  },
  nominatorId: {
    type: String,
    default: "",
  },
  currentVoterName: {
    type: String,
    default: "",
  },
  currentVoterId: {
    type: String,
    default: "",
  },
});

const selection = ref("");
const alivePlayers = computed(() => props.players.filter((player) => player.alive));
const nomineeName = computed(
  () => props.players.find((player) => player.id === props.nomineeId)?.name || ""
);
const nominatorName = computed(
  () => props.players.find((player) => player.id === props.nominatorId)?.name || ""
);
const voteLabel = (player) => {
  if (!player.alive) {
    return props.ghostVotesUsed[player.id] ? "已用鬼票" : "可投鬼票";
  }
  if (!Object.prototype.hasOwnProperty.call(props.votes, player.id)) {
    return "未投票";
  }
  return props.votes[player.id] ? "赞成" : "反对";
};
</script>

<style scoped>
.vote {
  display: grid;
  gap: 10px;
}

.nomination {
  display: grid;
  gap: 8px;
}

.nomination-row {
  display: flex;
  gap: 8px;
}

.nomination-row select {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-cream);
  border-radius: 10px;
  padding: 8px 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.ghost {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--text-cream);
  padding: 10px 14px;
  border-radius: 10px;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}

.status {
  display: grid;
  gap: 8px;
}

.status ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}

.status li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  font-size: 12px;
}

.status li.off {
  opacity: 0.5;
}
</style>
