// 角色相关类型
export interface Role {
  id: string
  name: string
  edition?: string
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled'
  ability?: string
  image?: string
  imageAlt?: string
  firstNight?: number
  firstNightReminder?: string
  otherNight?: number
  otherNightReminder?: string
  reminders?: string[]
  remindersGlobal?: string[]
  setup?: boolean
  isCustom?: boolean
}

export interface Reminder {
  role: string
  name?: string
  text?: string
  image?: string
  imageAlt?: string
}

// 玩家相关类型
export interface Player {
  name: string
  id: string
  isDead: boolean
  isVoteless: boolean
  pronouns: string
  role: Role
  reminders: Reminder[]
  isMarked: boolean
}

// 版本相关类型
export interface Edition {
  id: string
  name: string
  author?: string
  isOfficial?: boolean
  roles?: string[]
}

// 游戏状态
export interface GameState {
  players: Player[]
  edition: Edition
  isNight: boolean
  nomination: [number, number] | null
  votes: boolean[]
  markedPlayer: number
  fabled: Role[]
}

// 后端 API 响应类型
export interface AuthResponse {
  token: string
  user_id: string
}

export interface RoomResponse {
  room_id: string
}

export interface JoinResponse {
  status: string
}

// WebSocket 消息类型
export interface WSMessage {
  type: string
  request_id?: string
  payload: unknown
}

export interface WSEvent {
  room_id: string
  seq: number
  event_type: string
  data: unknown
  server_ts: number
}

export interface WSCommandResult {
  command_id: string
  status: 'accepted' | 'rejected'
  reason?: string
  seq?: number
}

// 游戏事件类型
export type GameEventType =
  | 'game_created'
  | 'player_joined'
  | 'player_left'
  | 'roles_assigned'
  | 'phase_changed'
  | 'player_nominated'
  | 'vote_cast'
  | 'player_executed'
  | 'player_killed'
  | 'game_ended'

export interface GameEvent {
  type: GameEventType
  data: unknown
  timestamp: number
}
