import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role, Edition } from '@/types'
import rolesJSON from '@/roles.json'
import editionsJSON from '@/editions.json'
import fabledJSON from '@/fabled.json'
import jinxesJSON from '@/hatred.json'

const roles = rolesJSON as Role[]
const editions = editionsJSON as Edition[]
const fabled = fabledJSON as Role[]

// Helper to clean role IDs
const clean = (id: string) => id.toLowerCase().replace(/[^a-z0-9]/g, '')

// Build maps
const rolesById = new Map(roles.map(r => [r.id, r]))
const editionsById = new Map(editions.map(e => [e.id, e]))
const fabledById = new Map(fabled.map(f => [f.id, f]))

// Build jinxes map
const jinxes = new Map(
  (jinxesJSON as { id: string; hatred: { id: string; reason: string }[] }[]).map(
    ({ id, hatred }) => [
      clean(id),
      new Map(hatred.map(({ id, reason }) => [clean(id), reason]))
    ]
  )
)

// Get roles for an edition
const getRolesByEdition = (edition: Edition = editions[0]) => {
  return new Map(
    roles
      .filter(r => r.edition === edition.id || edition.roles?.includes(r.id))
      .sort((a, b) => b.team.localeCompare(a.team))
      .map(r => [r.id, r])
  )
}

// Get travelers not in edition
const getTravelersNotInEdition = (edition: Edition = editions[0]) => {
  return new Map(
    roles
      .filter(
        r =>
          r.team === 'traveler' &&
          r.edition !== edition.id &&
          !edition.roles?.includes(r.id)
      )
      .map(r => [r.id, r])
  )
}

export const useGrimoireStore = defineStore('grimoire', () => {
  // State
  const isNight = ref(false)
  const isNightOrder = ref(true)
  const isPublic = ref(true)
  const isMenuOpen = ref(false)
  const isStatic = ref(false)
  const isMuted = ref(false)
  const isImageOptIn = ref(false)
  const zoom = ref(0)
  const background = ref('')

  // Modals
  const modals = ref({
    edition: false,
    fabled: false,
    gameState: false,
    nightOrder: false,
    reference: false,
    reminder: false,
    role: false,
    roles: false,
    voteHistory: false
  })

  // Edition & Roles
  const edition = ref<Edition>(editionsById.get('tb')!)
  const currentRoles = ref(getRolesByEdition())
  const otherTravelers = ref(getTravelersNotInEdition())
  const currentFabled = ref(new Map(fabledById))

  // Getters
  const customRolesStripped = computed(() => {
    const result: unknown[] = []
    currentRoles.value.forEach(role => {
      if (!role.isCustom) {
        result.push({ id: role.id })
      } else {
        result.push(role)
      }
    })
    return result
  })

  // All roles as an array
  const rolesArray = computed(() => Array.from(currentRoles.value.values()))

  // Actions
  function toggleNight(value?: boolean) {
    isNight.value = value ?? !isNight.value
  }

  function toggleMenu(value?: boolean) {
    isMenuOpen.value = value ?? !isMenuOpen.value
  }

  function toggleGrimoire(value?: boolean) {
    isPublic.value = value ?? !isPublic.value
  }

  function toggleModal(name?: keyof typeof modals.value) {
    if (name) {
      modals.value[name] = !modals.value[name]
    }
    // Close all other modals
    for (const key in modals.value) {
      if (key !== name) {
        modals.value[key as keyof typeof modals.value] = false
      }
    }
  }

  function setEdition(newEdition: Edition) {
    if (editionsById.has(newEdition.id)) {
      edition.value = editionsById.get(newEdition.id)!
      currentRoles.value = getRolesByEdition(edition.value)
      otherTravelers.value = getTravelersNotInEdition(edition.value)
    } else {
      edition.value = newEdition
    }
    modals.value.edition = false
  }

  function setCustomRoles(rolesList: (Role | { id: string })[]) {
    const processed = rolesList
      .map(r => {
        if ('id' in r && !('name' in r)) {
          return rolesById.get(r.id) || r
        }
        return r
      })
      .filter((r): r is Role => 'name' in r && 'ability' in r && 'team' in r)
      .sort((a, b) => b.team.localeCompare(a.team))

    currentRoles.value = new Map(
      processed.filter(r => r.team !== 'fabled').map(r => [r.id, r])
    )

    currentFabled.value = new Map([
      ...processed.filter(r => r.team === 'fabled').map(r => [r.id, r] as [string, Role]),
      ...fabled.map(r => [r.id, r] as [string, Role])
    ])
  }

  function setZoom(value: number) {
    zoom.value = value
  }

  function setBackground(value: string) {
    background.value = value
  }

  return {
    // State
    isNight,
    isNightOrder,
    isPublic,
    isMenuOpen,
    isStatic,
    isMuted,
    isImageOptIn,
    zoom,
    background,
    modals,
    edition,
    currentRoles,
    otherTravelers,
    currentFabled,
    jinxes,
    rolesById,
    // Getters
    customRolesStripped,
    roles: rolesArray,
    // Actions
    toggleNight,
    toggleMenu,
    toggleGrimoire,
    toggleModal,
    setEdition,
    setCustomRoles,
    setZoom,
    setBackground
  }
})
