<template>
  <div id="intro">
    <h1>Welcome to Blood on the Clocktower</h1>
    <p>Auto DM Edition</p>

    <div class="auth-section" v-if="!session.isAuthenticated">
      <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
      <form @submit.prevent="handleAuth">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit" class="button townsfolk">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="toggle-auth">
        {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? 'Register' : 'Login' }}
        </a>
      </p>
    </div>

    <div class="action-section" v-else>
      <p>Welcome, {{ session.userId }}</p>
      <div class="actions">
        <button class="button townsfolk" @click="createRoom">
          Host a Game
        </button>
        <button class="button" @click="showJoinModal = true">
          Join a Game
        </button>
      </div>
      <button class="button logout" @click="session.logout()">
        Logout
      </button>
    </div>

    <!-- Join Room Modal -->
    <div v-if="showJoinModal" class="modal-overlay" @click.self="showJoinModal = false">
      <div class="modal">
        <h2>Join a Game</h2>
        <form @submit.prevent="joinRoom">
          <input
            v-model="roomCode"
            type="text"
            placeholder="Room Code"
            required
          />
          <button type="submit" class="button townsfolk">Join</button>
          <button type="button" class="button" @click="showJoinModal = false">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSessionStore, usePlayersStore } from '@/stores'

const session = useSessionStore()
const playersStore = usePlayersStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const error = ref('')
const showJoinModal = ref(false)
const roomCode = ref('')

async function handleAuth() {
  error.value = ''
  try {
    if (isLogin.value) {
      await session.login(email.value, password.value)
    } else {
      await session.register(email.value, password.value)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Authentication failed'
  }
}

async function createRoom() {
  try {
    const roomId = await session.createRoom()
    // Add default player
    playersStore.add('Storyteller')
    session.connect()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create room'
  }
}

async function joinRoom() {
  try {
    await session.joinRoom(roomCode.value)
    showJoinModal.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to join room'
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/vars';

#intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;

  h1 {
    font-size: 3em;
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 30px;
    opacity: 0.8;
  }
}

.auth-section,
.action-section {
  background: rgba(0, 0, 0, 0.6);
  padding: 30px;
  border-radius: 15px;
  min-width: 300px;

  h2 {
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  input {
    padding: 12px 15px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1em;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: 2px solid $townsfolk;
    }
  }

  .error {
    color: $demon;
    margin: 0;
  }

  .toggle-auth {
    margin-top: 15px;
    font-size: 0.9em;

    a {
      color: $townsfolk;
    }
  }
}

.action-section {
  .actions {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .logout {
    font-size: 0.8em;
    opacity: 0.7;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: rgba(30, 30, 30, 0.95);
  padding: 30px;
  border-radius: 15px;
  min-width: 300px;

  h2 {
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  input {
    padding: 12px 15px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1em;
  }
}
</style>
