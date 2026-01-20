<template>
  <section class="room">
    <div class="room-head">
      <h2>加入钟楼</h2>
      <span class="pill muted">实时房间</span>
    </div>
    <label class="field">
      昵称
      <input type="text" placeholder="输入你的昵称" />
    </label>
    <label class="field">
      房间号
      <input type="text" placeholder="HX7M" />
    </label>
    <div class="actions">
      <button class="cta" @click="emit('enter')">进入房间</button>
      <button class="ghost" @click="emit('host')">创建房间</button>
    </div>
    <p class="hint">输入相同房间号即可进入同一桌。房主决定人数与剧本配置。</p>
  </section>
</template>

<script setup>
const emit = defineEmits(["enter", "host"]);
</script>

<style scoped>
.room {
  display: grid;
  gap: 14px;
}

.room-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field {
  display: grid;
  gap: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.field input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text-cream);
}

.actions {
  display: flex;
  gap: 10px;
}

.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-cream);
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
