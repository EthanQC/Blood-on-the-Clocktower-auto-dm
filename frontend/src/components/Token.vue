<template>
  <div class="token" :class="[role.id]" @click="emit('click')">
    <span
      v-if="role.id"
      class="icon"
      :style="iconStyle"
    />
    <span v-if="role.firstNight || role.firstNightReminder" class="leaf-left" />
    <span v-if="role.otherNight || role.otherNightReminder" class="leaf-right" />
    <span v-if="reminderLeaves" :class="['leaf-top' + reminderLeaves]" />
    <span v-if="role.setup" class="leaf-orange" />
    
    <svg viewBox="0 0 150 150" class="name">
      <path
        d="M 13 75 C 13 160, 138 160, 138 75"
        id="curve"
        fill="transparent"
      />
      <text
        width="150"
        x="66.6%"
        text-anchor="middle"
        class="label"
        :font-size="fontSize"
      >
        <textPath href="#curve">{{ role.name }}</textPath>
      </text>
    </svg>

    <div class="edition" :class="[`edition-${role.edition}`, role.team]" />
    <div v-if="role.ability" class="ability">{{ role.ability }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGrimoireStore } from '@/stores'
import type { Role } from '@/types'

const props = withDefaults(defineProps<{
  role?: Role
}>(), {
  role: () => ({ id: '', name: '', team: 'townsfolk' })
})

const emit = defineEmits<{
  click: []
}>()

const grimoire = useGrimoireStore()

const reminderLeaves = computed(() => {
  const count = (props.role.reminders?.length || 0) + (props.role.remindersGlobal?.length || 0)
  return Math.min(count, 5)
})

const fontSize = computed(() => {
  return props.role.name && props.role.name.length > 10 ? '90%' : '110%'
})

const iconStyle = computed(() => {
  const iconPath = props.role.imageAlt || props.role.id
  return {
    backgroundImage: `url(/src/assets/icons/${iconPath}.png)`
  }
})
</script>

<style scoped lang="scss">
.token {
  border-radius: 50%;
  width: 100%;
  background: url('@/assets/token.png') center center;
  background-size: 100%;
  text-align: center;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  transition: border-color 250ms;

  &:hover .name .label {
    stroke: black;
    fill: white;
  }

  .icon,
  &::before {
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center 30%;
    position: absolute;
    width: 100%;
    height: 100%;
    margin-top: 3%;
  }

  span {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 100%;
    pointer-events: none;

    &.leaf-left {
      background-image: url('@/assets/leaf-left.png');
    }

    &.leaf-orange {
      background-image: url('@/assets/leaf-orange.png');
    }

    &.leaf-right {
      background-image: url('@/assets/leaf-right.png');
    }

    &.leaf-top1 {
      background-image: url('@/assets/leaf-top1.png');
    }

    &.leaf-top2 {
      background-image: url('@/assets/leaf-top2.png');
    }

    &.leaf-top3 {
      background-image: url('@/assets/leaf-top3.png');
    }

    &.leaf-top4 {
      background-image: url('@/assets/leaf-top4.png');
    }

    &.leaf-top5 {
      background-image: url('@/assets/leaf-top5.png');
    }
  }

  .name {
    width: 100%;
    height: 100%;
    font-size: 24px;

    .label {
      fill: black;
      stroke: white;
      stroke-width: 2px;
      paint-order: stroke;
      font-family: 'Papyrus', serif;
      font-weight: bold;
      text-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
      letter-spacing: 1px;
    }
  }

  .edition {
    position: absolute;
    right: 0;
    bottom: 5px;
    width: 30px;
    height: 30px;
    background-size: 100%;
    display: none;
  }

  .ability {
    display: none;
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    padding: 10px;
    border-radius: 5px;
    font-size: 80%;
    max-width: 200px;
    text-align: center;
    z-index: 100;
  }

  &:hover .ability {
    display: block;
  }
}
</style>
