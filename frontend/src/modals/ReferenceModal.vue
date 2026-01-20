<template>
  <Modal
    :show="grimoire.modals.reference"
    title="Character Reference"
    size="large"
    modal-name="reference"
  >
    <div class="reference">
      <div v-for="team in teams" :key="team.id" class="team-section">
        <h3 :class="team.id">{{ team.name }}</h3>
        <div class="roles">
          <div v-for="role in getRolesByTeam(team.id)" :key="role.id" class="role">
            <Token :role="role" />
            <div class="info">
              <h4>{{ role.name }}</h4>
              <p v-if="role.ability" class="ability">{{ role.ability }}</p>
              <div v-if="role.reminders?.length" class="reminders">
                <span v-for="reminder in role.reminders" :key="reminder" class="reminder">
                  {{ reminder }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGrimoireStore } from '@/stores'
import Modal from './Modal.vue'
import Token from '@/components/Token.vue'

const grimoire = useGrimoireStore()

const teams = [
  { id: 'townsfolk', name: 'Townsfolk' },
  { id: 'outsider', name: 'Outsiders' },
  { id: 'minion', name: 'Minions' },
  { id: 'demon', name: 'Demons' },
  { id: 'traveler', name: 'Travelers' }
]

function getRolesByTeam(team: string) {
  return grimoire.roles.filter((r: any) => r.team === team)
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.reference {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.team-section {
  h3 {
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid;
    font-size: 1.3em;

    &.townsfolk { border-color: $townsfolk; color: $townsfolk; }
    &.outsider { border-color: $outsider; color: $outsider; }
    &.minion { border-color: $minion; color: $minion; }
    &.demon { border-color: $demon; color: $demon; }
    &.traveler { border-color: $traveler; color: $traveler; }
  }
}

.roles {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.role {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);

  :deep(.token) {
    width: 70px;
    height: 70px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    h4 {
      margin: 0 0 5px;
      font-size: 1.1em;
    }

    .ability {
      margin: 0 0 8px;
      opacity: 0.8;
      font-size: 0.95em;
      line-height: 1.4;
    }

    .reminders {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;

      .reminder {
        font-size: 0.8em;
        padding: 3px 8px;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
