<template>
  <Modal
    :show="grimoire.modals.roles"
    title="Assign Roles"
    size="large"
    modal-name="roles"
  >
    <div class="role-selection">
      <div class="teams">
        <div v-for="team in teams" :key="team.id" class="team">
          <h3 :class="team.id">{{ team.name }}</h3>
          <div class="roles-grid">
            <div
              v-for="role in getRolesByTeam(team.id)"
              :key="role.id"
              class="role"
              :class="{ selected: isSelected(role.id), assigned: isAssigned(role.id) }"
              @click="toggleRole(role)"
            >
              <Token :role="role" size="small" />
              <span class="name">{{ role.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="summary">
        <h3>Selected Roles ({{ selectedRoles.length }})</h3>
        <div class="selected-list">
          <div v-for="role in selectedRoles" :key="role.id" class="role selected">
            <Token :role="role" size="small" />
            <span class="name">{{ role.name }}</span>
            <font-awesome-icon icon="times" class="remove" @click="removeRole(role.id)" />
          </div>
        </div>

        <div class="actions">
          <button class="button" @click="randomizeRoles">
            <font-awesome-icon icon="random" /> Randomize Roles
          </button>
          <button class="button" @click="assignRoles">
            <font-awesome-icon icon="user-check" /> Assign to Players
          </button>
        </div>
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

const teams = [
  { id: 'townsfolk', name: 'Townsfolk' },
  { id: 'outsider', name: 'Outsiders' },
  { id: 'minion', name: 'Minions' },
  { id: 'demon', name: 'Demons' },
  { id: 'traveler', name: 'Travelers' }
]

const selectedRoles = ref<Role[]>([])

function getRolesByTeam(team: string) {
  return grimoire.roles.filter((r: any) => r.team === team)
}

function isSelected(roleId: string) {
  return selectedRoles.value.some((r) => r.id === roleId)
}

function isAssigned(roleId: string) {
  return players.players.some((p) => p.role?.id === roleId)
}

function toggleRole(role: Role) {
  if (isSelected(role.id)) {
    removeRole(role.id)
  } else {
    selectedRoles.value.push(role)
  }
}

function removeRole(roleId: string) {
  const index = selectedRoles.value.findIndex((r) => r.id === roleId)
  if (index !== -1) {
    selectedRoles.value.splice(index, 1)
  }
}

function randomizeRoles() {
  const shuffled = [...selectedRoles.value].sort(() => Math.random() - 0.5)
  selectedRoles.value = shuffled
}

function assignRoles() {
  const availablePlayers = players.players.filter((p) => !p.role)
  const rolesToAssign = [...selectedRoles.value]

  for (const player of availablePlayers) {
    if (rolesToAssign.length === 0) break
    const role = rolesToAssign.shift()!
    players.updatePlayer(player.id, { role })
  }

  selectedRoles.value = rolesToAssign
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.role-selection {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.teams {
  .team {
    margin-bottom: 25px;

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
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
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
    background: rgba(255, 255, 255, 0.1);
  }

  &.selected {
    background: rgba($townsfolk, 0.2);
  }

  &.assigned {
    opacity: 0.5;
    pointer-events: none;
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

  .remove {
    margin-left: auto;
    cursor: pointer;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

.summary {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;

  h3 {
    margin-bottom: 15px;
  }

  .selected-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 20px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .button {
      width: 100%;
      justify-content: center;

      svg {
        margin-right: 8px;
      }
    }
  }
}
</style>
