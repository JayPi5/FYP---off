<template>
  <div class="qrBlock">
    <img v-if="qrDataUrl" :src="qrDataUrl" class="qrImg" alt="QR code" />
    <div v-else class="qrLoading">Generating QR…</div>
    <div v-if="label" class="qrLabel">{{ label }}</div>
    <div v-if="showDestination && destinationUrl" class="qrDest">{{ destinationUrl }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import QRCode from "qrcode";
import type { AgentPersona } from "@/features/discussion/flow/discussionFlowModel";
import { API_BASE } from "@/shared/config/apiBase";
import { resolveQrTarget } from "@/shared/config/qrDestinations";

const props = withDefaults(
  defineProps<{
    agent?: AgentPersona | null;
    offerFilter?: string | null;
    totemId?: string;
    showDestination?: boolean;
  }>(),
  {
    agent: null,
    offerFilter: null,
    totemId: undefined,
    showDestination: false,
  }
);

const qrDataUrl = ref("");
const label = ref("");
const destinationUrl = ref("");

const TOTEM_ID =
  props.totemId ??
  (import.meta.env.VITE_TOTEM_ID as string | undefined) ??
  "TOTEM_001";

async function renderQr() {
  const target = resolveQrTarget({
    apiBase: API_BASE,
    totemId: TOTEM_ID,
    agent: props.agent,
    offerFilter: props.offerFilter,
  });
  label.value = target.label;
  destinationUrl.value = target.destinationUrl;
  qrDataUrl.value = await QRCode.toDataURL(target.trackingUrl, {
    margin: 2,
    scale: 8,
  });
}

watch(
  () => [props.agent, props.offerFilter, props.totemId] as const,
  () => {
    void renderQr();
  },
  { immediate: true }
);
</script>

<style scoped>
.qrBlock {
  display: grid;
  place-items: center;
  gap: 8px;
}

.qrImg,
.qrLoading {
  width: 320px;
  height: 320px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.qrImg {
  padding: 10px;
}

.qrLoading {
  display: grid;
  place-items: center;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.7);
}

.qrLabel {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 800;
  text-align: center;
}

.qrDest {
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  text-align: center;
  max-width: 320px;
  overflow-wrap: anywhere;
}
</style>
