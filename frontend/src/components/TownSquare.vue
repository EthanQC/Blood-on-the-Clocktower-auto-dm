<template>
  <div id="townsquare" class="square" :class="squareClasses">
    <ul class="circle" :class="['size-' + players.length]">
      <Player
        v-for="(player, index) in players"
        :key="index"
        :player="player"
        :index="index"
        :class="playerClasses(index)"
        @trigger="handleTrigger(index, $event as [string, unknown?])"
      />
    </ul>

    <div
      v-if="players.length"
      ref="bluffsRef"
      class="bluffs"
      :class="{ closed: !isBluffsOpen }"
    >
      <h3>
        <span v-if="session.isSpectator">Other characters</span>
        <span v-else>Demon bluffs</span>
        <font-awesome-icon icon="times-circle" @click.stop="isBluffsOpen = false" />
        <font-awesome-icon icon="plus-circle" @click.stop="isBluffsOpen = true" />
      </h3>
      <ul>
        <li
          v-for="index in 3"
          :key="index"
          @click="openRoleModal(index * -1)"
        >
          <Token :role="playersStore.bluffs[index - 1]" />
        </li>
      </ul>
    </div>

    <div
      v-if="playersStore.fabled.length"
      class="fabled"
      :class="{ closed: !isFabledOpen }"
    >
      <h3>
        <span>Fabled</span>
        <font-awesome-icon icon="times-circle" @click.stop="isFabledOpen = false" />
        <font-awesome-icon icon="plus-circle" @click.stop="isFabledOpen = true" />
      </h3>
      <ul>
        <li
          v-for="(role, index) in playersStore.fabled"
          :key="index"
          @click="removeFabled(index)"
        >
          <Token :role="role" />
        </li>
      </ul>
    </div>

    <ReminderModal :player-index="selectedPlayer" />
    <RoleModal :player-index="selectedPlayer" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGrimoireStore, usePlayersStore, useSessionStore } from '@/stores'
import Player from './Player.vue'
import Token from './Token.vue'
import ReminderModal from '@/modals/ReminderModal.vue'
import RoleModal from '@/modals/RoleModal.vue'

const grimoire = useGrimoireStore()
const playersStore = usePlayersStore()
const session = useSessionStore()

const { players } = storeToRefs(playersStore)

// Local state
const selectedPlayer = ref(0)
const swap = ref(-1)
const move = ref(-1)
const nominate = ref(-1)
const isBluffsOpen = ref(true)
const isFabledOpen = ref(true)

// Computed
const squareClasses = computed(() => ({
  public: grimoire.isPublic,
  spectator: session.isSpectator,
  vote: session.nomination
}))

function playerClasses(index: number) {
  return {
    from: Math.max(swap.value, move.value, nominate.value) === index,
    swap: swap.value > -1,
    move: move.value > -1,
    nominate: nominate.value > -1
  }
}

// Methods
function handleTrigger(playerIndex: number, [method, params]: [string, unknown?]) {
  switch (method) {
    case 'openRoleModal':
      openRoleModal(playerIndex)
      break
    case 'openReminderModal':
      openReminderModal(playerIndex)
      break
    case 'removePlayer':
      removePlayer(playerIndex)
      break
    case 'swapPlayer':
      swapPlayer(playerIndex, params as number | undefined)
      break
    case 'movePlayer':
      movePlayer(playerIndex, params as number | undefined)
      break
    case 'nominatePlayer':
      nominatePlayer(playerIndex, params as number | undefined)
      break
    case 'claimSeat':
      claimSeat(playerIndex)
      break
  }
}

function openRoleModal(playerIndex: number) {
  selectedPlayer.value = playerIndex
  grimoire.toggleModal('role')
}

function openReminderModal(playerIndex: number) {
  selectedPlayer.value = playerIndex
  grimoire.toggleModal('reminder')
}

function removePlayer(playerIndex: number) {
  if (session.isSpectator || session.lockedVote) return
  if (confirm(`Do you really want to remove ${players.value[playerIndex].name}?`)) {
    playersStore.remove(playerIndex)
  }
}

function swapPlayer(from: number, to?: number) {
  if (session.isSpectator || session.lockedVote) return
  if (to === undefined) {
    cancel()
    swap.value = from
  } else {
    playersStore.swap([swap.value, to])
    cancel()
  }
}

function movePlayer(from: number, to?: number) {
  if (session.isSpectator || session.lockedVote) return
  if (to === undefined) {
    cancel()
    move.value = from
  } else {
    playersStore.move([move.value, to])
    cancel()
  }
}

function nominatePlayer(from: number, to?: number) {
  if (session.isSpectator || session.lockedVote) return
  if (to === undefined) {
    cancel()
    if (from !== nominate.value) {
      nominate.value = from
    }
  } else {
    session.setNomination([nominate.value, to])
    cancel()
  }
}

function claimSeat(playerIndex: number) {
  if (!session.isSpectator) return
  session.claimSeat(playerIndex)
}

function removeFabled(index: number) {
  if (session.isSpectator) return
  playersStore.setFabled({ index })
}

function cancel() {
  move.value = -1
  swap.value = -1
  nominate.value = -1
}
</script>

<style lang="scss">
@use 'sass:math';
@import '@/styles/vars';

#townsquare {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
}

.circle {
  padding: 0;
  width: 100%;
  height: 100%;
  list-style: none;
  margin: 0;

  > li {
    position: absolute;
    left: 50%;
    height: 50%;
    transform-origin: 0 100%;
    pointer-events: none;

    &:hover {
      z-index: 25 !important;
    }

    > .player {
      margin-left: -50%;
      width: 100%;
      pointer-events: all;
    }
  }
}

// Generate rotation for each seat
@for $i from 1 through 20 {
  .circle.size-#{$i} > li {
    @for $j from 1 through $i {
      &:nth-child(#{$j}) {
        transform: rotate(math.div(360deg * ($j - 1), $i));
        z-index: $i - $j + 1;
      }
    }
  }
}

// Bluffs panel
.bluffs,
.fabled {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 10px;

  &.closed {
    ul {
      display: none;
    }
    .fa-plus-circle {
      display: inline;
    }
    .fa-times-circle {
      display: none;
    }
  }

  h3 {
    font-size: 80%;
    margin-bottom: 10px;
    cursor: pointer;

    svg {
      margin-left: 10px;
    }

    .fa-plus-circle {
      display: none;
    }
  }

  ul {
    display: flex;
    gap: 5px;
  }

  li {
    width: 60px;
    height: 60px;
    cursor: pointer;
  }
}

.fabled {
  right: auto;
  left: 10px;
}
</style>
