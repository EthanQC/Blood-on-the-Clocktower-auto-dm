<template>
  <div class="screen">
    <header class="brand">
      <div class="pill">血染钟楼</div>
      <span>房间 HX7M · {{ activePlayers.length }} 人 · 剧本：暗流涌动</span>
      <div v-if="view !== 'join'" class="view-tools">
        <label>视角</label>
        <select v-model="currentPlayerId">
          <option v-for="player in activePlayers" :key="player.id" :value="player.id">
            {{ player.name }}
          </option>
        </select>
      </div>
    </header>

    <RoomJoin v-if="view === 'join'" class="panel glass join-panel" @enter="goLobby" @host="goLobby" />

    <section v-if="view !== 'join'" class="table-zone table-panel">
      <SeatRing :players="activePlayers" :me-id="currentPlayerId" />
    </section>

    <HostPanel
      v-if="view !== 'join'"
      class="panel host-panel"
      :view="view"
      :players="activePlayers"
      :player-count="playerCount"
      :distribution="distribution"
      :show-setup="false"
      :phase-index="phaseIndex"
      :day-number="dayNumber"
      :nominee-id="nomineeId"
      :nominator-id="nominatorId"
      :public-log="publicLog"
      :game-over="gameOver"
      :winner="winner"
      :vote-yes-count="voteYesCount"
      :vote-needed="voteNeeded"
      :alive-count="aliveCount"
      :current-voter-name="currentVoterName"
      @start="goGame"
      @next-phase="nextPhase"
      @update-player-count="playerCount.value = $event"
      @start-nomination="startNomination"
      @vote="castVoteFor(currentVoterId, $event)"
    />

    <LobbyPanel v-if="view === 'lobby'" class="panel lobby-panel" :players="activePlayers" />

    <section v-if="view === 'game'" class="dock">
      <RoleCard
        class="panel"
        :player="currentPlayer"
        :phase-index="phaseIndex"
        :day-number="dayNumber"
        :players="activePlayers"
        :night-selections="nightSelections"
        :hunter-used="hunterUsed"
        :ravenkeeper-pending="ravenkeeperPending"
        :active-night-role-id="activeNightRoleId"
        @update-night-selection="updateNightSelection"
        @use-hunter="useHunterShot"
        @complete-night-step="completeNightStep"
      />
      <PhaseTimeline class="panel" :phase-index="phaseIndex" />
      <VotePanel
        v-if="phaseIndex === 1 || phaseIndex === 2"
        class="panel"
        :can-vote="phaseIndex === 2 && currentVoter && canPlayerVote(currentVoter)"
        :voted="Object.prototype.hasOwnProperty.call(voteMap, currentPlayerId)"
        :votes="voteMap"
        :ghost-votes-used="ghostVoteUsed"
        :players="activePlayers"
        :nominee-id="nomineeId"
        :nominator-id="nominatorId"
        :current-voter-name="currentVoterName"
        :current-voter-id="currentVoterId"
        @vote="castVoteFor(currentVoterId, $event)"
        @nominate="startNomination"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import RoomJoin from "./components/RoomJoin.vue";
import LobbyPanel from "./components/LobbyPanel.vue";
import SeatRing from "./components/SeatRing.vue";
import HostPanel from "./components/HostPanel.vue";
import RoleCard from "./components/RoleCard.vue";
import PhaseTimeline from "./components/PhaseTimeline.vue";
import VotePanel from "./components/VotePanel.vue";

const view = ref("join");
const phaseIndex = ref(0);
const dayNumber = ref(1);
const playerCount = ref(10);
const poisonTargetId = ref("");
const nomineeId = ref("");
const nominatorId = ref("");
const publicLog = ref([]);
const gameOver = ref(false);
const winner = ref("");
const nightSelections = ref({});
const redHerringId = ref("");
const lastExecutedRole = ref("");
const executedToday = ref(false);
const baronActive = ref(false);
const spyRegisterType = ref("");
const spyRegisterRoleName = ref("");
const voteMap = ref({});
const butlerMasterId = ref("");
const hunterUsed = ref({});
const virginUsed = ref(false);
const ravenkeeperPending = ref({});
const awaitingRavenkeeper = ref(false);
const nightStepIndex = ref(0);
const nightInfoDelivered = ref({});
const nightPoisonApplied = ref(false);
const voteOrder = ref([]);
const voteIndex = ref(0);
const nominationsByDay = ref({});
const nominationResults = ref([]);
const ghostVoteUsed = ref({});

const distributionByCount = {
  7: { townsfolk: 5, outsiders: 0, minions: 1, demon: 1 },
  10: { townsfolk: 7, outsiders: 0, minions: 2, demon: 1 },
};

const rolePools = {
  townsfolk: [
    {
      id: "washerwoman",
      name: "洗衣妇",
      type: "村民",
      team: "good",
      ability: "首夜得知两名玩家中有一人是某个指定村民角色。",
    },
    {
      id: "librarian",
      name: "图书管理员",
      type: "村民",
      team: "good",
      ability: "首夜得知两名玩家中有一人是某个指定外来者（或得知场上没有外来者）。",
    },
    {
      id: "investigator",
      name: "调查员",
      type: "村民",
      team: "good",
      ability: "首夜得知两名玩家中有一人是某个指定爪牙（或得知场上没有爪牙）。",
    },
    {
      id: "chef",
      name: "厨师",
      type: "村民",
      team: "good",
      ability: "首夜得知场上相邻的邪恶玩家对数。",
    },
    {
      id: "empath",
      name: "共情者",
      type: "村民",
      team: "good",
      ability: "每夜得知与你相邻的两名存活玩家中有多少邪恶。",
    },
    {
      id: "fortune",
      name: "占卜师",
      type: "村民",
      team: "good",
      ability: "每夜选择两名玩家，得知他们之中是否有恶魔（可能有一名善良玩家被当作恶魔）。",
    },
    {
      id: "undertaker",
      name: "送葬者",
      type: "村民",
      team: "good",
      ability: "每夜得知今天白天被处决玩家的角色。",
    },
    {
      id: "monk",
      name: "僧侣",
      type: "村民",
      team: "good",
      ability: "每夜选择一名玩家；当晚恶魔的伤害对其无效。",
    },
    {
      id: "ravenkeeper",
      name: "守鸦人",
      type: "村民",
      team: "good",
      ability: "若你夜晚死亡，你可选择一名玩家并得知其角色。",
    },
    {
      id: "virgin",
      name: "贞洁者",
      type: "村民",
      team: "good",
      ability: "若首次提名你者为村民，该村民立刻被处决。",
    },
    {
      id: "hunter",
      name: "猎手",
      type: "村民",
      team: "good",
      ability: "每局一次，你可在白天公开选择一名玩家：若其为恶魔则死亡。",
    },
    {
      id: "soldier",
      name: "士兵",
      type: "村民",
      team: "good",
      ability: "恶魔的夜晚伤害对你无效。",
    },
    {
      id: "mayor",
      name: "镇长",
      type: "村民",
      team: "good",
      ability: "若仅剩三名玩家且无人被处决，善方胜利；你夜晚死亡可能转移给其他玩家。",
    },
  ],
  outsiders: [
    {
      id: "butler",
      name: "管家",
      type: "外来者",
      team: "good",
      ability: "每夜选择一名主人，白天只能在主人投票时投票。",
    },
    {
      id: "drunk",
      name: "酒鬼",
      type: "外来者",
      team: "good",
      ability: "你以为自己是村民，其实不是；你的能力信息是假的。",
    },
  ],
  minions: [
    {
      id: "poisoner",
      name: "投毒者",
      type: "爪牙",
      team: "evil",
      ability: "每夜选择一名玩家，使其当晚和次日白天中毒。",
    },
    {
      id: "spy",
      name: "间谍",
      type: "爪牙",
      team: "evil",
      ability: "可以看到剧本和邪恶阵营信息，并被当作村民/外来者注册。",
    },
    {
      id: "baron",
      name: "男爵",
      type: "爪牙",
      team: "evil",
      ability: "开局额外加入 2 名外来者，并减少 2 名村民。",
    },
    {
      id: "scarlet",
      name: "红唇女郎",
      type: "爪牙",
      team: "evil",
      ability: "若至少 5 名玩家存活，恶魔无法死亡；若你死亡则可能转化为恶魔。",
    },
  ],
  demon: [
    {
      id: "imp",
      name: "小恶魔",
      type: "恶魔",
      team: "evil",
      ability: "每夜选择一名玩家死亡；若自杀，随机一名爪牙变为新的小恶魔。",
    },
  ],
};

const players = ref([
  {
    id: "u1",
    name: "Mara",
    seat: 1,
    alive: true,
    ready: true,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u2",
    name: "你",
    seat: 2,
    alive: true,
    ready: true,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u3",
    name: "Kai",
    seat: 3,
    alive: true,
    ready: false,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u4",
    name: "Inez",
    seat: 4,
    alive: true,
    ready: true,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u5",
    name: "Rowan",
    seat: 5,
    alive: true,
    ready: false,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u6",
    name: "Hana",
    seat: 6,
    alive: true,
    ready: true,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u7",
    name: "Otto",
    seat: 7,
    alive: true,
    ready: false,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u8",
    name: "Jules",
    seat: 8,
    alive: true,
    ready: true,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u9",
    name: "Quinn",
    seat: 9,
    alive: true,
    ready: false,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
  {
    id: "u10",
    name: "Sol",
    seat: 10,
    alive: true,
    ready: false,
    role: null,
    displayRole: null,
    fakeRole: null,
    poisonedUntilDay: 0,
    privateLog: [],
  },
]);

const activePlayers = computed(() => players.value.slice(0, playerCount.value));
const currentPlayerId = ref("u2");
const currentPlayer = computed(
  () => activePlayers.value.find((player) => player.id === currentPlayerId.value) || activePlayers.value[0]
);
const baseDistribution = computed(() => distributionByCount[playerCount.value] || distributionByCount[10]);
const distribution = computed(() => {
  const base = baseDistribution.value;
  return {
    townsfolk: Math.max(0, base.townsfolk + (baronActive.value ? -2 : 0)),
    outsiders: Math.max(0, base.outsiders + (baronActive.value ? 2 : 0)),
    minions: base.minions,
    demon: base.demon,
  };
});
const hasPoisoner = computed(() => activePlayers.value.some((player) => player.alive && player.role?.id === "poisoner"));
const voteYesCount = computed(() => Object.values(voteMap.value).filter((value) => value === true).length);
const currentVoterId = computed(() => voteOrder.value[voteIndex.value] || "");
const currentVoter = computed(
  () => activePlayers.value.find((player) => player.id === currentVoterId.value) || null
);
const currentVoterName = computed(() => currentVoter.value?.name || "");

const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickRoles = (pool, count) => {
  if (count > pool.length) {
    return null;
  }
  return shuffle(pool).slice(0, count);
};

const isPoisoned = (player) => player?.poisonedUntilDay >= dayNumber.value;

const addSpyLog = (text) => {
  const spy = activePlayers.value.find((item) => item.role?.id === "spy");
  if (spy) {
    addPrivateLog(spy.id, text);
  }
};

const randomPair = () => {
  const pool = shuffle(activePlayers.value);
  return pool.slice(0, 2);
};

const randomInfoNumber = (max) => Math.floor(Math.random() * (max + 1));

const randomRoleName = (pool) => {
  const source = pool.map((role) => role.name);
  return shuffle(source)[0] || "未知角色";
};

const pickWithDecoy = (targetPlayer) => {
  const decoyCandidates = activePlayers.value.filter((player) => player.id !== targetPlayer.id);
  const decoy = shuffle(decoyCandidates)[0];
  const pair = shuffle([targetPlayer, decoy]).filter(Boolean);
  return pair.length === 2 ? pair : [];
};

const deliverNightInfo = (player, isFirstNight) => {
  if (!player) {
    return;
  }
  const isDrunk = player.role?.id === "drunk";
  const infoRoleId = isDrunk ? player.fakeRole?.id : player.role?.id;
  const shouldFakeInfo = isDrunk || isPoisoned(player);
  if (infoRoleId === "washerwoman" && isFirstNight) {
    if (shouldFakeInfo) {
      const pair = randomPair();
      const roleName = randomRoleName(rolePools.townsfolk);
      if (pair.length === 2) {
        const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${roleName}。`;
        addPrivateLog(player.id, message);
        addSpyLog(`洗衣妇信息：${message}`);
      }
      return;
    }
    const townsfolk = activePlayers.value.filter((item) => registeredType(item) === "村民");
    const targetRolePlayer = shuffle(townsfolk)[0];
    if (targetRolePlayer) {
      const pair = pickWithDecoy(targetRolePlayer);
      if (pair.length === 2) {
        const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${registeredRoleName(targetRolePlayer)}。`;
        addPrivateLog(player.id, message);
        addSpyLog(`洗衣妇信息：${message}`);
      }
    }
  }
  if (infoRoleId === "librarian" && isFirstNight) {
    if (shouldFakeInfo) {
      const showNone = Math.random() > 0.5;
      if (showNone) {
        const message = "场上没有外来者。";
        addPrivateLog(player.id, message);
        addSpyLog(`图书管理员信息：${message}`);
      } else {
        const pair = randomPair();
        const roleName = randomRoleName(rolePools.outsiders);
        if (pair.length === 2) {
          const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${roleName}。`;
          addPrivateLog(player.id, message);
          addSpyLog(`图书管理员信息：${message}`);
        }
      }
      return;
    }
    const outsiders = activePlayers.value.filter((item) => registeredType(item) === "外来者");
    if (outsiders.length === 0) {
      const message = "场上没有外来者。";
      addPrivateLog(player.id, message);
      addSpyLog(`图书管理员信息：${message}`);
    } else {
      const targetRolePlayer = shuffle(outsiders)[0];
      const pair = pickWithDecoy(targetRolePlayer);
      if (pair.length === 2) {
        const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${registeredRoleName(targetRolePlayer)}。`;
        addPrivateLog(player.id, message);
        addSpyLog(`图书管理员信息：${message}`);
      }
    }
  }
  if (infoRoleId === "investigator" && isFirstNight) {
    if (shouldFakeInfo) {
      const showNone = Math.random() > 0.5;
      if (showNone) {
        const message = "场上没有爪牙。";
        addPrivateLog(player.id, message);
        addSpyLog(`调查员信息：${message}`);
      } else {
        const pair = randomPair();
        const roleName = randomRoleName(rolePools.minions);
        if (pair.length === 2) {
          const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${roleName}。`;
          addPrivateLog(player.id, message);
          addSpyLog(`调查员信息：${message}`);
        }
      }
      return;
    }
    const minions = activePlayers.value.filter((item) => item.role?.type === "爪牙");
    if (minions.length === 0) {
      const message = "场上没有爪牙。";
      addPrivateLog(player.id, message);
      addSpyLog(`调查员信息：${message}`);
    } else {
      const targetRolePlayer = shuffle(minions)[0];
      const pair = pickWithDecoy(targetRolePlayer);
      if (pair.length === 2) {
        const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${targetRolePlayer.role?.name}。`;
        addPrivateLog(player.id, message);
        addSpyLog(`调查员信息：${message}`);
      }
    }
  }
  if (infoRoleId === "empath") {
    if (shouldFakeInfo) {
      addPrivateLog(player.id, `你的两侧存活邻座中有 ${randomInfoNumber(2)} 名恶人。`);
      return;
    }
    const alivePlayers = activePlayers.value.filter((item) => item.alive);
    const index = alivePlayers.findIndex((item) => item.id === player.id);
    const left = alivePlayers[(index - 1 + alivePlayers.length) % alivePlayers.length];
    const right = alivePlayers[(index + 1) % alivePlayers.length];
    const evilCount = [left, right].filter((neighbor) => registeredTeam(neighbor) === "evil").length;
    addPrivateLog(player.id, `你的两侧存活邻座中有 ${evilCount} 名恶人。`);
  }
  if (infoRoleId === "chef" && isFirstNight) {
    if (shouldFakeInfo) {
      const maxPairs = Math.max(0, Math.floor(activePlayers.value.length / 2));
      addPrivateLog(player.id, `相邻邪恶玩家对数为 ${randomInfoNumber(maxPairs)}。`);
      return;
    }
    const alivePlayers = activePlayers.value.filter((item) => item.alive);
    let pairs = 0;
    alivePlayers.forEach((item, idx) => {
      const next = alivePlayers[(idx + 1) % alivePlayers.length];
      if (registeredTeam(item) === "evil" && registeredTeam(next) === "evil") {
        pairs += 1;
      }
    });
    addPrivateLog(player.id, `相邻邪恶玩家对数为 ${pairs}。`);
  }
  if (infoRoleId === "fortune") {
    const candidates = activePlayers.value.filter((item) => item.id !== player.id);
    const selection = nightSelections.value[player.id];
    const picked = candidates.filter((item) => selection?.targets?.includes(item.id));
    const targets = picked.length === 2 ? picked : shuffle(candidates).slice(0, 2);
    if (shouldFakeInfo) {
      const hasDemon = Math.random() > 0.5;
      addPrivateLog(
        player.id,
        `占卜目标：${targets.map((item) => item.name).join("、")}。结果：${hasDemon ? "有恶魔" : "无恶魔"}。`
      );
      return;
    }
    const hasDemon = targets.some(
      (item) => item.role?.type === "恶魔" || item.id === redHerringId.value
    );
    addPrivateLog(
      player.id,
      `占卜目标：${targets.map((item) => item.name).join("、")}。结果：${hasDemon ? "有恶魔" : "无恶魔"}。`
    );
  }
  if (infoRoleId === "undertaker") {
    if (shouldFakeInfo) {
      const roleName = shuffle(allRoleNames)[0] || "未知角色";
      addPrivateLog(player.id, `今天处刑的角色是 ${roleName}。`);
      return;
    }
    if (lastExecutedRole.value) {
      addPrivateLog(player.id, `今天处刑的角色是 ${lastExecutedRole.value}。`);
    } else {
      addPrivateLog(player.id, "今天无人被处刑。");
    }
  }
};

const applyPoisoner = (poisoner) => {
  if (!poisoner) {
    return;
  }
  const living = livingPlayers();
  const poisonTargets = living.filter((player) => player.id !== poisoner.id);
  const selection = nightSelections.value[poisoner.id];
  let poisonTarget = poisonTargets.find((player) => player.id === selection?.poisonTargetId);
  if (!poisonTarget) {
    poisonTarget = shuffle(poisonTargets)[0];
  }
  if (poisonTarget) {
    poisonTarget.poisonedUntilDay = dayNumber.value + 1;
  }
  nightPoisonApplied.value = true;
};

const townsfolkGroups = {
  f4: ["washerwoman", "librarian", "investigator", "chef"],
  info: ["empath", "fortune", "undertaker"],
  func: ["monk", "ravenkeeper", "virgin", "hunter", "soldier", "mayor"],
};

const townsfolkById = (id) => rolePools.townsfolk.find((role) => role.id === id);

const pickTownsfolk = (count) => {
  if (count !== 7) {
    return pickRoles(rolePools.townsfolk, count);
  }
  const useAlt = Math.random() > 0.5;
  const pattern = useAlt
    ? { f4: 3, info: 1, func: 3 }
    : { f4: 2, info: 2, func: 3 };
  const f4Pool = townsfolkGroups.f4.map(townsfolkById).filter(Boolean);
  const infoPool = townsfolkGroups.info.map(townsfolkById).filter(Boolean);
  const funcPool = townsfolkGroups.func.map(townsfolkById).filter(Boolean);
  const f4 = pickRoles(f4Pool, pattern.f4);
  const info = pickRoles(infoPool, pattern.info);
  const func = pickRoles(funcPool, pattern.func);
  if (!f4 || !info || !func) {
    return pickRoles(rolePools.townsfolk, count);
  }
  return [...f4, ...info, ...func];
};

const allRoleNames = [
  ...rolePools.townsfolk.map((role) => role.name),
  ...rolePools.outsiders.map((role) => role.name),
  ...rolePools.minions.map((role) => role.name),
  ...rolePools.demon.map((role) => role.name),
];

const addPublicLog = (text) => {
  publicLog.value.unshift(text);
};

const addPrivateLog = (playerId, text) => {
  const player = activePlayers.value.find((item) => item.id === playerId);
  if (!player) {
    return;
  }
  player.privateLog.unshift(text);
};

const nightOrderFirst = [
  "poisoner",
  "washerwoman",
  "librarian",
  "investigator",
  "chef",
  "empath",
  "fortune",
  "butler",
  "spy",
];

const nightOrderOther = [
  "poisoner",
  "monk",
  "scarlet",
  "imp",
  "ravenkeeper",
  "empath",
  "fortune",
  "butler",
  "undertaker",
  "spy",
];

const nightOrder = computed(() => (dayNumber.value === 1 ? nightOrderFirst : nightOrderOther));

const roleExistsForPrompt = (roleId) => {
  if (roleId === "ravenkeeper") {
    return Object.values(ravenkeeperPending.value).some(Boolean);
  }
  return activePlayers.value.some(
    (player) =>
      (player.displayRole?.id === roleId || player.role?.id === roleId) && player.alive
  );
};

const resetNightStep = () => {
  let idx = 0;
  while (idx < nightOrder.value.length) {
    if (roleExistsForPrompt(nightOrder.value[idx])) {
      nightStepIndex.value = idx;
      return;
    }
    idx += 1;
  }
  nightStepIndex.value = -1;
};

const advanceNightStep = () => {
  let idx = nightStepIndex.value + 1;
  while (idx < nightOrder.value.length) {
    if (roleExistsForPrompt(nightOrder.value[idx])) {
      nightStepIndex.value = idx;
      return;
    }
    idx += 1;
  }
  nightStepIndex.value = -1;
};

const activeNightRoleId = computed(() =>
  nightStepIndex.value >= 0 ? nightOrder.value[nightStepIndex.value] || "" : ""
);

const useHunterShot = (targetId) => {
  const hunter = activePlayers.value.find((player) => player.id === currentPlayerId.value);
  if (!hunter || hunter.role?.id !== "hunter" || !hunter.alive) {
    return;
  }
  if (hunterUsed.value[hunter.id]) {
    return;
  }
  const target = activePlayers.value.find((player) => player.id === targetId && player.alive);
  if (!target) {
    return;
  }
  hunterUsed.value = { ...hunterUsed.value, [hunter.id]: true };
  addPublicLog(`猎手开枪：${hunter.name} 指向 ${target.name}。`);
  if (target.role?.type === "恶魔") {
    target.alive = false;
    addPublicLog(`恶魔被猎杀：${target.name}。`);
    checkWin();
  } else {
    addPublicLog("猎手未命中恶魔。");
  }
};

const updateNightSelection = ({ playerId, selection }) => {
  if (!playerId) {
    return;
  }
  nightSelections.value = {
    ...nightSelections.value,
    [playerId]: selection,
  };
};

const completeNightStep = () => {
  const currentRoleId = activeNightRoleId.value;
  if (!currentRoleId || phaseIndex.value !== 0) {
    return;
  }
  const player = activePlayers.value.find((item) => item.id === currentPlayerId.value);
  if (!player) {
    return;
  }
  const roleId = player.displayRole?.id || player.role?.id || "";
  if (roleId !== currentRoleId) {
    return;
  }
  if (roleId === "poisoner" && player.alive) {
    applyPoisoner(player);
  }
  if (
    [
      "washerwoman",
      "librarian",
      "investigator",
      "chef",
      "empath",
      "fortune",
      "undertaker",
    ].includes(roleId)
  ) {
    if (!nightInfoDelivered.value[player.id]) {
      deliverNightInfo(player, dayNumber.value === 1);
      nightInfoDelivered.value = { ...nightInfoDelivered.value, [player.id]: true };
    }
  }
  if (roleId === "ravenkeeper" && player && !player.alive && ravenkeeperPending.value[player.id]) {
    const targetId = nightSelections.value[player.id]?.ravenkeeperTargetId;
    if (!targetId) {
      addPrivateLog(player.id, "请先选择守鸦人目标。");
      return;
    }
    const target =
      activePlayers.value.find((item) => item.id === targetId) ||
      activePlayers.value.find((item) => item.id !== player.id);
    if (target) {
      addPrivateLog(player.id, `守鸦人目标：${target.name}。角色为 ${target.role?.name || "未知"}。`);
    }
    const pending = { ...ravenkeeperPending.value };
    delete pending[player.id];
    ravenkeeperPending.value = pending;
    if (Object.keys(ravenkeeperPending.value).length === 0) {
      awaitingRavenkeeper.value = false;
    }
  }
  advanceNightStep();
  if (nightStepIndex.value === -1 && !awaitingRavenkeeper.value) {
    resolveNight();
    nightSelections.value = {};
    nightInfoDelivered.value = {};
    nightPoisonApplied.value = false;
    executedToday.value = false;
    checkWin();
    phaseIndex.value = 1;
  }
};

const hasVoted = (playerId) => Object.prototype.hasOwnProperty.call(voteMap.value, playerId);

const canPlayerVote = (player) => {
  if (!player?.alive) {
    return !ghostVoteUsed.value[player?.id];
  }
  if (player.role?.id !== "butler") {
    return true;
  }
  const master = activePlayers.value.find((item) => item.id === butlerMasterId.value);
  if (!master) {
    return false;
  }
  return hasVoted(master.id);
};

const advanceVoteTurn = () => {
  let idx = voteIndex.value + 1;
  while (idx < voteOrder.value.length) {
    const candidate = activePlayers.value.find((item) => item.id === voteOrder.value[idx]);
    if (candidate && canPlayerVote(candidate) && !hasVoted(candidate.id)) {
      voteIndex.value = idx;
      return;
    }
    idx += 1;
  }
  voteIndex.value = voteOrder.value.length;
  addPublicLog("投票已结束。");
  finalizeNomination();
};

const finalizeNomination = () => {
  if (!nomineeId.value) {
    return;
  }
  const votes = Object.values(voteMap.value).filter((value) => value === true).length;
  nominationResults.value = [...nominationResults.value, { nomineeId: nomineeId.value, votes }];
  const nominee = activePlayers.value.find((player) => player.id === nomineeId.value);
  addPublicLog(`本次投票结果：${nominee?.name || "未知"}（${votes}票）`);
  nomineeId.value = "";
  voteMap.value = {};
  voteOrder.value = [];
  voteIndex.value = -1;
  advanceVoteTurn();
};

const castVoteFor = (playerId, isYes) => {
  const player = activePlayers.value.find((item) => item.id === playerId);
  if (!player) {
    return;
  }
  if (player.id !== currentVoterId.value) {
    return;
  }
  if (!canPlayerVote(player)) {
    return;
  }
  if (player.role?.id === "butler" && isYes && !canPlayerVote(player)) {
    addPrivateLog(player.id, "管家只能在主人投票时投票。");
    return;
  }
  if (hasVoted(player.id)) {
    return;
  }
  if (!player.alive) {
    if (ghostVoteUsed.value[player.id]) {
      return;
    }
    ghostVoteUsed.value = { ...ghostVoteUsed.value, [player.id]: true };
  }
  voteMap.value = { ...voteMap.value, [player.id]: isYes };
  advanceVoteTurn();
};

const castVote = (isYes) => {
  castVoteFor(currentPlayerId.value, isYes);
};

const startNomination = (targetId) => {
  if (!targetId) {
    addPublicLog("请选择被提名者。");
    return;
  }
  if (nomineeId.value) {
    const existingNominee = activePlayers.value.find((player) => player.id === nomineeId.value);
    if (existingNominee) {
      addPublicLog("当前提名尚未结束。");
      return;
    }
    nomineeId.value = "";
    nominatorId.value = "";
  }
  const nominee = activePlayers.value.find((player) => player.id === targetId && player.alive);
  const nominator = activePlayers.value.find((player) => player.id === currentPlayerId.value);
  if (!nominee || !nominator) {
    addPublicLog("提名失败：找不到提名者或被提名者。");
    return;
  }
  if (nominee.role?.id === "virgin" && !virginUsed.value) {
    virginUsed.value = true;
    const isTownsfolk = nominator.role?.type === "村民" && nominator.role?.team === "good";
    if (isTownsfolk) {
      nominator.alive = false;
      lastExecutedRole.value = registeredRoleName(nominator);
      executedToday.value = true;
      addPublicLog(`提名：${nominator.name} 提名 ${nominee.name}。`);
      addPublicLog(`贞洁者触发：${nominator.name} 被立即处刑。`);
      checkWin();
      return;
    }
    addPublicLog("贞洁者被提名，但未触发处刑。");
  }
  const dayKey = String(dayNumber.value);
  const used = nominationsByDay.value[dayKey] || [];
  if (used.includes(nominator.id)) {
    addPublicLog(`${nominator.name} 今日已提名过。`);
    return;
  }
  if (phaseIndex.value === 1) {
    phaseIndex.value = 2;
    voteMap.value = {};
    nomineeId.value = "";
    nominatorId.value = "";
    voteOrder.value = [];
    voteIndex.value = 0;
    nominationResults.value = [];
    addPublicLog("进入投票阶段。");
  }
  nominationsByDay.value = {
    ...nominationsByDay.value,
    [dayKey]: [...new Set([...used, nominator.id])],
  };
  nomineeId.value = targetId;
  nominatorId.value = nominator.id;
  voteMap.value = {};
  voteOrder.value = activePlayers.value
    .slice()
    .sort((a, b) => a.seat - b.seat)
    .map((player) => player.id);
  voteIndex.value = -1;
  advanceVoteTurn();
  addPublicLog(`提名：${nominator.name} 提名 ${nominee.name}。`);
};

const livingPlayers = () => activePlayers.value.filter((player) => player.alive);

const registeredType = (player) => {
  if (player.role?.id === "spy") {
    return spyRegisterType.value || "村民";
  }
  return player.role?.type;
};

const registeredTeam = (player) => {
  if (player.role?.id === "spy") {
    return "good";
  }
  return player.role?.team;
};

const registeredRoleName = (player) => {
  if (player.role?.id === "spy") {
    return spyRegisterRoleName.value || "镇民";
  }
  return player.role?.name || "未知角色";
};

const aliveCount = computed(() => activePlayers.value.filter((player) => player.alive).length);
const voteNeeded = computed(() => Math.floor(aliveCount.value / 2) + 1);

const findLivingScarlet = () =>
  livingPlayers().find((player) => player.role?.id === "scarlet");

const findLivingDemon = () =>
  livingPlayers().find((player) => player.role?.type === "恶魔");

const maybePromoteScarlet = () => {
  const living = livingPlayers();
  const scarlet = living.find((player) => player.role?.id === "scarlet");
  const hasDemon = living.some((player) => player.role?.type === "恶魔");
  if (hasDemon || !scarlet || living.length < 5) {
    return false;
  }
  const demonRole = rolePools.demon[0];
  scarlet.role = demonRole;
  scarlet.displayRole = demonRole;
  addPublicLog(`红唇女郎转化为恶魔：${scarlet.name}`);
  return true;
};

const assignRoles = () => {
  const counts = baseDistribution.value;
  const outsiderLimit = rolePools.outsiders.length;
  let minionPool = null;
  let attempts = 0;
  while (!minionPool && attempts < 10) {
    const candidate = pickRoles(rolePools.minions, counts.minions);
    if (!candidate) {
      break;
    }
    const hasBaron = candidate.some((role) => role.id === "baron");
    const outsiderCount = Math.max(0, counts.outsiders + (hasBaron ? 2 : 0));
    if (outsiderCount <= outsiderLimit) {
      minionPool = candidate;
      baronActive.value = hasBaron;
      break;
    }
    attempts += 1;
  }
  if (!minionPool) {
    baronActive.value = false;
    addPublicLog("爪牙角色数量不足，无法开局。");
    return false;
  }
  const adjustedCounts = distribution.value;
  const townsfolkPool = pickTownsfolk(adjustedCounts.townsfolk);
  const outsiderPool = pickRoles(rolePools.outsiders, adjustedCounts.outsiders);
  const demonPool = pickRoles(rolePools.demon, counts.demon);
  if (!townsfolkPool || !outsiderPool || !demonPool) {
    baronActive.value = false;
    addPublicLog("角色数量不足，无法开局。请补全角色池或调整人数。");
    return false;
  }
  const roles = [
    ...townsfolkPool,
    ...outsiderPool,
    ...minionPool,
    ...demonPool,
  ];
  const shuffledRoles = shuffle(roles);
  activePlayers.value.forEach((player, index) => {
    player.role = shuffledRoles[index] || null;
    player.displayRole = player.role;
    player.fakeRole = null;
    player.poisonedUntilDay = 0;
    player.alive = true;
    player.privateLog = [];
  });
  const drunkPlayers = activePlayers.value.filter((player) => player.role?.id === "drunk");
  drunkPlayers.forEach((player) => {
    const fakeRole = shuffle(rolePools.townsfolk)[0] || null;
    player.fakeRole = fakeRole;
    player.displayRole = fakeRole;
  });
  const fortune = activePlayers.value.find((player) => player.role?.id === "fortune");
  if (fortune) {
    const goodPlayers = activePlayers.value.filter(
      (player) => player.role?.team === "good" && player.id !== fortune.id
    );
    redHerringId.value = shuffle(goodPlayers)[0]?.id || "";
  } else {
    redHerringId.value = "";
  }
  lastExecutedRole.value = "";
  addPublicLog("系统已完成角色分配。");
  if (baronActive.value) {
    addPublicLog("男爵生效：外来者 +2，村民 -2。");
  }
  const spy = activePlayers.value.find((player) => player.role?.id === "spy");
  if (spy) {
    spyRegisterType.value = Math.random() > 0.5 ? "村民" : "外来者";
    const pool = spyRegisterType.value === "村民" ? rolePools.townsfolk : rolePools.outsiders;
    spyRegisterRoleName.value = shuffle(pool)[0]?.name || "镇民";
    const summary = activePlayers.value
      .map((player) => `${player.name}：${player.role?.name || "未知"}（${player.role?.team === "evil" ? "恶方" : "善方"}）`)
      .join("，");
    addPrivateLog(spy.id, `剧本角色一览：${summary}`);
    addPrivateLog(spy.id, `你被注册为：${spyRegisterRoleName.value}（${spyRegisterType.value}）。`);
  }
  if (!spy) {
    spyRegisterType.value = "";
    spyRegisterRoleName.value = "";
  }
  const evilPlayers = activePlayers.value.filter((player) => player.role?.team === "evil");
  if (evilPlayers.length > 0) {
    const list = evilPlayers.map((player) => player.name).join("、");
    evilPlayers.forEach((player) => {
      addPrivateLog(player.id, `邪恶阵营：${list}`);
    });
  }
  return true;
};

const resolveNight = () => {
  const living = livingPlayers();
  const isFirstNight = dayNumber.value === 1;
  const demon = findLivingDemon();
  const poisoner = living.find((player) => player.role?.id === "poisoner");
  const monk = living.find((player) => player.role?.id === "monk");
  const butler = living.find((player) => player.role?.id === "butler");
  if (poisoner && !nightPoisonApplied.value) {
    applyPoisoner(poisoner);
  }
  poisonTargetId.value = "";

  const isPoisoned = (player) => player?.poisonedUntilDay >= dayNumber.value;
  const monkSelection = monk ? nightSelections.value[monk.id] : null;
  let protectedId = "";
  if (!isFirstNight && monk && !isPoisoned(monk)) {
    const candidates = living.filter((player) => player.id !== monk.id);
    const target = candidates.find((player) => player.id === monkSelection?.monkTargetId) || shuffle(candidates)[0];
    protectedId = target?.id || "";
  }

  let nightDeath = null;
  if (!isFirstNight && demon) {
    const targetCandidates = living.filter((player) => player.id !== demon.id);
    const demonSelection = nightSelections.value[demon.id];
    const demonTargetId = demonSelection?.demonTargetId || "";
    const target = targetCandidates.find((player) => player.id === demonTargetId) || shuffle(targetCandidates)[0];
    if (target && target.id === demon.id && demon.role?.id === "imp") {
      demon.alive = false;
      addPublicLog(`夜晚死亡：${demon.name}（自杀）`);
      const minions = living.filter((player) => player.role?.type === "爪牙");
      const promoted = shuffle(minions)[0];
      if (promoted) {
        const demonRole = rolePools.demon[0];
        promoted.role = demonRole;
        promoted.displayRole = demonRole;
        addPrivateLog(promoted.id, "你成为新的恶魔。");
        addPublicLog(`小恶魔转移：${promoted.name}`);
      }
    } else if (target) {
      let resolvedTarget = target;
      const mayorRedirect =
        resolvedTarget.role?.id === "mayor" && !isPoisoned(resolvedTarget);
      if (mayorRedirect) {
        const redirectPool = living.filter(
          (player) => player.id !== resolvedTarget.id && player.id !== demon.id
        );
        resolvedTarget = redirectPool.length ? shuffle(redirectPool)[0] : resolvedTarget;
      }
      if (resolvedTarget.id === protectedId) {
        addPublicLog(`僧侣守护：${resolvedTarget.name} 安然无恙。`);
      } else if (resolvedTarget.role?.id === "soldier" && !isPoisoned(resolvedTarget)) {
        addPublicLog("夜晚无人死亡。");
      } else {
        resolvedTarget.alive = false;
        nightDeath = resolvedTarget;
        addPublicLog(`夜晚死亡：${resolvedTarget.name}`);
      }
    } else {
      addPublicLog("夜晚无人死亡。");
    }
  } else if (isFirstNight) {
    addPublicLog("首夜恶魔未行动。");
  }

  const randomPair = () => {
    const pool = shuffle(activePlayers.value);
    return pool.slice(0, 2);
  };

  const randomInfoNumber = (max) => Math.floor(Math.random() * (max + 1));

  const randomRoleName = (pool) => {
    const source = pool.map((role) => role.name);
    return shuffle(source)[0] || "未知角色";
  };

  const pickWithDecoy = (targetPlayer) => {
    const decoyCandidates = activePlayers.value.filter((player) => player.id !== targetPlayer.id);
    const decoy = shuffle(decoyCandidates)[0];
    const pair = shuffle([targetPlayer, decoy]).filter(Boolean);
    return pair.length === 2 ? pair : [];
  };

  const addSpyLog = (text) => {
    const spy = activePlayers.value.find((item) => item.role?.id === "spy");
    if (spy) {
      addPrivateLog(spy.id, text);
    }
  };

  const deliverInfo = (player) => {
    const isDrunk = player.role?.id === "drunk";
    const infoRoleId = isDrunk ? player.fakeRole?.id : player.role?.id;
    const shouldFakeInfo = isDrunk || isPoisoned(player);
    if (infoRoleId === "washerwoman" && isFirstNight) {
      if (shouldFakeInfo) {
        const pair = randomPair();
        const roleName = randomRoleName(rolePools.townsfolk);
        if (pair.length === 2) {
          const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${roleName}。`;
          addPrivateLog(player.id, message);
          addSpyLog(`洗衣妇信息：${message}`);
        }
        return;
      }
      const townsfolk = activePlayers.value.filter((item) => registeredType(item) === "村民");
      const targetRolePlayer = shuffle(townsfolk)[0];
      if (targetRolePlayer) {
        const pair = pickWithDecoy(targetRolePlayer);
        if (pair.length === 2) {
          const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${registeredRoleName(targetRolePlayer)}。`;
          addPrivateLog(player.id, message);
          addSpyLog(`洗衣妇信息：${message}`);
        }
      }
    }
    if (infoRoleId === "librarian" && isFirstNight) {
      if (shouldFakeInfo) {
        const showNone = Math.random() > 0.5;
        if (showNone) {
          const message = "场上没有外来者。";
          addPrivateLog(player.id, message);
          addSpyLog(`图书管理员信息：${message}`);
        } else {
          const pair = randomPair();
          const roleName = randomRoleName(rolePools.outsiders);
          if (pair.length === 2) {
            const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${roleName}。`;
            addPrivateLog(player.id, message);
            addSpyLog(`图书管理员信息：${message}`);
          }
        }
        return;
      }
      const outsiders = activePlayers.value.filter((item) => registeredType(item) === "外来者");
      if (outsiders.length === 0) {
        const message = "场上没有外来者。";
        addPrivateLog(player.id, message);
        addSpyLog(`图书管理员信息：${message}`);
      } else {
        const targetRolePlayer = shuffle(outsiders)[0];
        const pair = pickWithDecoy(targetRolePlayer);
        if (pair.length === 2) {
          const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${registeredRoleName(targetRolePlayer)}。`;
          addPrivateLog(player.id, message);
          addSpyLog(`图书管理员信息：${message}`);
        }
      }
    }
    if (infoRoleId === "investigator" && isFirstNight) {
      if (shouldFakeInfo) {
        const showNone = Math.random() > 0.5;
        if (showNone) {
          const message = "场上没有爪牙。";
          addPrivateLog(player.id, message);
          addSpyLog(`调查员信息：${message}`);
        } else {
          const pair = randomPair();
          const roleName = randomRoleName(rolePools.minions);
          if (pair.length === 2) {
            const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${roleName}。`;
            addPrivateLog(player.id, message);
            addSpyLog(`调查员信息：${message}`);
          }
        }
        return;
      }
      const minions = activePlayers.value.filter((item) => item.role?.type === "爪牙");
      if (minions.length === 0) {
        const message = "场上没有爪牙。";
        addPrivateLog(player.id, message);
        addSpyLog(`调查员信息：${message}`);
      } else {
        const targetRolePlayer = shuffle(minions)[0];
        const pair = pickWithDecoy(targetRolePlayer);
        if (pair.length === 2) {
          const message = `在 ${pair[0].name} 和 ${pair[1].name} 中有一人是 ${targetRolePlayer.role?.name}。`;
          addPrivateLog(player.id, message);
          addSpyLog(`调查员信息：${message}`);
        }
      }
    }
    if (infoRoleId === "empath") {
      if (shouldFakeInfo) {
        addPrivateLog(player.id, `你的两侧存活邻座中有 ${randomInfoNumber(2)} 名恶人。`);
        return;
      }
      const alivePlayers = activePlayers.value.filter((item) => item.alive);
      const index = alivePlayers.findIndex((item) => item.id === player.id);
      const left = alivePlayers[(index - 1 + alivePlayers.length) % alivePlayers.length];
      const right = alivePlayers[(index + 1) % alivePlayers.length];
      const evilCount = [left, right].filter((neighbor) => registeredTeam(neighbor) === "evil").length;
      addPrivateLog(player.id, `你的两侧存活邻座中有 ${evilCount} 名恶人。`);
    }
    if (infoRoleId === "chef" && isFirstNight) {
      if (shouldFakeInfo) {
        const maxPairs = Math.max(0, Math.floor(living.length / 2));
        addPrivateLog(player.id, `相邻邪恶玩家对数为 ${randomInfoNumber(maxPairs)}。`);
        return;
      }
      const alivePlayers = activePlayers.value.filter((item) => item.alive);
      let pairs = 0;
      alivePlayers.forEach((item, idx) => {
        const next = alivePlayers[(idx + 1) % alivePlayers.length];
        if (registeredTeam(item) === "evil" && registeredTeam(next) === "evil") {
          pairs += 1;
        }
      });
      addPrivateLog(player.id, `相邻邪恶玩家对数为 ${pairs}。`);
    }
    if (infoRoleId === "fortune") {
      const candidates = activePlayers.value.filter((item) => item.id !== player.id);
      const selection = nightSelections.value[player.id];
      const picked = candidates.filter((item) => selection?.targets?.includes(item.id));
      const targets = picked.length === 2 ? picked : shuffle(candidates).slice(0, 2);
      if (shouldFakeInfo) {
        const hasDemon = Math.random() > 0.5;
        addPrivateLog(
          player.id,
          `占卜目标：${targets.map((item) => item.name).join("、")}。结果：${hasDemon ? "有恶魔" : "无恶魔"}。`
        );
        return;
      }
      const hasDemon = targets.some(
        (item) => item.role?.type === "恶魔" || item.id === redHerringId.value
      );
      addPrivateLog(
        player.id,
        `占卜目标：${targets.map((item) => item.name).join("、")}。结果：${hasDemon ? "有恶魔" : "无恶魔"}。`
      );
    }
    if (infoRoleId === "undertaker") {
      if (shouldFakeInfo) {
        const roleName = shuffle(allRoleNames)[0] || "未知角色";
        addPrivateLog(player.id, `今天处刑的角色是 ${roleName}。`);
        return;
      }
      if (lastExecutedRole.value) {
        addPrivateLog(player.id, `今天处刑的角色是 ${lastExecutedRole.value}。`);
      } else {
        addPrivateLog(player.id, "今天无人被处刑。");
      }
    }
  };

  const orderedFirstNight = [
    "washerwoman",
    "librarian",
    "investigator",
    "chef",
    "empath",
    "fortune",
    "butler",
    "spy",
  ];

  const orderedOtherNight = [
    "monk",
    "scarlet",
    "imp",
    "ravenkeeper",
    "empath",
    "fortune",
    "butler",
    "undertaker",
    "spy",
  ];

  if (isFirstNight) {
    orderedFirstNight.forEach((roleId) => {
      living.forEach((player) => {
        if ((player.role?.id === roleId || player.fakeRole?.id === roleId) && player.alive) {
          if (!nightInfoDelivered.value[player.id]) {
            deliverInfo(player);
            nightInfoDelivered.value = { ...nightInfoDelivered.value, [player.id]: true };
          }
        }
      });
    });
  } else {
    if (nightDeath && nightDeath.role?.id === "ravenkeeper") {
      if (isPoisoned(nightDeath)) {
        addPrivateLog(nightDeath.id, "你被毒害，无法得到守鸦人信息。");
      } else {
        ravenkeeperPending.value = { ...ravenkeeperPending.value, [nightDeath.id]: true };
        awaitingRavenkeeper.value = true;
        addPrivateLog(nightDeath.id, "你在夜晚死亡，请选择一名玩家以得知其角色。");
      }
    }
    orderedOtherNight.forEach((roleId) => {
      living.forEach((player) => {
        if ((player.role?.id === roleId || player.fakeRole?.id === roleId) && player.alive) {
          if (!nightInfoDelivered.value[player.id]) {
            deliverInfo(player);
            nightInfoDelivered.value = { ...nightInfoDelivered.value, [player.id]: true };
          }
        }
      });
    });
  }

  if (butler) {
    const candidates = living.filter((player) => player.id !== butler.id);
    const selection = nightSelections.value[butler.id];
    let master = candidates.find((player) => player.id === selection?.masterId);
    if (!master) {
      master = shuffle(candidates)[0];
    }
    butlerMasterId.value = master?.id || "";
  } else {
    butlerMasterId.value = "";
  }
};

const resolveVote = () => {
  if (nomineeId.value) {
    finalizeNomination();
  }
  if (nominationResults.value.length === 0) {
    addPublicLog("本日无人被处刑。");
    lastExecutedRole.value = "";
    return;
  }
  const maxVotes = Math.max(...nominationResults.value.map((item) => item.votes));
  if (maxVotes < voteNeeded.value) {
    addPublicLog(`本日无人被处刑（最高 ${maxVotes}/${voteNeeded.value}）。`);
    nominationResults.value = [];
    return;
  }
  const top = nominationResults.value.filter((item) => item.votes === maxVotes);
  if (top.length !== 1) {
    addPublicLog(`本日无人被处刑（最高票平局 ${maxVotes}）。`);
    nominationResults.value = [];
    return;
  }
  const nominee = activePlayers.value.find((player) => player.id === top[0].nomineeId);
  if (!nominee) {
    addPublicLog("本日无人被处刑。");
    nominationResults.value = [];
    return;
  }
  if (nominee.role?.type === "恶魔") {
    const scarlet = findLivingScarlet();
    if (scarlet && livingPlayers().length >= 5) {
      addPublicLog("红唇女郎守护：恶魔未被处刑。");
      nominationResults.value = [];
      return;
    }
  }
  nominee.alive = false;
  lastExecutedRole.value = registeredRoleName(nominee);
  executedToday.value = true;
  addPublicLog(`处刑：${nominee.name}（${maxVotes}/${voteNeeded.value}）`);
  nominationResults.value = [];
};

const checkWin = () => {
  const living = livingPlayers();
  const demonAlive = living.some((player) => player.role?.type === "恶魔");
  if (!demonAlive && maybePromoteScarlet()) {
    return;
  }
  const mayorAlive = living.some((player) => player.role?.id === "mayor");
  if (living.length === 3 && mayorAlive && !executedToday.value) {
    gameOver.value = true;
    winner.value = "善方胜利";
    addPublicLog("镇长守护生效：三人局未处刑，善方胜利。");
    return;
  }
  const evilCount = living.filter((player) => player.role?.team === "evil").length;
  const goodCount = living.filter((player) => player.role?.team === "good").length;
  if (!demonAlive) {
    gameOver.value = true;
    winner.value = "善方胜利";
    addPublicLog("恶魔已死亡，善方胜利。");
  } else if (evilCount >= goodCount) {
    gameOver.value = true;
    winner.value = "恶方胜利";
    addPublicLog("恶方人数已达到或超过善方，恶方胜利。");
  }
};

const goLobby = () => {
  view.value = "lobby";
};

const goGame = () => {
  view.value = "game";
  phaseIndex.value = 0;
  dayNumber.value = 1;
  gameOver.value = false;
  winner.value = "";
  publicLog.value = [];
  nomineeId.value = "";
  poisonTargetId.value = "";
  nominatorId.value = "";
  executedToday.value = false;
  baronActive.value = false;
  spyRegisterType.value = "";
  spyRegisterRoleName.value = "";
  voteMap.value = {};
  butlerMasterId.value = "";
  nightSelections.value = {};
  hunterUsed.value = {};
  virginUsed.value = false;
  ravenkeeperPending.value = {};
  awaitingRavenkeeper.value = false;
  nightStepIndex.value = 0;
  nightInfoDelivered.value = {};
  nightPoisonApplied.value = false;
  voteOrder.value = [];
  voteIndex.value = 0;
  nominationsByDay.value = {};
  nominationResults.value = [];
  ghostVoteUsed.value = {};
  publicLog.value = [];
  const started = assignRoles();
  if (!started) {
    view.value = "lobby";
    return;
  }
  if (!activePlayers.value.find((player) => player.id === currentPlayerId.value)) {
    currentPlayerId.value = activePlayers.value[0]?.id || "";
  }
  resetNightStep();
  addPublicLog("第 1 夜开始。");
};

const nextPhase = () => {
  if (gameOver.value) {
    return;
  }
  if (phaseIndex.value === 0) {
    if (awaitingRavenkeeper.value || nightStepIndex.value !== -1) {
      return;
    }
    if (awaitingRavenkeeper.value) {
      const pendingIds = Object.keys(ravenkeeperPending.value).filter(
        (id) => ravenkeeperPending.value[id]
      );
      const missing = pendingIds.filter(
        (id) => !nightSelections.value[id]?.ravenkeeperTargetId
      );
      if (missing.length) {
        missing.forEach((id) => {
          addPrivateLog(id, "请先选择守鸦人目标。");
        });
        return;
      }
      pendingIds.forEach((id) => {
        const targetId = nightSelections.value[id]?.ravenkeeperTargetId;
        const target =
          activePlayers.value.find((player) => player.id === targetId) ||
          activePlayers.value.find((player) => player.id !== id);
        if (target) {
          addPrivateLog(id, `守鸦人目标：${target.name}。角色为 ${target.role?.name || "未知"}。`);
        }
      });
      ravenkeeperPending.value = {};
      awaitingRavenkeeper.value = false;
      nightSelections.value = {};
      checkWin();
      phaseIndex.value = 1;
      return;
    }
    const demon = activePlayers.value.find((player) => player.alive && player.role?.type === "恶魔");
    if (demon && dayNumber.value > 1) {
      const selection = nightSelections.value[demon.id];
      const targetId = selection?.demonTargetId || "";
      if (!targetId) {
        addPublicLog("恶魔必须选择夜晚目标。");
        return;
      }
    }
    if (hasPoisoner.value) {
      const poisoner = activePlayers.value.find((player) => player.alive && player.role?.id === "poisoner");
      const selection = poisoner ? nightSelections.value[poisoner.id] : null;
      const targetId = selection?.poisonTargetId || "";
      if (!targetId || targetId === poisoner?.id) {
        addPublicLog("投毒者必须选择非自己的投毒目标。");
        return;
      }
    }
    resolveNight();
    if (awaitingRavenkeeper.value) {
      return;
    }
    nightSelections.value = {};
    executedToday.value = false;
    if (!butlerMasterId.value) {
      const butler = activePlayers.value.find((player) => player.role?.id === "butler");
      if (butler) {
        const candidates = activePlayers.value.filter((player) => player.id !== butler.id);
        butlerMasterId.value = shuffle(candidates)[0]?.id || "";
      }
    }
    checkWin();
    phaseIndex.value = 1;
    return;
  }
  if (phaseIndex.value === 1) {
    phaseIndex.value = 2;
    voteMap.value = {};
    nomineeId.value = "";
    nominatorId.value = "";
    voteOrder.value = [];
    voteIndex.value = 0;
    nominationResults.value = [];
    addPublicLog("进入投票阶段。");
    return;
  }
  if (phaseIndex.value === 2) {
    resolveVote();
    checkWin();
    nomineeId.value = "";
    nominatorId.value = "";
    phaseIndex.value = 3;
    return;
  }
  if (phaseIndex.value === 3) {
    phaseIndex.value = 0;
    dayNumber.value += 1;
    voteMap.value = {};
    voteOrder.value = [];
    voteIndex.value = 0;
    nominationsByDay.value = {};
    nominationResults.value = [];
    nightSelections.value = {};
    nightInfoDelivered.value = {};
    nightPoisonApplied.value = false;
    resetNightStep();
    addPublicLog(`第 ${dayNumber.value} 夜开始。`);
  }
};
</script>

<style scoped>
.table-zone {
  position: relative;
  display: grid;
  place-items: center;
  gap: 16px;
  overflow: visible;
}

.dock {
  grid-column: 1;
  grid-row: 2 / span 2;
  align-self: start;
  display: grid;
  gap: 16px;
}

.join-panel {
  grid-column: 2;
}

.table-panel {
  grid-column: 2;
}

.host-panel {
  grid-column: 3;
  grid-row: 2 / span 2;
  align-self: start;
}

.lobby-panel {
  grid-column: 1;
  grid-row: 2 / span 2;
  align-self: start;
}

.view-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.view-tools select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-cream);
  border-radius: 999px;
  padding: 6px 12px;
}


@media (max-width: 980px) {
  .join-panel,
  .table-panel,
  .host-panel,
  .lobby-panel {
    grid-column: 1;
    grid-row: auto;
  }

  .dock {
    grid-column: 1;
    grid-row: auto;
  }

  .table-zone {
    order: 2;
  }
}
</style>
