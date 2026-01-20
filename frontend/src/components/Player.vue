<template>
  <li :style="zoomStyle">
    <div
      ref="playerRef"
      class="player"
      :class="playerClasses"
    >
      <div class="shroud" @click="toggleStatus" />
      <div class="life" @click="toggleStatus" />

      <Token :role="player.role" @click="emit('trigger', ['openRoleModal'])" />

      <!-- Overlay icons -->
      <div class="overlay">
        <font-awesome-icon
          icon="hand-paper"
          class="vote"
          title="Hand UP"
          @click="vote"
        />
        <font-awesome-icon
          icon="times"
          class="vote"
          title="Hand DOWN"
          @click="vote"
        />
        <font-awesome-icon
          icon="times-circle"
          class="cancel"
          title="Cancel"
          @click="cancel"
        />
        <font-awesome-icon
          icon="exchange-alt"
          class="swap"
          title="Swap seats"
          @click="emit('trigger', ['swapPlayer', index])"
        />
        <font-awesome-icon
          icon="redo-alt"
          class="move"
          title="Move player"
          @click="emit('trigger', ['movePlayer', index])"
        />
        <font-awesome-icon
          icon="hand-point-right"
          class="nominate"
          title="Nominate"
          @click="emit('trigger', ['nominatePlayer', index])"
        />
      </div>

      <!-- Ghost vote icon -->
      <font-awesome-icon
        v-if="player.isDead && !player.isVoteless"
        icon="vote-yea"
        class="has-vote"
        title="Ghost vote"
        @click="updatePlayer('isVoteless', true)"
      />

      <!-- Marked icon -->
      <div class="marked">
        <font-awesome-icon icon="skull" />
      </div>

      <!-- Name -->
      <div
        class="name"
        :class="{ active: isMenuOpen }"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span>{{ player.name }}</span>
        <font-awesome-icon v-if="player.pronouns" icon="venus-mars" />
        <div v-if="player.pronouns" class="pronouns">
          <span>{{ player.pronouns }}</span>
        </div>
      </div>

      <!-- Player menu -->
      <Transition name="fold">
        <ul v-if="isMenuOpen" class="menu">
          <li @click="changePronouns">
            <font-awesome-icon icon="venus-mars" /> Change Pronouns
          </li>
          <template v-if="!session.isSpectator">
            <li @click="changeName">
              <font-awesome-icon icon="user-edit" /> Rename
            </li>
            <li @click="emit('trigger', ['movePlayer'])" :class="{ disabled: session.lockedVote }">
              <font-awesome-icon icon="redo-alt" /> Move player
            </li>
            <li @click="emit('trigger', ['swapPlayer'])" :class="{ disabled: session.lockedVote }">
              <font-awesome-icon icon="exchange-alt" /> Swap seats
            </li>
            <li @click="emit('trigger', ['removePlayer'])" :class="{ disabled: session.lockedVote }">
              <font-awesome-icon icon="times-circle" /> Remove
            </li>
            <li v-if="!session.nomination" @click="emit('trigger', ['nominatePlayer'])">
              <font-awesome-icon icon="hand-point-right" /> Nomination
            </li>
          </template>
          <li
            v-if="session.isSpectator"
            @click="emit('trigger', ['claimSeat'])"
            :class="{ disabled: player.id && player.id !== session.playerId }"
          >
            <font-awesome-icon icon="chair" />
            <template v-if="!player.id">Claim seat</template>
            <template v-else-if="player.id === session.playerId">Vacate seat</template>
            <template v-else>Seat occupied</template>
          </li>
        </ul>
      </Transition>
    </div>

    <!-- Reminders -->
    <div
      v-for="reminder in player.reminders"
      :key="reminder.role + ' ' + reminder.name"
      class="reminder"
      :class="[reminder.role]"
      @click="removeReminder(reminder)"
    >
      <span class="icon" :style="reminderIconStyle(reminder)" />
      <span class="text">{{ reminder.name }}</span>
    </div>
    <div class="reminder add" @click="emit('trigger', ['openReminderModal'])">
      <span class="icon" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGrimoireStore, usePlayersStore, useSessionStore } from '@/stores'
import Token from './Token.vue'
import type { Player, Reminder } from '@/types'

const props = defineProps<{
  player: Player
  index: number
}>()

const emit = defineEmits<{
  trigger: [payload: [string, unknown?]]
}>()

const grimoire = useGrimoireStore()
const playersStore = usePlayersStore()
const session = useSessionStore()

const isMenuOpen = ref(false)

const playerClasses = computed(() => [
  {
    dead: props.player.isDead,
    marked: session.markedPlayer === props.index,
    'no-vote': props.player.isVoteless,
    you: session.sessionId && props.player.id && props.player.id === session.playerId,
    'vote-yes': session.votes[props.index]
  },
  props.player.role.team
])

const zoomStyle = computed(() => {
  const unit = window.innerWidth > window.innerHeight ? 'vh' : 'vw'
  const playerCount = playersStore.players.length
  if (playerCount < 7) return { width: 18 + grimoire.zoom + unit }
  if (playerCount <= 10) return { width: 16 + grimoire.zoom + unit }
  if (playerCount <= 15) return { width: 14 + grimoire.zoom + unit }
  return { width: 12 + grimoire.zoom + unit }
})

function toggleStatus() {
  if (grimoire.isPublic) {
    if (!props.player.isDead) {
      updatePlayer('isDead', true)
    } else if (props.player.isVoteless) {
      updatePlayer('isVoteless', false)
      updatePlayer('isDead', false)
    } else {
      updatePlayer('isVoteless', true)
    }
  } else {
    updatePlayer('isDead', !props.player.isDead)
  }
}

function updatePlayer(property: keyof Player, value: unknown) {
  playersStore.update(props.player, property, value)
  isMenuOpen.value = false
}

function changeName() {
  if (session.isSpectator) return
  const name = prompt('Player name', props.player.name) || props.player.name
  updatePlayer('name', name)
}

function changePronouns() {
  const pronouns = prompt('Player pronouns', props.player.pronouns)
  if (pronouns !== null) {
    updatePlayer('pronouns', pronouns)
  }
}

function vote() {
  // Handle voting logic
}

function cancel() {
  // Cancel current action
}

function removeReminder(reminder: Reminder) {
  const reminders = props.player.reminders.filter(r => r !== reminder)
  updatePlayer('reminders', reminders)
}

function reminderIconStyle(reminder: Reminder) {
  const iconPath = reminder.imageAlt || reminder.role
  return {
    backgroundImage: `url(/src/assets/icons/${iconPath}.png)`
  }
}
</script>

<style lang="scss">
@import '@/styles/vars';

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  &.dead {
    .shroud {
      opacity: 1;
    }
    .token {
      filter: grayscale(100%);
    }
  }

  .shroud {
    position: absolute;
    width: 100%;
    height: 100%;
    background: url('@/assets/shroud.png') center center no-repeat;
    background-size: contain;
    opacity: 0;
    transition: opacity 200ms;
    z-index: 2;
    pointer-events: none;
  }

  .life {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 200ms;

    svg {
      font-size: 2em;
      margin: 5px;
      cursor: pointer;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  &:hover .overlay {
    opacity: 1;
  }

  .has-vote {
    position: absolute;
    top: 5px;
    right: 5px;
    color: $demon;
  }

  .marked {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3em;
    color: $demon;
    opacity: 0;
    transition: opacity 200ms;
  }

  &.marked .marked {
    opacity: 1;
  }

  .name {
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
    margin-top: 5px;
    cursor: pointer;
    white-space: nowrap;

    svg {
      margin-left: 5px;
    }

    .pronouns {
      font-size: 80%;
      opacity: 0.7;
    }
  }

  .menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    border-radius: 5px;
    padding: 5px 0;
    z-index: 100;
    min-width: 150px;

    li {
      padding: 8px 15px;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.disabled {
        opacity: 0.5;
        cursor: default;
      }

      svg {
        margin-right: 8px;
        width: 1em;
      }
    }
  }
}

.reminder {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  margin-left: -25%;
  cursor: pointer;

  .icon {
    width: 100%;
    padding-bottom: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .text {
    font-size: 70%;
    text-align: center;
    margin-top: 3px;
  }

  &.add .icon {
    background-image: url('@/assets/reminder.png');
  }
}

// Transitions
.fold-enter-active,
.fold-leave-active {
  transition: all 200ms;
}

.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  transform: translateX(-50%) scaleY(0);
}
</style>
