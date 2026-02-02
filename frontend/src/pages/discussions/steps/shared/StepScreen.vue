<template>
  <div class="screen">
    <div class="left">
      <img v-if="magpieSrc" class="magpie" :src="magpieSrc" alt="Mascot" />
    </div>

    <div class="right">
      <div class="card">
        <div v-if="title" class="title">{{ title }}</div>

        <div class="main" :style="{ whiteSpace: 'pre-line' }">
          {{ mainText }}
        </div>

        <div v-if="explanation" class="explain" :style="{ whiteSpace: 'pre-line' }">
          {{ explanation }}
        </div>

        <slot name="extra" />

        <div v-if="actions?.length" class="actions">
          <BigButton
            v-for="a in actions"
            :key="a.id"
            :tone="a.tone ?? 'secondary'"
            @click="$emit('action', a.id)"
          >
            {{ a.label }}
          </BigButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BigButton from "../../../../components/discussion/BigButton.vue";

export type Action = {
  id: string;
  label: string;
  tone?: "primary" | "secondary" | "ghost";
};

defineProps<{
  title?: string;
  magpieSrc?: string;
  mainText: string;
  explanation?: string;

  // ✅ accept readonly arrays too (fixes the readonly error)
  actions?: readonly Action[];
}>();

defineEmits<{
  (e: "action", id: string): void;
}>();
</script>


<style scoped>
.screen {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 420px 1fr;
  padding: 64px;
  gap: 44px;
}

.left {
  display: grid;
  place-items: center;
}

.magpie {
  width: 360px;
  height: 360px;
  object-fit: contain;
  filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.55));
}

.right {
  display: grid;
  align-items: center;
}

.card {
  border-radius: 28px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
}

.title {
  font-weight: 1000;
  font-size: 30px;
  letter-spacing: 0.5px;
  opacity: 0.95;
  margin-bottom: 18px;
}

.main {
  font-weight: 950;
  font-size: 44px;
  line-height: 1.15;
}

.explain {
  margin-top: 22px;
  font-weight: 800;
  font-size: 24px;
  opacity: 0.92;
  line-height: 1.35;
}

.actions {
  margin-top: 34px;
  display: grid;
  gap: 16px;
}
</style>
