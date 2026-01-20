<template>
  <Modal
    :show="grimoire.modals.reminder"
    title="Add Reminder"
    size="medium"
    modal-name="reminder"
  >
    <div class="reminder-modal">
      <div v-if="targetPlayer" class="target">
        Adding reminder to: <strong>{{ targetPlayer.name }}</strong>
      </div>

      <div class="search">
        <input
          v-model="search"
          type="text"
          placeholder="Search reminders..."
          class="search-input"
        />
      </div>

      <div class="reminders-list">
        <div v-for="group in filteredReminders" :key="group.role.id" class="role-group">
          <div class="role-header">
            <Token :role="group.role" size="small" />
            <span>{{ group.role.name }}</span>
          </div>
          <div class="reminders">
            <button
              v-for="reminder in group.reminders"
              :key="reminder"
              class="reminder"
              @click="selectReminder(group.role.id, reminder)"
            >
              {{ reminder }}
            </button>
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
import Token from '@/components/Token.vue'

const grimoire = useGrimoireStore()
const players = usePlayersStore()

const search = ref('')
const targetPlayerId = ref<string>()

const targetPlayer = computed(() => {
  if (!targetPlayerId.value) return null
  return players.players.find((p) => p.id === targetPlayerId.value)
})

const filteredReminders = computed(() => {
  const groups: Array<{ role: any; reminders: string[] }> = []

  for (const role of grimoire.roles as any[]) {
    if (!role.reminders?.length) continue

    const reminders = role.reminders.filter((r: string) =>
      search.value ? r.toLowerCase().includes(search.value.toLowerCase()) : true
    )

    if (reminders.length > 0) {
      groups.push({ role, reminders })
    }
  }

  return groups
})

function selectReminder(roleId: string, reminder: string) {
  if (!targetPlayerId.value) return

  players.addReminder(targetPlayerId.value, { role: roleId, text: reminder })
  grimoire.toggleModal()
}

// Export for parent to set
defineExpose({ targetPlayerId })
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.reminder-modal {
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

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.role-group {
  .role-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-weight: 600;

    :deep(.token) {
      width: 35px;
      height: 35px;
    }
  }

  .reminders {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .reminder {
    padding: 8px 15px;
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: inherit;
    cursor: pointer;
    transition: all 200ms;
    font-size: 0.9em;

    &:hover {
      background: rgba($townsfolk, 0.3);
    }
  }
}
</style>
