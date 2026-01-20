<template>
  <Modal
    :show="grimoire.modals.nightOrder"
    title="Night Order"
    size="medium"
    modal-name="nightOrder"
  >
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'firstNight' }"
        @click="activeTab = 'firstNight'"
      >
        First Night
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'otherNight' }"
        @click="activeTab = 'otherNight'"
      >
        Other Nights
      </button>
    </div>

    <div class="night-order">
      <div
        v-for="(role, index) in orderedRoles"
        :key="role.id"
        class="role-item"
        :class="role.team"
      >
        <span class="order">{{ index + 1 }}</span>
        <Token :role="role" size="small" />
        <div class="info">
          <span class="name">{{ role.name }}</span>
          <span class="action">{{ getNightAction(role) }}</span>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGrimoireStore } from '@/stores'
import Modal from './Modal.vue'
import Token from '@/components/Token.vue'
import type { Role } from '@/types'

const grimoire = useGrimoireStore()
const activeTab = ref<'firstNight' | 'otherNight'>('firstNight')

const orderedRoles = computed(() => {
  const roles = grimoire.roles.filter((r: any) => {
    if (activeTab.value === 'firstNight') {
      return r.firstNight !== undefined && r.firstNight > 0
    }
    return r.otherNight !== undefined && r.otherNight > 0
  })

  return roles.sort((a: any, b: any) => {
    const orderA = activeTab.value === 'firstNight' ? a.firstNight! : a.otherNight!
    const orderB = activeTab.value === 'firstNight' ? b.firstNight! : b.otherNight!
    return orderA - orderB
  })
})

function getNightAction(role: Role) {
  if (activeTab.value === 'firstNight') {
    return role.firstNightReminder || ''
  }
  return role.otherNightReminder || ''
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  .tab {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: inherit;
    cursor: pointer;
    transition: all 200ms;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    &.active {
      background: rgba($townsfolk, 0.3);
    }
  }
}

.night-order {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);

  &.townsfolk { border-left: 3px solid $townsfolk; }
  &.outsider { border-left: 3px solid $outsider; }
  &.minion { border-left: 3px solid $minion; }
  &.demon { border-left: 3px solid $demon; }

  .order {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    font-weight: bold;
    flex-shrink: 0;
  }

  :deep(.token) {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;

    .name {
      font-weight: 600;
    }

    .action {
      font-size: 0.85em;
      opacity: 0.7;
    }
  }
}
</style>
