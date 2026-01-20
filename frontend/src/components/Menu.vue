<template>
  <nav id="menu" :class="{ open: grimoire.isMenuOpen }">
    <font-awesome-icon icon="cog" @click="grimoire.toggleMenu()" />

    <Transition name="slide">
      <div v-if="grimoire.isMenuOpen" class="menu-content">
        <h3>Game Controls</h3>

        <div class="menu-section">
          <button class="button" @click="addPlayer">
            <font-awesome-icon icon="user" /> Add Player
          </button>
          <button class="button" @click="grimoire.toggleModal('edition')">
            <font-awesome-icon icon="book-open" /> Choose Edition
          </button>
          <button class="button" @click="grimoire.toggleModal('roles')">
            <font-awesome-icon icon="theater-masks" /> Assign Roles
          </button>
        </div>

        <div class="menu-section">
          <button class="button" @click="grimoire.toggleNight()">
            <font-awesome-icon icon="cloud-moon" />
            {{ grimoire.isNight ? 'End Night' : 'Start Night' }}
          </button>
          <button class="button" @click="playersStore.randomize()">
            <font-awesome-icon icon="random" /> Randomize Seats
          </button>
          <button class="button" @click="playersStore.clearRoles()">
            <font-awesome-icon icon="trash-alt" /> Clear Roles
          </button>
        </div>

        <div class="menu-section">
          <h4>View</h4>
          <button class="button" @click="grimoire.toggleGrimoire()">
            <font-awesome-icon icon="eye" />
            {{ grimoire.isPublic ? 'Hide Grimoire' : 'Show Grimoire' }}
          </button>
          <button class="button" @click="grimoire.toggleModal('reference')">
            <font-awesome-icon icon="address-card" /> Reference Sheet
          </button>
          <button class="button" @click="grimoire.toggleModal('nightOrder')">
            <font-awesome-icon icon="clipboard" /> Night Order
          </button>
        </div>

        <div class="menu-section">
          <h4>Session</h4>
          <div v-if="session.isConnected" class="status connected">
            Connected to room: {{ session.roomId }}
          </div>
          <div v-else class="status disconnected">
            Not connected
          </div>
          <button v-if="!session.roomId" class="button townsfolk" @click="hostSession">
            <font-awesome-icon icon="broadcast-tower" /> Host Session
          </button>
          <button v-if="!session.roomId" class="button" @click="joinSession">
            <font-awesome-icon icon="link" /> Join Session
          </button>
          <button v-if="session.roomId" class="button demon" @click="session.disconnect()">
            <font-awesome-icon icon="times" /> Disconnect
          </button>
        </div>

        <div class="menu-section">
          <h4>Settings</h4>
          <label class="checkbox">
            <input
              type="checkbox"
              :checked="grimoire.isMuted"
              @change="grimoire.isMuted = !grimoire.isMuted"
            />
            Mute sounds
          </label>
          <label class="checkbox">
            <input
              type="checkbox"
              :checked="grimoire.isStatic"
              @change="grimoire.isStatic = !grimoire.isStatic"
            />
            Disable animations
          </label>
          <div class="zoom-control">
            <span>Zoom</span>
            <input
              type="range"
              min="-5"
              max="5"
              :value="grimoire.zoom"
              @input="grimoire.setZoom(Number(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { useGrimoireStore, usePlayersStore, useSessionStore } from '@/stores'

const grimoire = useGrimoireStore()
const playersStore = usePlayersStore()
const session = useSessionStore()

function addPlayer() {
  const name = prompt('Player name')
  if (name) {
    playersStore.add(name)
  }
  grimoire.toggleMenu(false)
}

async function hostSession() {
  try {
    await session.createRoom()
    grimoire.toggleMenu(false)
  } catch (e) {
    alert('Failed to create room')
  }
}

function joinSession() {
  const roomId = prompt('Enter room code')
  if (roomId) {
    session.joinRoom(roomId)
    grimoire.toggleMenu(false)
  }
}

// Expose methods for keyboard shortcuts
defineExpose({
  addPlayer,
  hostSession,
  joinSession
})
</script>

<style scoped lang="scss">
@import '@/styles/vars';

#menu {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;

  > svg {
    font-size: 1.5em;
    cursor: pointer;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    transition: all 200ms;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }

  &.open > svg {
    transform: rotate(90deg);
  }
}

.menu-content {
  position: absolute;
  top: 50px;
  left: 0;
  background: rgba(20, 20, 20, 0.95);
  border-radius: 10px;
  padding: 20px;
  min-width: 250px;
  max-height: 80vh;
  overflow-y: auto;

  h3 {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  h4 {
    font-size: 0.9em;
    opacity: 0.7;
    margin-bottom: 10px;
    text-align: left;
  }
}

.menu-section {
  margin-bottom: 20px;

  .button {
    display: block;
    width: 100%;
    text-align: left;
    margin: 5px 0;

    svg {
      margin-right: 10px;
      width: 1em;
    }
  }
}

.status {
  padding: 8px 12px;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 0.9em;

  &.connected {
    background: rgba($townsfolk, 0.2);
    color: $townsfolk;
  }

  &.disconnected {
    background: rgba($demon, 0.2);
    color: $demon;
  }
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
  }
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;

  input {
    flex: 1;
  }
}

// Transitions
.slide-enter-active,
.slide-leave-active {
  transition: all 200ms;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
