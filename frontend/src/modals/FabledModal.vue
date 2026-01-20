<template>
  <Modal
    :show="grimoire.modals.fabled"
    title="Select Fabled"
    size="large"
    modal-name="fabled"
  >
    <div class="fabled-list">
      <div
        v-for="role in fabledRoles"
        :key="role.id"
        class="fabled-item"
        :class="{ selected: isSelected(role.id) }"
        @click="toggleFabled(role)"
      >
        <Token :role="role" />
        <div class="info">
          <h4>{{ role.name }}</h4>
          <p class="ability">{{ role.ability }}</p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGrimoireStore, usePlayersStore } from '@/stores'
import Modal from './Modal.vue'
import Token from '@/components/Token.vue'
import rolesJSON from '@/roles.json'
import type { Role } from '@/types'

const grimoire = useGrimoireStore()
const players = usePlayersStore()

const fabledRoles = computed(() => {
  return (rolesJSON as Role[]).filter((r) => r.team === 'fabled')
})

function isSelected(roleId: string) {
  return players.fabled.some((r) => r.id === roleId)
}

function toggleFabled(role: Role) {
  if (isSelected(role.id)) {
    players.removeFabled(role.id)
  } else {
    players.addFabled(role)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.fabled-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fabled-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 200ms;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.selected {
    background: rgba($fabled, 0.2);
    box-shadow: 0 0 0 2px $fabled;
  }

  :deep(.token) {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    h4 {
      margin: 0 0 5px;
      font-size: 1.2em;
    }

    .ability {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9em;
      line-height: 1.4;
    }
  }
}
</style>
