<template>
  <Modal
    :show="grimoire.modals.edition"
    title="Choose Edition"
    size="large"
    modal-name="edition"
  >
    <div class="editions">
      <div
        v-for="ed in editions"
        :key="ed.id"
        class="edition"
        :class="{ selected: grimoire.edition.id === ed.id }"
        @click="selectEdition(ed)"
      >
        <div
          class="image"
          :style="{ backgroundImage: `url(/src/assets/editions/${ed.id}.png)` }"
        />
        <h3>{{ ed.name }}</h3>
      </div>
    </div>

    <div class="custom-section">
      <h3>Custom Script</h3>
      <p>Load a custom script from a JSON file or URL</p>
      <div class="actions">
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none"
          @change="loadFile"
        />
        <button class="button" @click="fileInput?.click()">
          <font-awesome-icon icon="file-upload" /> Load from File
        </button>
        <button class="button" @click="loadFromUrl">
          <font-awesome-icon icon="link" /> Load from URL
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGrimoireStore } from '@/stores'
import Modal from './Modal.vue'
import editionsJSON from '@/editions.json'
import type { Edition } from '@/types'

const editions = editionsJSON as Edition[]
const grimoire = useGrimoireStore()

const fileInput = ref<HTMLInputElement>()

function selectEdition(edition: Edition) {
  grimoire.setEdition(edition)
}

function loadFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      processCustomScript(data)
    } catch (err) {
      alert('Invalid JSON file')
    }
  }
  reader.readAsText(file)
}

async function loadFromUrl() {
  const url = prompt('Enter script URL')
  if (!url) return

  try {
    const response = await fetch(url)
    const data = await response.json()
    processCustomScript(data)
  } catch (err) {
    alert('Failed to load script from URL')
  }
}

function processCustomScript(data: unknown[]) {
  // Extract edition meta if present
  const meta = data.find((r: any) => r.id === '_meta') as any
  const edition: Edition = {
    id: 'custom',
    name: meta?.name || 'Custom Script',
    isOfficial: false
  }

  grimoire.setEdition(edition)
  grimoire.setCustomRoles(data.filter((r: any) => r.id !== '_meta') as any[])
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

.editions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.edition {
  cursor: pointer;
  text-align: center;
  padding: 15px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 200ms;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.selected {
    background: rgba($townsfolk, 0.2);
    box-shadow: 0 0 0 2px $townsfolk;
  }

  .image {
    width: 100%;
    padding-bottom: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1em;
    margin: 0;
  }
}

.custom-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;

  h3 {
    margin-bottom: 10px;
  }

  p {
    opacity: 0.7;
    margin-bottom: 15px;
  }

  .actions {
    display: flex;
    gap: 10px;

    .button {
      svg {
        margin-right: 8px;
      }
    }
  }
}
</style>
