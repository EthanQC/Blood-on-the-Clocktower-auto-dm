<template>
  <section class="ring">
    <div class="halo"></div>
    <div class="center">
      <div class="center-badge">夜晚阶段</div>
      <span class="muted">低语顺时针传递</span>
    </div>
    <button
      v-for="(player, index) in players"
      :key="player.id"
      class="seat"
      :class="{ me: player.id === meId, dead: !player.alive }"
      :style="seatStyle(index)"
    >
      <span class="name">{{ player.name }}</span>
      <span class="state">{{ player.alive ? "存活" : "死亡" }}</span>
    </button>
  </section>
</template>

<script setup>
const props = defineProps({
  players: {
    type: Array,
    required: true,
  },
  meId: {
    type: String,
    default: "",
  },
});

const seatStyle = (index) => {
  const count = props.players.length || 1;
  const angle = (index / count) * 360;
  return {
    transform: `rotate(${angle}deg) translate(var(--ring-size)) rotate(-${angle}deg)`,
  };
};
</script>

<style scoped>
.ring {
  position: relative;
  width: calc(var(--ring-size) * 2);
  height: calc(var(--ring-size) * 2);
  display: grid;
  place-items: center;
  animation: float-in 0.8s ease forwards;
}

.halo {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: radial-gradient(circle, rgba(200, 66, 58, 0.18), transparent 65%);
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.35);
}

.center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.center-badge {
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(200, 66, 58, 0.25);
  margin-bottom: 6px;
}

.seat {
  position: absolute;
  width: 120px;
  height: 64px;
  border: none;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-cream);
  display: grid;
  place-items: center;
  gap: 4px;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.seat:hover {
  background: rgba(255, 255, 255, 0.14);
}

.seat.me {
  border: 1px solid rgba(217, 164, 65, 0.8);
  box-shadow: 0 10px 24px rgba(217, 164, 65, 0.24);
}

.seat.dead {
  opacity: 0.55;
}

.name {
  font-weight: 600;
}

.state {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .ring {
    width: 100%;
    height: 360px;
  }

  .seat {
    width: 100px;
    height: 58px;
  }
}
</style>
