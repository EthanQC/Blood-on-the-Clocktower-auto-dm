<template>
  <section class="host">
    <h2>系统说书人</h2>
    <div v-if="view === 'lobby'" class="block">
      <label class="field">
        人数
        <select :value="playerCount" @change="emit('update-player-count', Number($event.target.value))">
          <option :value="7">7 人</option>
          <option :value="10">10 人</option>
        </select>
      </label>
      <label class="field">
        剧本
        <select disabled>
          <option selected>暗流涌动</option>
        </select>
      </label>
      <div v-if="showSetup" class="distribution">
        <div>
          <span class="label">村民</span>
          <strong>{{ distribution.townsfolk }}</strong>
        </div>
        <div>
          <span class="label">外来者</span>
          <strong>{{ distribution.outsiders }}</strong>
        </div>
        <div>
          <span class="label">爪牙</span>
          <strong>{{ distribution.minions }}</strong>
        </div>
        <div>
          <span class="label">恶魔</span>
          <strong>{{ distribution.demon }}</strong>
        </div>
      </div>
      <button class="cta" @click="emit('start')">发牌并开始</button>
      <p class="muted note">系统将自动分配角色并维护夜晚信息。</p>
    </div>
    <div v-else class="block">
      <div class="phase-row">
        <span class="label">当前阶段</span>
        <strong>{{ phaseLabels[phaseIndex] }} · 第 {{ dayNumber }} 天</strong>
      </div>
      <div v-if="gameOver" class="result">
        {{ winner }}
      </div>
      <div v-if="phaseIndex === 1 || phaseIndex === 2" class="field">
        处刑提名
        <div class="nomination-row">
          <select v-model="nominationSelection">
            <option value="">选择被提名者</option>
            <option v-for="player in livingPlayers" :key="player.id" :value="player.id">
              {{ player.name }}
            </option>
          </select>
          <button class="ghost" :disabled="!!nomineeName" @click="emit('start-nomination', nominationSelection)">
            提名
          </button>
        </div>
        <p v-if="nomineeName" class="muted">当前提名：{{ nominatorName }} → {{ nomineeName }}</p>
      </div>
      <div v-if="phaseIndex === 2" class="vote-summary">
        <span class="label">投票进度</span>
        <strong>{{ voteYesCount }} / {{ voteNeeded }}（存活 {{ aliveCount }}）</strong>
      </div>
      <div v-if="phaseIndex === 2" class="vote-actions">
        <span class="label">当前点名</span>
        <div class="vote-row">
          <span>{{ currentVoterName || "等待投票" }}</span>
          <button class="cta" :disabled="!nomineeId || !currentVoterName" @click="emit('vote', true)">
            赞成
          </button>
          <button class="ghost" :disabled="!nomineeId || !currentVoterName" @click="emit('vote', false)">
            反对
          </button>
        </div>
      </div>
      <button class="cta" :disabled="gameOver" @click="emit('next-phase')">推进阶段</button>
      <div class="log">
        <div class="label">公开记录</div>
        <ul>
          <li v-for="(item, index) in publicLog" :key="index">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const emit = defineEmits([
  "start",
  "next-phase",
  "update-player-count",
  "start-nomination",
  "vote",
]);

const props = defineProps({
  view: {
    type: String,
    required: true,
  },
  players: {
    type: Array,
    required: true,
  },
  playerCount: {
    type: Number,
    required: true,
  },
  distribution: {
    type: Object,
    required: true,
  },
  showSetup: {
    type: Boolean,
    default: false,
  },
  phaseIndex: {
    type: Number,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
  nomineeId: {
    type: String,
    default: "",
  },
  currentVoterName: {
    type: String,
    default: "",
  },
  nominatorId: {
    type: String,
    default: "",
  },
  voteYesCount: {
    type: Number,
    default: 0,
  },
  voteNeeded: {
    type: Number,
    default: 0,
  },
  aliveCount: {
    type: Number,
    default: 0,
  },
  publicLog: {
    type: Array,
    default: () => [],
  },
  gameOver: {
    type: Boolean,
    default: false,
  },
  winner: {
    type: String,
    default: "",
  },
});

const phaseLabels = ["夜晚", "白天", "投票", "处刑"];
const nominationSelection = ref("");
const livingPlayers = computed(() => (Array.isArray(props.players) ? props.players.filter((p) => p.alive) : []));
const nomineeName = computed(
  () => props.players.find((player) => player.id === props.nomineeId)?.name || ""
);
const nominatorName = computed(
  () => props.players.find((player) => player.id === props.nominatorId)?.name || ""
);
</script>

<style scoped>
.host {
  display: grid;
  gap: 16px;
}

.block {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.field select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text-cream);
}

.nomination-row {
  display: flex;
  gap: 8px;
}

.nomination-row select {
  flex: 1;
}

.ghost {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--text-cream);
  padding: 8px 12px;
  border-radius: 10px;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}

.distribution {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.distribution div {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  gap: 6px;
}

.label {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.note {
  font-size: 12px;
  line-height: 1.4;
}

.phase-row {
  display: grid;
  gap: 6px;
}

.result {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(200, 66, 58, 0.2);
  border: 1px solid rgba(200, 66, 58, 0.4);
  font-weight: 600;
}

.log {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.log ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
  max-height: 140px;
  overflow: auto;
}

.log li {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.vote-summary {
  display: grid;
  gap: 4px;
}

.vote-actions {
  display: grid;
  gap: 8px;
}

.vote-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
