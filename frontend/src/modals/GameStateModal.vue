<template>
  <Modal
    :show="grimoire.modals.gameState"
    title="Game State"
    size="medium"
    modal-name="gameState"
  >
    <div class="game-state">
      <div class="section">
        <h3>Export Game State</h3>
        <p>Download the current game state as a JSON file</p>
        <button class="button" @click="exportState">
          <font-awesome-icon icon="download" /> Export
        </button>
      </div>

      <div class="section">
        <h3>Import Game State</h3>
        <p>Load a previously saved game state</p>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none"
          @change="importState"
        />
        <button class="button" @click="fileInput?.click()">
          <font-awesome-icon icon="upload" /> Import
        </button>
      </div>

      <div class="section">
        <h3>Current State</h3>
        <div class="state-info">
          <div class="info-row">
            <span>Edition:</span>
            <strong>{{ grimoire.edition.name || 'None' }}</strong>
          </div>
          <div class="info-row">
            <span>Players:</span>
            <strong>{{ players.players.length }}</strong>
          </div>
          <div class="info-row">
            <span>Alive:</span>
            <strong>{{ aliveCount }}</strong>
          </div>
          <div class="info-row">
            <span>Dead:</span>
            <strong>{{ deadCount }}</strong>
          </div>
          <div class="info-row">
            <span>Night Mode:</span>
            <strong>{{ grimoire.isNight ? 'Yes' : 'No' }}</strong>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGrimoireStore, usePlayersStore } from '@/stores'
import Modal from './Modal.vue'

const grimoire = useGrimoireStore()
const players = usePlayersStore()

const fileInput = ref<HTMLInputElement>()

const aliveCount = computed(() => players.players.filter((p) => !p.isDead).length)
const deadCount = computed(() => players.players.filter((p) => p.isDead).length)

function exportState() {
  const state = {
    edition: grimoire.edition,
    players: players.players.map((p) => ({
      name: p.name,
      role: p.role?.id,
      isDead: p.isDead,
      isVoteless: p.isVoteless,
      reminders: p.reminders
    })),
    bluffs: players.bluffs.map((r) => r?.id),
    fabled: players.fabled.map((r) => r.id),
    isNight: grimoire.isNight
  }

  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `botc-game-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importState(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const state = JSON.parse(e.target?.result as string)

      if (state.edition) {
        grimoire.setEdition(state.edition)
      }

      if (state.players) {
        players.$reset()
        state.players.forEach((p: any) => {
          const role = grimoire.roles.find((r: any) => r.id === p.role)
          players.addPlayer({
            name: p.name,
            role,
            isDead: p.isDead,
            isVoteless: p.isVoteless || false,
            reminders: p.reminders || []
          })
        })
      }

      if (state.bluffs) {
        state.bluffs.forEach((id: string, i: number) => {
          const role = grimoire.roles.find((r: any) => r.id === id)
          if (role) players.setBluff(i, role)
        })
      }

      if (state.fabled) {
        state.fabled.forEach((id: string) => {
          const role = grimoire.roles.find((r: any) => r.id === id)
          if (role) players.addFabled(role)
        })
      }

      if (state.isNight !== undefined) {
        grimoire.toggleNight(state.isNight)
      }

      alert('Game state imported successfully!')
    } catch (err) {
      alert('Failed to import game state')
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.game-state {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.section {
  padding: 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0 0 10px;
  }

  p {
    margin: 0 0 15px;
    opacity: 0.7;
    font-size: 0.95em;
  }

  .button {
    svg {
      margin-right: 8px;
    }
  }
}

.state-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);

  span {
    opacity: 0.7;
  }
}
</style>
