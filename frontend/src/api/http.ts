import type { AuthResponse, RoomResponse, JoinResponse } from '@/types'

const API_BASE = '/api'

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async register(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('POST', '/auth/register', {
      email,
      password
    })
    this.setToken(res.token)
    return res
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('POST', '/auth/login', {
      email,
      password
    })
    this.setToken(res.token)
    return res
  }

  logout() {
    this.clearToken()
  }

  // Room endpoints
  async createRoom(): Promise<RoomResponse> {
    return this.request<RoomResponse>('POST', '/rooms/')
  }

  async joinRoom(roomId: string): Promise<JoinResponse> {
    return this.request<JoinResponse>('POST', `/rooms/${roomId}/join`)
  }

  async fetchEvents(roomId: string, afterSeq = 0): Promise<unknown[]> {
    return this.request<unknown[]>(
      'GET',
      `/rooms/${roomId}/events?after_seq=${afterSeq}`
    )
  }

  async fetchState(roomId: string): Promise<unknown> {
    return this.request<unknown>('GET', `/rooms/${roomId}/state`)
  }
}

export const api = new ApiClient()
