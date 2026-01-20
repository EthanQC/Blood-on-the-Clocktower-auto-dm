<template>
  <section class="ring">
    <div class="halo"></div>
    <div class="center">
      <div class="center-badge">{{ isNight ? '夜晚阶段' : '白天阶段' }}</div>
      <span class="muted">{{ isNight ? '能力按顺序发动' : '自由讨论时间' }}</span>
    </div>
    <div
      v-for="(player, index) in players"
      :key="player.id"
      class="seat"
      :class="{ 
        me: player.id === meId, 
        dead: !player.alive,
        townsfolk: player.role?.team === 'good',
        demon: player.role?.team === 'evil'
      }"
      :style="seatStyle(index)"
      @click="$emit('select-player', player)"
    >
      <!-- Token Circle -->
      <div class="token" :class="player.role?.team">
        <img 
          v-if="player.role?.id" 
          :src="getRoleIcon(player.role.id)" 
          :alt="player.role.name"
          class="role-icon"
        />
        <div class="life-token" :class="{ dead: !player.alive }"></div>
      </div>
      <!-- Shroud for dead players -->
      <div v-if="!player.alive" class="shroud"></div>
      <!-- Player name -->
      <div class="name-tag">
        <span class="name">{{ player.name }}</span>
        <span v-if="player.role && showRoles" class="role-name">{{ player.role.name }}</span>
      </div>
      <!-- Ghost vote indicator -->
      <div v-if="!player.alive && !player.ghostVoteUsed" class="ghost-vote" title="可用鬼魂票">👻</div>
    </div>
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
  isNight: {
    type: Boolean,
    default: false,
  },
  showRoles: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['select-player']);

const seatStyle = (index) => {
  const count = props.players.length || 1;
  const angle = (index / count) * 360 - 90; // Start from top
  return {
    transform: `rotate(${angle}deg) translate(var(--ring-size)) rotate(-${angle}deg)`,
  };
};

const getRoleIcon = (roleId) => {
  try {
    return new URL(`../assets/icons/${roleId}.png`, import.meta.url).href;
  } catch {
    return new URL('../assets/icons/custom.png', import.meta.url).href;
  }
};
</script>

<style scoped>
.ring {
  --ring-size: clamp(160px, min(28vw, 28vh), 360px);
  position: relative;
  width: calc(var(--ring-size) * 2.2);
  height: calc(var(--ring-size) * 2.2);
  display: grid;
  place-items: center;
  animation: float-in 0.8s ease forwards;
}

.halo {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: radial-gradient(circle, rgba(200, 66, 58, 0.12), transparent 65%);
  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.4);
}

.center {
  position: absolute;
  z-index: 1;
  text-align: center;
}

.center-badge {
  font-family: "PiratesBay", "Space Grotesk", sans-serif;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(200, 66, 58, 0.25);
  margin-bottom: 8px;
  border: 1px solid rgba(200, 66, 58, 0.4);
}

.seat {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.seat:hover {
  transform: scale(1.08);
}

.seat.me .token {
  box-shadow: 0 0 0 3px var(--accent-gold), 0 0 20px rgba(217, 164, 65, 0.5);
}

/* Token styles from townsquare */
.token {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: url("../assets/token.png") center center;
  background-size: 100%;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.token.townsfolk,
.token.good {
  border-color: var(--townsfolk);
  box-shadow: 0 0 15px rgba(31, 101, 255, 0.4);
}

.token.demon,
.token.evil {
  border-color: var(--demon);
  box-shadow: 0 0 15px rgba(206, 1, 0, 0.4);
}

.role-icon {
  width: 60%;
  height: 60%;
  object-fit: contain;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
}

.life-token {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: url("../assets/life.png") center center no-repeat;
  background-size: contain;
  transition: transform 0.3s ease;
}

.life-token.dead {
  background-image: url("../assets/death.png");
}

/* Death shroud */
.shroud {
  position: absolute;
  top: -10px;
  width: 100px;
  height: 120px;
  background: url("../assets/shroud.png") center top no-repeat;
  background-size: contain;
  pointer-events: none;
  opacity: 0.9;
}

.seat.dead .token {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.name-tag {
  margin-top: 8px;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 10px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.name {
  font-family: "Papyrus", serif;
  font-size: 14px;
  font-weight: 600;
  display: block;
}

.role-name {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ghost-vote {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

@media (max-width: 980px) {
  .ring {
    --ring-size: clamp(120px, 25vw, 200px);
  }

  .token {
    width: 60px;
    height: 60px;
  }

  .name {
    font-size: 12px;
  }
}
</style>
