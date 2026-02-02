<template>
  <div class="list">
    <div v-for="o in offers" :key="o.id" class="offer">
      <div class="head">
        <div class="actor">{{ o.actor }}</div>
        <div class="type">{{ o.type }}</div>
      </div>

      <div class="meta">
        <div class="row"><b>Accessibilité:</b> <span :style="{ whiteSpace: 'pre-line' }">{{ o.accessibility }}</span></div>
        <div class="row"><b>Public:</b> <span :style="{ whiteSpace: 'pre-line' }">{{ o.publicTarget }}</span></div>
        <div class="row"><b>Tarifs:</b> <span :style="{ whiteSpace: 'pre-line' }">{{ o.price }}</span></div>
        <div class="row"><b>Intensité:</b> {{ o.intensity }}</div>

        <div v-if="o.links?.length" class="links">
          <a v-for="l in o.links" :key="l.url" :href="l.url" target="_blank" rel="noreferrer">
            {{ l.label }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Offer } from "../../data/offers";

defineProps<{ offers: Offer[] }>();
</script>

<style scoped>
.list {
  margin-top: 26px;
  display: grid;
  gap: 16px;
}

.offer {
  border-radius: 20px;
  padding: 18px 18px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
}

.head {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}
.actor {
  font-weight: 1000;
  font-size: 22px;
}
.type {
  font-weight: 900;
  font-size: 18px;
  opacity: 0.92;
}

.meta {
  display: grid;
  gap: 8px;
  font-size: 16px;
  opacity: 0.95;
  line-height: 1.35;
}
.row b {
  opacity: 0.95;
}

.links {
  margin-top: 10px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.links a {
  font-weight: 900;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.10);
}
</style>
