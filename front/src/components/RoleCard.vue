<template>
  <section class="role">
    <h2>你的角色</h2>
    <div class="card" :class="{ empty: !displayRole }">
      <div class="role-name">{{ displayRole?.name || "尚未分配" }}</div>
      <p class="muted">{{ displayRole?.ability || "系统将在开局时分配角色。" }}</p>
      <div v-if="displayRole" class="tags">
        <span class="pill">{{ displayRole.type }}</span>
        <span class="pill muted">{{ displayRole.team === "good" ? "善方" : "恶方" }}</span>
      </div>
    </div>
    <div v-if="isActiveNightTurn" class="private prompt">
      <div class="action-head">
        <span class="label">夜晚提示</span>
        <span class="status ready">现在是你的发动能力时间</span>
      </div>
      <button class="ghost" :disabled="!canCompleteNight" @click="emit('complete-night-step')">完成行动</button>
      <p v-if="!canCompleteNight" class="muted hint">请先选择目标后再完成行动。</p>
    </div>
    <div v-if="player?.role?.id === 'imp' && phaseIndex === 0" class="private">
      <div class="action-head">
        <span class="label">夜晚目标</span>
        <span class="status" :class="{ ready: demonReady }">{{ demonReady ? "已选择" : "待选择" }}</span>
      </div>
      <select
        :value="selectedDemonTargetId"
        :disabled="Boolean(selectedDemonTargetId) || dayNumber === 1"
        @change="updateDemonTarget($event)"
      >
        <option value="">选择目标</option>
        <option v-for="player in demonTargets" :key="player.id" :value="player.id">
          {{ player.name }}
        </option>
      </select>
      <label class="suicide">
        <input type="checkbox" :checked="suicideChecked" :disabled="Boolean(selectedDemonTargetId) || dayNumber === 1" @change="toggleSuicide" />
        自杀（仅当你确定要转移恶魔时）
      </label>
      <p v-if="dayNumber === 1" class="muted hint">首夜恶魔不能杀人。</p>
      <p v-if="!demonReady" class="muted hint">未完成选择将无法推进夜晚。</p>
    </div>
    <div v-if="isButler && phaseIndex === 0" class="private">
      <div class="action-head">
        <span class="label">选择主人</span>
        <span class="status" :class="{ ready: butlerReady }">{{ butlerReady ? "已选择" : "待选择" }}</span>
      </div>
      <select
        :value="selectedMasterId"
        :disabled="Boolean(selectedMasterId)"
        @change="updateButlerMaster"
      >
        <option value="">选择主人</option>
        <option v-for="player in livingOthers" :key="player.id" :value="player.id">
          {{ player.name }}
        </option>
      </select>
      <p v-if="!butlerReady" class="muted hint">未完成选择将无法推进夜晚。</p>
    </div>
    <div v-if="isFortune && phaseIndex === 0" class="private">
      <div class="action-head">
        <span class="label">占卜目标</span>
        <span class="status" :class="{ ready: fortuneReady }">{{ fortuneReady ? "已选择" : "待选择" }}</span>
      </div>
      <div class="pair">
        <select
          :value="fortuneTargets[0]"
          :disabled="Boolean(fortuneTargets[0] && fortuneTargets[1])"
          @change="updateFortuneTarget(0, $event.target.value)"
        >
          <option value="">选择第一个目标</option>
          <option
            v-for="player in livingOthers"
            :key="player.id"
            :value="player.id"
            :disabled="player.id === fortuneTargets[1]"
          >
            {{ player.name }}
          </option>
        </select>
        <select
          :value="fortuneTargets[1]"
          :disabled="Boolean(fortuneTargets[0] && fortuneTargets[1])"
          @change="updateFortuneTarget(1, $event.target.value)"
        >
          <option value="">选择第二个目标</option>
          <option
            v-for="player in livingOthers"
            :key="player.id"
            :value="player.id"
            :disabled="player.id === fortuneTargets[0]"
          >
            {{ player.name }}
          </option>
        </select>
      </div>
      <p v-if="!fortuneReady" class="muted hint">未完成选择将无法推进夜晚。</p>
    </div>
    <div v-if="isPoisoner && phaseIndex === 0" class="private">
      <div class="action-head">
        <span class="label">投毒目标</span>
        <span class="status" :class="{ ready: poisonerReady }">{{ poisonerReady ? "已选择" : "待选择" }}</span>
      </div>
      <select
        :value="selectedPoisonTargetId"
        :disabled="Boolean(selectedPoisonTargetId)"
        @change="updatePoisonTarget($event)"
      >
        <option value="">选择目标</option>
        <option v-for="player in livingOthers" :key="player.id" :value="player.id">
          {{ player.name }}
        </option>
      </select>
      <p v-if="!poisonerReady" class="muted hint">未完成选择将无法推进夜晚。</p>
    </div>
    <div v-if="isMonk && phaseIndex === 0" class="private">
      <div class="action-head">
        <span class="label">僧侣守护</span>
        <span class="status" :class="{ ready: monkReady }">{{ monkReady ? "已选择" : "待选择" }}</span>
      </div>
      <select
        :value="selectedMonkTargetId"
        :disabled="Boolean(selectedMonkTargetId)"
        @change="updateMonkTarget($event)"
      >
        <option value="">选择守护目标</option>
        <option v-for="player in livingOthers" :key="player.id" :value="player.id">
          {{ player.name }}
        </option>
      </select>
      <p v-if="!monkReady" class="muted hint">未完成选择将无法推进夜晚。</p>
    </div>
    <div v-if="isRavenkeeper && phaseIndex === 0 && canRavenkeeper" class="private">
      <div class="action-head">
        <span class="label">守鸦人目标</span>
        <span class="status" :class="{ ready: ravenkeeperReady }">{{ ravenkeeperReady ? "已选择" : "待选择" }}</span>
      </div>
      <select
        :value="selectedRavenkeeperTargetId"
        :disabled="Boolean(selectedRavenkeeperTargetId)"
        @change="updateRavenkeeperTarget($event)"
      >
        <option value="">选择目标</option>
        <option v-for="player in players" :key="player.id" :value="player.id">
          {{ player.name }}
        </option>
      </select>
      <p v-if="!ravenkeeperReady" class="muted hint">未完成选择将无法推进夜晚。</p>
    </div>
    <div v-if="isHunter && phaseIndex === 1 && player?.alive" class="private">
      <div class="action-head">
        <span class="label">猎手开枪</span>
        <span class="status" :class="{ ready: hunterReady }">{{ hunterReady ? "已选择" : "待选择" }}</span>
      </div>
      <select v-model="hunterReady" :disabled="hunterUsed[player.id]">
        <option value="">选择目标</option>
        <option v-for="playerItem in livingOthers" :key="playerItem.id" :value="playerItem.id">
          {{ playerItem.name }}
        </option>
      </select>
      <button class="ghost" :disabled="!hunterReady || hunterUsed[player.id]" @click="fireHunter">
        开枪
      </button>
      <p v-if="hunterUsed[player.id]" class="muted hint">本局已使用猎手技能。</p>
    </div>
    <div class="private">
      <span class="label">私密情报</span>
      <ul v-if="player?.privateLog?.length" class="notes">
        <li v-for="(item, index) in player.privateLog" :key="index">{{ item }}</li>
      </ul>
      <p v-else class="muted">暂无情报。</p>
    </div>
    <div class="private">
      <span class="label">个人记录</span>
      <textarea placeholder="记录信息、假身份与怀疑对象。"></textarea>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  player: {
    type: Object,
    default: null,
  },
  phaseIndex: {
    type: Number,
    default: 0,
  },
  dayNumber: {
    type: Number,
    default: 1,
  },
  players: {
    type: Array,
    default: () => [],
  },
  nightSelections: {
    type: Object,
    default: () => ({}),
  },
  hunterUsed: {
    type: Object,
    default: () => ({}),
  },
  ravenkeeperPending: {
    type: Object,
    default: () => ({}),
  },
  activeNightRoleId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update-night-selection", "use-hunter", "complete-night-step"]);

const displayRole = computed(() => props.player?.displayRole || props.player?.role || null);
const livingPlayers = computed(() => props.players.filter((item) => item.alive));
const livingOthers = computed(() => livingPlayers.value.filter((item) => item.id !== props.player?.id));
const demonTargets = computed(() => livingOthers.value);
const isButler = computed(() => props.player?.role?.id === "butler");
const isFortune = computed(() => props.player?.role?.id === "fortune");
const isPoisoner = computed(() => props.player?.role?.id === "poisoner");
const isMonk = computed(() => props.player?.role?.id === "monk");
const isRavenkeeper = computed(() => props.player?.role?.id === "ravenkeeper");
const isHunter = computed(() => props.player?.role?.id === "hunter");
const nightSelection = computed(() => props.nightSelections[props.player?.id] || {});
const selectedDemonTargetId = computed(() => nightSelection.value.demonTargetId || "");
const selectedMasterId = computed(() => nightSelection.value.masterId || "");
const selectedPoisonTargetId = computed(() => nightSelection.value.poisonTargetId || "");
const selectedMonkTargetId = computed(() => nightSelection.value.monkTargetId || "");
const selectedRavenkeeperTargetId = computed(() => nightSelection.value.ravenkeeperTargetId || "");
const fortuneTargets = computed(() => {
  const targets = Array.isArray(nightSelection.value.targets) ? nightSelection.value.targets : [];
  return [targets[0] || "", targets[1] || ""];
});
const demonReady = computed(() => Boolean(selectedDemonTargetId.value));
const butlerReady = computed(() => Boolean(selectedMasterId.value));
const fortuneReady = computed(() => Boolean(fortuneTargets.value[0] && fortuneTargets.value[1]));
const poisonerReady = computed(() => Boolean(selectedPoisonTargetId.value));
const monkReady = computed(() => Boolean(selectedMonkTargetId.value));
const ravenkeeperReady = computed(() => Boolean(selectedRavenkeeperTargetId.value));
const canRavenkeeper = computed(
  () => props.player && !props.player.alive && props.ravenkeeperPending[props.player.id]
);
const hunterReady = ref("");
const activeRoleId = computed(() => displayRole.value?.id || props.player?.role?.id || "");
const isActiveNightTurn = computed(
  () => props.activeNightRoleId && props.activeNightRoleId === activeRoleId.value && props.phaseIndex === 0
);
const canCompleteNight = computed(() => {
  if (!isActiveNightTurn.value) {
    return false;
  }
  switch (activeRoleId.value) {
    case "poisoner":
      return Boolean(selectedPoisonTargetId.value);
    case "monk":
      return Boolean(selectedMonkTargetId.value);
    case "imp":
      return props.dayNumber === 1 ? true : Boolean(selectedDemonTargetId.value);
    case "fortune":
      return Boolean(fortuneTargets.value[0] && fortuneTargets.value[1]);
    case "butler":
      return Boolean(selectedMasterId.value);
    case "ravenkeeper":
      return Boolean(selectedRavenkeeperTargetId.value);
    default:
      return true;
  }
});

const updateButlerMaster = (event) => {
  if (!props.player?.id) {
    return;
  }
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, masterId: event.target.value },
  });
};

const updateDemonTarget = (event) => {
  if (!props.player?.id) {
    return;
  }
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, demonTargetId: event.target.value },
  });
};

const suicideChecked = computed(() => selectedDemonTargetId.value === props.player?.id);

const toggleSuicide = (event) => {
  if (!props.player?.id) {
    return;
  }
  const nextId = event.target.checked ? props.player.id : "";
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, demonTargetId: nextId },
  });
};

const updateFortuneTarget = (index, value) => {
  if (!props.player?.id) {
    return;
  }
  const next = [...fortuneTargets.value];
  next[index] = value;
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, targets: next },
  });
};

const updatePoisonTarget = (event) => {
  if (!props.player?.id) {
    return;
  }
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, poisonTargetId: event.target.value },
  });
};

const updateMonkTarget = (event) => {
  if (!props.player?.id) {
    return;
  }
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, monkTargetId: event.target.value },
  });
};

const updateRavenkeeperTarget = (event) => {
  if (!props.player?.id) {
    return;
  }
  emit("update-night-selection", {
    playerId: props.player.id,
    selection: { ...nightSelection.value, ravenkeeperTargetId: event.target.value },
  });
};

const fireHunter = () => {
  if (!props.player?.id || props.hunterUsed[props.player.id] || !hunterReady.value) {
    return;
  }
  emit("use-hunter", hunterReady.value);
  hunterReady.value = "";
};
</script>

<style scoped>
.role {
  display: grid;
  gap: 14px;
}

.card {
  background: linear-gradient(135deg, rgba(127, 209, 185, 0.2), transparent);
  border: 1px solid rgba(127, 209, 185, 0.3);
  border-radius: 14px;
  padding: 14px;
}

.role-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.private {
  display: grid;
  gap: 8px;
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

textarea {
  resize: none;
  min-height: 90px;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-cream);
}

select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 10px;
  color: var(--text-cream);
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

.action-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
}

.status.ready {
  color: #ffe8b3;
  background: rgba(230, 166, 60, 0.22);
  border: 1px solid rgba(230, 166, 60, 0.4);
}

.hint {
  font-size: 12px;
}

.pair {
  display: grid;
  gap: 8px;
}

.suicide {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.prompt {
  border: 1px solid rgba(230, 166, 60, 0.35);
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(230, 166, 60, 0.08);
}

.suicide {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.notes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}

.notes li {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
