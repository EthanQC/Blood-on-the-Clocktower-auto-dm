import { ref, shallowRef } from 'vue'
import type { WSMessage, WSEvent, WSCommandResult } from '@/types'
import { api } from './http'

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

class WebSocketClient {
  private socket: WebSocket | null = null
  private reconnectTimer: number | null = null
  private pingTimer: number | null = null
  private requestId = 0
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }>()

  // Reactive state
  public state = ref<ConnectionState>('disconnected')
  public lastEvent = shallowRef<WSEvent | null>(null)
  public roomId = ref<string | null>(null)
  public lastSeq = ref<number>(0)

  // Event handlers
  public onEvent: ((event: WSEvent) => void) | null = null
  public onConnect: (() => void) | null = null
  public onDisconnect: (() => void) | null = null

  connect(roomId: string) {
    const token = api.getToken()
    if (!token) {
      console.error('No auth token for WebSocket connection')
      return
    }

    this.roomId.value = roomId
    this.state.value = 'connecting'

    const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws?token=${token}`
    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = () => {
      this.state.value = 'connected'
      this.startPing()
      this.subscribe(roomId, this.lastSeq.value)
      this.onConnect?.()
    }

    this.socket.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data))
    }

    this.socket.onclose = (event) => {
      this.stopPing()
      if (event.code !== 1000) {
        // Abnormal close, attempt reconnect
        this.state.value = 'reconnecting'
        this.scheduleReconnect()
      } else {
        this.state.value = 'disconnected'
        this.onDisconnect?.()
      }
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect() {
    this.stopPing()
    this.cancelReconnect()
    if (this.socket) {
      this.socket.close(1000)
      this.socket = null
    }
    this.state.value = 'disconnected'
    this.roomId.value = null
    this.lastSeq.value = 0
  }

  private handleMessage(msg: WSMessage) {
    switch (msg.type) {
      case 'pong':
        // Ping response, connection is alive
        break

      case 'subscribed':
        console.log('Subscribed to room:', this.roomId.value)
        break

      case 'event':
        const event = msg.payload as WSEvent
        this.lastSeq.value = event.seq
        this.lastEvent.value = event
        this.onEvent?.(event)
        break

      case 'command_result':
        const result = msg.payload as WSCommandResult
        const pending = this.pendingRequests.get(msg.request_id!)
        if (pending) {
          if (result.status === 'accepted') {
            pending.resolve(result)
          } else {
            pending.reject(new Error(result.reason || 'Command rejected'))
          }
          this.pendingRequests.delete(msg.request_id!)
        }
        break

      case 'error':
        const errorPayload = msg.payload as { code: string; message: string }
        console.error('WebSocket error:', errorPayload.message)
        const errorPending = this.pendingRequests.get(msg.request_id!)
        if (errorPending) {
          errorPending.reject(new Error(errorPayload.message))
          this.pendingRequests.delete(msg.request_id!)
        }
        break
    }
  }

  private send(msg: WSMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg))
    }
  }

  private subscribe(roomId: string, lastSeq: number) {
    this.send({
      type: 'subscribe',
      request_id: this.nextRequestId(),
      payload: { room_id: roomId, last_seq: lastSeq }
    })
  }

  async sendCommand(
    type: string,
    data: unknown,
    idempotencyKey?: string
  ): Promise<WSCommandResult> {
    const requestId = this.nextRequestId()
    const commandId = crypto.randomUUID()

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve: resolve as (value: unknown) => void, reject })

      this.send({
        type: 'command',
        request_id: requestId,
        payload: {
          command_id: commandId,
          idempotency_key: idempotencyKey || commandId,
          room_id: this.roomId.value,
          type,
          last_seen_seq: this.lastSeq.value,
          data
        }
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          reject(new Error('Command timeout'))
        }
      }, 10000)
    })
  }

  private nextRequestId(): string {
    return `req_${++this.requestId}`
  }

  private startPing() {
    this.pingTimer = window.setInterval(() => {
      this.send({
        type: 'ping',
        request_id: this.nextRequestId(),
        payload: {}
      })
    }, 30000)
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect() {
    this.reconnectTimer = window.setTimeout(() => {
      if (this.roomId.value) {
        this.connect(this.roomId.value)
      }
    }, 3000)
  }

  private cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

export const ws = new WebSocketClient()
