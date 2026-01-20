<template>
  <section class="timeline">
    <h2>流程阶段</h2>
    <div class="steps">
      <div class="step" :class="{ active: phaseIndex === 0 }">
        <span>夜晚</span>
        <small>能力按顺序发动</small>
      </div>
      <div class="step" :class="{ active: phaseIndex === 1 }">
        <span>白天</span>
        <small>自由讨论</small>
      </div>
      <div class="step" :class="{ active: phaseIndex === 2 }">
        <span>投票</span>
        <small>提名与表决</small>
      </div>
      <div class="step" :class="{ active: phaseIndex === 3 }">
        <span>处刑</span>
        <small>结算死亡</small>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  phaseIndex: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.timeline {
  display: grid;
  gap: 12px;
}

.steps {
  display: grid;
  gap: 10px;
}

.step {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 4px;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
}

.step.active {
  background: linear-gradient(120deg, rgba(200, 66, 58, 0.32), rgba(217, 164, 65, 0.18));
  border: 1px solid rgba(200, 66, 58, 0.4);
}

.step span {
  font-size: 14px;
  font-weight: 600;
}

.step small {
  color: var(--text-muted);
  font-size: 12px;
}
</style>
