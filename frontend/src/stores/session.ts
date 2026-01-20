import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, ws, type ConnectionState } from '@/api'
import { usePlayersStore } from './players'

interface VoteHistory {
  odeath: number
  nominated: number
  nominator: number
  votes: boolean[]
  lockedVote: number
  isExile: boolean
  timestamp: Date
}

export const useSessionStore = defineStore('session', () => {
  // Auth state
  const isAuthenticated = ref(!!api.getToken())
  const userId = ref<string | null>(localStorage.getItem('user_id'))

  // Session state
  const sessionId = ref('')
  const playerId = ref(localStorage.getItem('playerId') || '')
  const isSpectator = ref(true)
  const playerCount = ref(0)
  const ping = ref(0)
  const isReconnecting = ref(false)

  // Game state
  const roomId = ref<string | null>(null)
  const nomination = ref<[number, number] | null>(null)
  const votes = ref<boolean[]>([])
  const lockedVote = ref(0)
  const votingSpeed = ref(1000)
  const isVoteInProgress = ref(false)
  const isVoteHistoryAllowed = ref(true)
  const voteHistory = ref<VoteHistory[]>([])
  const markedPlayer = ref(-1)
  const isRolesDistributed = ref(false)

  // Connection state
  const connectionState = computed(() => ws.state.value)
  const isConnected = computed(() => ws.state.value === 'connected')

  // Getters
  const votesMajority = computed(() => {
    const playersStore = usePlayersStore()
    const isExile = playersStore.players[nomination.value?.[1] || 0]?.role?.team === 'traveler'
    return Math.ceil(
      playersStore.players.filter(p => !p.isDead || isExile).length / 2
    )
  })

  // Actions
  async function login(email: string, password: string) {
    try {
      const res = await api.login(email, password)
      isAuthenticated.value = true
      userId.value = res.user_id
      localStorage.setItem('user_id', res.user_id)
      return res
    } catch (e) {
      throw e
    }
  }

  async function register(email: string, password: string) {
    try {
      const res = await api.register(email, password)
      isAuthenticated.value = true
      userId.value = res.user_id
      localStorage.setItem('user_id', res.user_id)
      return res
    } catch (e) {
      throw e
    }
  }

  function logout() {
    api.logout()
    isAuthenticated.value = false
    userId.value = null
    localStorage.removeItem('user_id')
    disconnect()
  }

  async function createRoom() {
    const res = await api.createRoom()
    roomId.value = res.room_id
    isSpectator.value = false
    return res.room_id
  }

  async function joinRoom(id: string) {
    await api.joinRoom(id)
    roomId.value = id
    isSpectator.value = true
    connect()
  }

  function connect() {
    if (!roomId.value) return
    if (!playerId.value) {
      playerId.value = Math.random().toString(36).substring(2)
      localStorage.setItem('playerId', playerId.value)
    }
    ws.connect(roomId.value)
  }

  function disconnect() {
    ws.disconnect()
    sessionId.value = ''
    roomId.value = null
    playerCount.value = 0
  }

  function setNomination(newNomination: [number, number] | null) {
    nomination.value = newNomination
  }

  function vote(index: number, value: boolean) {
    if (index >= 0 && index < votes.value.length) {
      votes.value[index] = value
    }
  }

  function clearVotes() {
    votes.value = []
  }

  function lockVote(index: number) {
    lockedVote.value = index
  }

  function setMarkedPlayer(index: number) {
    markedPlayer.value = index
  }

  function setVotingSpeed(speed: number) {
    votingSpeed.value = speed
  }

  function setVoteHistoryAllowed(allowed: boolean) {
    isVoteHistoryAllowed.value = allowed
  }

  function addHistory(currentPlayers: unknown[]) {
    if (!nomination.value) return
    voteHistory.value.push({
      odeath: 0,
      nominated: nomination.value[1],
      nominator: nomination.value[0],
      votes: [...votes.value],
      lockedVote: lockedVote.value,
      isExile: false,
      timestamp: new Date()
    })
  }

  function clearVoteHistory() {
    voteHistory.value = []
  }

  function setPlayerId(id: string) {
    playerId.value = id
    localStorage.setItem('playerId', id)
  }

  function claimSeat(index: number) {
    // Send claim seat command via WebSocket
    ws.sendCommand('claim_seat', { seat_index: index })
  }

  return {
    // Auth
    isAuthenticated,
    userId,
    // Session
    sessionId,
    playerId,
    isSpectator,
    playerCount,
    ping,
    isReconnecting,
    // Game
    roomId,
    nomination,
    votes,
    lockedVote,
    votingSpeed,
    isVoteInProgress,
    isVoteHistoryAllowed,
    voteHistory,
    markedPlayer,
    isRolesDistributed,
    // Connection
    connectionState,
    isConnected,
    // Getters
    votesMajority,
    // Actions
    login,
    register,
    logout,
    createRoom,
    joinRoom,
    connect,
    disconnect,
    setNomination,
    vote,
    clearVotes,
    lockVote,
    setMarkedPlayer,
    setVotingSpeed,
    setVoteHistoryAllowed,
    addHistory,
    clearVoteHistory,
    setPlayerId,
    claimSeat
  }
})
