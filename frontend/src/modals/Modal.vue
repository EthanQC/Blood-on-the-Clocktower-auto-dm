<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="modal-container" :class="size">
          <div class="modal-header">
            <h2><slot name="title">{{ title }}</slot></h2>
            <font-awesome-icon icon="times" class="close" @click="close" />
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useGrimoireStore } from '@/stores'

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  size?: 'small' | 'medium' | 'large'
  modalName?: string
}>(), {
  title: '',
  size: 'medium'
})

const grimoire = useGrimoireStore()

function close() {
  if (props.modalName) {
    grimoire.toggleModal()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  border-radius: 15px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);

  &.small {
    width: 400px;
    max-width: 90vw;
  }

  &.medium {
    width: 600px;
    max-width: 90vw;
  }

  &.large {
    width: 900px;
    max-width: 95vw;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    margin: 0;
    text-align: left;
  }

  .close {
    font-size: 1.5em;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 200ms;

    &:hover {
      opacity: 1;
    }
  }
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// Transitions
.modal-enter-active,
.modal-leave-active {
  transition: all 250ms;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.9);
  }
}
</style>
