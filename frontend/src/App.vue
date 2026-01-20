<template>
  <div
    id="app"
    ref="appRef"
    tabindex="-1"
    :class="{
      night: grimoire.isNight,
      static: grimoire.isStatic
    }"
    :style="{
      backgroundImage: grimoire.background ? `url('${grimoire.background}')` : ''
    }"
    @keyup="handleKeyup"
  >
    <video
      v-if="grimoire.background?.match(/\.(mp4|webm)$/i)"
      id="background"
      :src="grimoire.background"
      autoplay
      loop
    />
    <div class="backdrop" />

    <Transition name="blur">
      <Intro v-if="!players.length" />
      <TownInfo v-else-if="!session.nomination" />
      <Vote v-else />
    </Transition>

    <TownSquare />
    <Menu ref="menuRef" />

    <!-- Modals -->
    <EditionModal />
    <FabledModal />
    <RolesModal />
    <ReferenceModal />
    <NightOrderModal />
    <VoteHistoryModal />
    <GameStateModal />

    <Gradients />
    <span id="version">v1.0.0</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGrimoireStore, usePlayersStore, useSessionStore } from '@/stores'

// Components
import TownSquare from '@/components/TownSquare.vue'
import TownInfo from '@/components/TownInfo.vue'
import Menu from '@/components/Menu.vue'
import Intro from '@/components/Intro.vue'
import Vote from '@/components/Vote.vue'
import Gradients from '@/components/Gradients.vue'

// Modals
import EditionModal from '@/modals/EditionModal.vue'
import FabledModal from '@/modals/FabledModal.vue'
import RolesModal from '@/modals/RolesModal.vue'
import ReferenceModal from '@/modals/ReferenceModal.vue'
import NightOrderModal from '@/modals/NightOrderModal.vue'
import VoteHistoryModal from '@/modals/VoteHistoryModal.vue'
import GameStateModal from '@/modals/GameStateModal.vue'

// Stores
const grimoire = useGrimoireStore()
const playersStore = usePlayersStore()
const session = useSessionStore()

const { players } = storeToRefs(playersStore)

// Refs
const appRef = ref<HTMLElement>()
const menuRef = ref<InstanceType<typeof Menu>>()

// Keyboard shortcuts
function handleKeyup(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) return

  switch (event.key.toLowerCase()) {
    case 'g':
      grimoire.toggleGrimoire()
      break
    case 'a':
      menuRef.value?.addPlayer()
      break
    case 'h':
      menuRef.value?.hostSession()
      break
    case 'j':
      menuRef.value?.joinSession()
      break
    case 'r':
      grimoire.toggleModal('reference')
      break
    case 'n':
      grimoire.toggleModal('nightOrder')
      break
    case 'e':
      if (session.isSpectator) return
      grimoire.toggleModal('edition')
      break
    case 'c':
      if (session.isSpectator) return
      grimoire.toggleModal('roles')
      break
    case 'v':
      if (session.voteHistory.length || !session.isSpectator) {
        grimoire.toggleModal('voteHistory')
      }
      break
    case 's':
      if (session.isSpectator) return
      grimoire.toggleNight()
      break
    case 'escape':
      grimoire.toggleModal()
      break
  }
}

onMounted(() => {
  appRef.value?.focus()
})
</script>

<style lang="scss">
@import '@/styles/vars';

@font-face {
  font-family: 'Papyrus';
  src: url('@/assets/fonts/papyrus.woff2') format('woff2'),
       url('@/assets/fonts/papyrus.woff') format('woff'),
       url('@/assets/fonts/papyrus.ttf') format('truetype');
  font-display: swap;
}

@font-face {
  font-family: PiratesBay;
  src: url('@/assets/fonts/piratesbay.ttf');
  font-display: swap;
}

html,
body {
  font-size: 1.2em;
  line-height: 1.4;
  background: url('@/assets/background.jpg') center center;
  background-size: cover;
  color: white;
  height: 100%;
  font-family: 'Roboto Condensed', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
  position: relative;
}

a {
  color: $townsfolk;
  &:hover {
    color: $demon;
  }
}

h1, h2, h3, h4, h5 {
  margin: 0;
  text-align: center;
  font-family: PiratesBay, sans-serif;
  letter-spacing: 1px;
  font-weight: normal;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  background-position: center center;
  background-size: cover;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  outline: none;

  &.static *,
  &.static *::after,
  &.static *::before {
    transition: none !important;
    animation: none !important;
  }
}

#version {
  position: absolute;
  text-align: right;
  right: 10px;
  bottom: 10px;
  font-size: 60%;
  opacity: 0.5;
}

.blur-enter-active,
.blur-leave-active {
  transition: all 250ms;
  filter: blur(0);
}

.blur-enter-from,
.blur-leave-to {
  opacity: 0;
  filter: blur(20px);
}

// Night phase backdrop
#app > .backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(1, 22, 46, 1) 50%,
    rgba(0, 39, 70, 1) 100%
  );
  opacity: 0;
  transition: opacity 1s ease-in-out;

  &::after {
    content: ' ';
    display: block;
    width: 100%;
    padding-right: 2000px;
    height: 100%;
    background: url('@/assets/clouds.png') repeat;
    background-size: 2000px auto;
    animation: move-background 120s linear infinite;
    opacity: 0.3;
  }
}

@keyframes move-background {
  from {
    transform: translate3d(-2000px, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

#app.night > .backdrop {
  opacity: 0.5;
}

// Video background
video#background {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Button styles
.button {
  padding: 0;
  border: solid 0.125em transparent;
  border-radius: 15px;
  box-shadow:
    inset 0 1px 1px #9c9c9c,
    0 0 10px #000;
  background:
    radial-gradient(at 0 -15%, rgba(#fff, 0.07) 70%, rgba(#fff, 0) 71%) 0 0 / 80% 90% no-repeat content-box,
    linear-gradient(#4e4e4e, #040404) content-box,
    linear-gradient(#292929, #010101) border-box;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px rgba(0, 0, 0, 0.5);
  line-height: 170%;
  margin: 5px auto;
  cursor: pointer;
  transition: all 200ms;
  white-space: nowrap;

  &:hover {
    color: red;
  }

  &.disabled {
    color: gray;
    cursor: default;
    opacity: 0.75;
  }

  &::before,
  &::after {
    content: ' ';
    display: inline-block;
    width: 10px;
    height: 10px;
  }

  &.townsfolk {
    background:
      radial-gradient(at 0 -15%, rgba(255, 255, 255, 0.07) 70%, rgba(255, 255, 255, 0) 71%) 0 0/80% 90% no-repeat content-box,
      linear-gradient(#0031ad, rgba(5, 0, 0, 0.22)) content-box,
      linear-gradient(#292929, #001142) border-box;
    box-shadow: inset 0 1px 1px #002c9c, 0 0 10px #000;
    &:hover:not(.disabled) {
      color: #008cf7;
    }
  }

  &.demon {
    background:
      radial-gradient(at 0 -15%, rgba(255, 255, 255, 0.07) 70%, rgba(255, 255, 255, 0) 71%) 0 0/80% 90% no-repeat content-box,
      linear-gradient(#ad0000, rgba(5, 0, 0, 0.22)) content-box,
      linear-gradient(#292929, #420000) border-box;
    box-shadow: inset 0 1px 1px #9c0000, 0 0 10px #000;
  }
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;

  .button {
    margin: 5px 0;
    border-radius: 0;

    &:first-child {
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
    }

    &:last-child {
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
}
</style>
