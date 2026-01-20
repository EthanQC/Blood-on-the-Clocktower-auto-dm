import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, Role, Reminder } from '@/types'
import { useGrimoireStore } from './grimoire'

const emptyRole: Role = {
  id: '',
  name: '',
  team: 'townsfolk'
}

export const usePlayersStore = defineStore('players', () => {
  // State
  const players = ref<Player[]>([])
  const bluffs = ref<Role[]>([emptyRole, emptyRole, emptyRole])
  const fabled = ref<Role[]>([])

  // Getters
  const nonTravelers = computed(() =>
    players.value.filter(p => p.role.team !== 'traveler')
  )

  const aliveNonTravelers = computed(() =>
    nonTravelers.value.filter(p => !p.isDead)
  )

  const nightOrder = computed(() => {
    const grimoire = useGrimoireStore()
    const result = new Map<Player | Role, { first: number; other: number }>()

    // Calculate night order for players
    players.value.forEach(player => {
      result.set(player, {
        first: player.role.firstNight || 0,
        other: player.role.otherNight || 0
      })
    })

    // Include fabled
    fabled.value.forEach(f => {
      result.set(f, {
        first: f.firstNight || 0,
        other: f.otherNight || 0
      })
    })

    return result
  })

  // Actions
  function add(name: string) {
    const player: Player = {
      name,
      id: '',
      isDead: false,
      isVoteless: false,
      pronouns: '',
      role: { ...emptyRole },
      reminders: [],
      isMarked: false
    }
    players.value.push(player)
  }

  function remove(index: number) {
    players.value.splice(index, 1)
  }

  function update(
    player: Player,
    property: keyof Player,
    value: unknown
  ) {
    const index = players.value.indexOf(player)
    if (index !== -1) {
      (players.value[index] as Record<string, unknown>)[property] = value
    }
  }

  function swap(indices: [number, number]) {
    const [from, to] = indices
    const temp = players.value[from]
    players.value[from] = players.value[to]
    players.value[to] = temp
  }

  function move(indices: [number, number]) {
    const [from, to] = indices
    const player = players.value.splice(from, 1)[0]
    players.value.splice(to, 0, player)
  }

  function setBluff(index: number, role: Role) {
    if (index >= 0 && index < bluffs.value.length) {
      bluffs.value[index] = role
    }
  }

  function setFabled(options: { fabled?: Role[]; index?: number }) {
    if (options.fabled !== undefined) {
      fabled.value = options.fabled
    } else if (options.index !== undefined) {
      fabled.value.splice(options.index, 1)
    }
  }

  function addFabled(role: Role) {
    fabled.value.push(role)
  }

  function removeFabled(roleId: string) {
    const index = fabled.value.findIndex(r => r.id === roleId)
    if (index !== -1) {
      fabled.value.splice(index, 1)
    }
  }

  function updatePlayer(playerId: string, updates: Partial<Player>) {
    const player = players.value.find(p => p.id === playerId)
    if (player) {
      Object.assign(player, updates)
    }
  }

  function addPlayer(data: Partial<Player>) {
    const player: Player = {
      name: data.name || '',
      id: data.id || crypto.randomUUID(),
      isDead: data.isDead || false,
      isVoteless: data.isVoteless || false,
      pronouns: data.pronouns || '',
      role: data.role || { ...emptyRole },
      reminders: data.reminders || [],
      isMarked: data.isMarked || false
    }
    players.value.push(player)
  }

  function addReminder(playerId: string, reminder: Reminder) {
    const player = players.value.find(p => p.id === playerId)
    if (player) {
      player.reminders.push(reminder)
    }
  }

  function setPlayers(newPlayers: Player[]) {
    players.value = newPlayers
  }

  function clear() {
    players.value = []
    bluffs.value = [emptyRole, emptyRole, emptyRole]
    fabled.value = []
  }

  function randomize() {
    // Fisher-Yates shuffle
    for (let i = players.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[players.value[i], players.value[j]] = [players.value[j], players.value[i]]
    }
  }

  function clearRoles() {
    players.value.forEach(p => {
      p.role = { ...emptyRole }
      p.reminders = []
    })
    bluffs.value = [emptyRole, emptyRole, emptyRole]
  }

  return {
    // State
    players,
    bluffs,
    fabled,
    // Getters
    nonTravelers,
    aliveNonTravelers,
    nightOrder,
    // Actions
    add,
    remove,
    update,
    swap,
    move,
    setBluff,
    setFabled,
    addFabled,
    removeFabled,
    updatePlayer,
    addPlayer,
    addReminder,
    setPlayers,
    clear,
    randomize,
    clearRoles
  }
})
