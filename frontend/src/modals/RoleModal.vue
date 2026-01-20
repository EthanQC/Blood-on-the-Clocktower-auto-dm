<template>
  <Modal
    :show="grimoire.modals.role"
    title="Select Role"
    size="large"
    modal-name="role"
  >
    <div class="role-modal">
      <div v-if="targetPlayer" class="target">
        Selecting role for: <strong>{{ targetPlayer.name }}</strong>
      </div>

      <div class="search">
        <input
          v-model="search"
          type="text"
          placeholder="Search roles..."
          class="search-input"
        />
      </div>

      <div class="teams">
        <div v-for="team in teams" :key="team.id" class="team">
          <h3 :class="team.id">{{ team.name }}</h3>
          <div class="roles-grid">
            <div
              v-for="role in getFilteredRoles(team.id)"
              :key="role.id"
              class="role"
              @click="selectRole(role)"
            >
              <Token :role="role" size="small" />
              <span class="name">{{ role.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="button secondary" @click="clearRole">
          <font-awesome-icon icon="times" /> Clear Role
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGrimoireStore, usePlayersStore } from '@/stores'
import Modal from './Modal.vue'
import Token from '@/components/Token.vue'
import type { Role } from '@/types'

const grimoire = useGrimoireStore()
const players = usePlayersStore()

const search = ref('')
const targetPlayerId = ref<string>()

const teams = [
  { id: 'townsfolk', name: 'Townsfolk' },
  { id: 'outsider', name: 'Outsiders' },
  { id: 'minion', name: 'Minions' },
  { id: 'demon', name: 'Demons' },
  { id: 'traveler', name: 'Travelers' }
]

const targetPlayer = computed(() => {
  if (!targetPlayerId.value) return null
  return players.players.find((p) => p.id === targetPlayerId.value)
})

function getFilteredRoles(team: string) {
  return grimoire.roles.filter((r: any) => {
    if (r.team !== team) return false
    if (!search.value) return true
    return r.name.toLowerCase().includes(search.value.toLowerCase())
  })
}

function selectRole(role: Role) {
  if (!targetPlayerId.value) return

  players.updatePlayer(targetPlayerId.value, { role })
  grimoire.toggleModal()
}

function clearRole() {
  if (!targetPlayerId.value) return

  players.updatePlayer(targetPlayerId.value, { role: undefined })
  grimoire.toggleModal()
}

// Export for parent to set
defineExpose({ targetPlayerId })
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.role-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.target {
  padding: 12px 15px;
  border-radius: 8px;
  background: rgba($townsfolk, 0.2);
  text-align: center;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1em;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba($townsfolk, 0.5);
  }
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 25px;
  max-height: 400px;
  overflow-y: auto;

  .team {
    h3 {
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid;

      &.townsfolk { border-color: $townsfolk; color: $townsfolk; }
      &.outsider { border-color: $outsider; color: $outsider; }
      &.minion { border-color: $minion; color: $minion; }
      &.demon { border-color: $demon; color: $demon; }
      &.traveler { border-color: $traveler; color: $traveler; }
    }
  }
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
}

.role {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 200ms;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  :deep(.token) {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .name {
    font-size: 0.85em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.actions {
  display: flex;
  justify-content: center;

  .button {
    svg {
      margin-right: 8px;
    }
  }

  .secondary {
    background: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba($demon, 0.3);
    }
  }
}
</style>
