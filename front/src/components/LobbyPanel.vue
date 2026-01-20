<template>
  <section class="lobby">
    <h2>大厅状态</h2>
    <div class="stat-line">
      <span class="pill">说书人</span>
      <span class="muted">Mara · 座位 1</span>
    </div>
    <ul class="players">
      <li v-for="player in players" :key="player.id" :class="{ dead: !player.alive }">
        <div class="seat">{{ player.seat }}</div>
        <div>
          <strong>{{ player.name }}</strong>
          <span class="muted">{{ player.alive ? "存活" : "死亡" }}</span>
        </div>
        <span class="ready" :class="{ on: player.ready }">
          {{ player.ready ? "已就绪" : "等待中" }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  players: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.lobby {
  display: grid;
  gap: 14px;
}

.stat-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.players {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.players li {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.players li.dead {
  opacity: 0.6;
}

.seat {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.12);
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  font-weight: 600;
}

.ready {
  font-size: 12px;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.ready.on {
  background: rgba(127, 209, 185, 0.3);
  color: var(--accent-mint);
}
</style>
