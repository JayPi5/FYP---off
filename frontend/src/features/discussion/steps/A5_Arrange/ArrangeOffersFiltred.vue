<template>
  <div class="dStep">
    <div class="dTop">
      <div class="dCluster">
        <div class="magpieWrap">
          <img class="magpieImg" :src="magpieSrc" alt="Magpie" />
        </div>

        <!-- ✅ Bubble: ONLY main text + list (no extra explanation inside) -->
        <div class="dBubble">
          <div class="mainText">Here is what I found! What do you think?</div>

          <div class="list">
            <div v-for="o in shown" :key="o.id" class="card">
              <div class="actor">{{ o.actor }}</div>

              <div class="meta"><b>Access:</b> {{ o.accessibility }}</div>
              <div class="meta"><b>Target:</b> {{ o.publicTarget }}</div>
              <div class="meta"><b>Price:</b> {{ o.price }}</div>

              <div class="meta" v-if="o.links?.length">
                <b>Links:</b>
                <span class="links">
                  <span v-for="(l, idx) in o.links" :key="idx" class="linkItem">
                    {{ l }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Explanation OUTSIDE bubble, like other slides -->
      <div class="midExplain">
        Help the bird discover smoking cessation offers in Neuchâtel region
      </div>
    </div>

    <div class="dActions">
      <button class="dBtn dBtn--blue" @click="emit('thanks')">Hey, thanks for the tips!</button>
      <button class="dBtn dBtn--blue" @click="emit('ai')">What about the AI coach?!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { magpieSrc } from "@/shared/state/communityUi";
import { getOffers } from "@/shared/services/api";
import { filterOffers } from "@/data/offers";
import type { Offer, OfferFilter } from "@/data/offers";

const props = defineProps<{ filterKey: string | null }>();

const emit = defineEmits<{
  (e: "thanks"): void;
  (e: "ai"): void;
}>();

const OFFER_FILTERS: readonly OfferFilter[] = [
  "all",
  "recommended",
  "peer",
  "face",
  "expert",
  "digital",
] as const;

function isOfferFilter(x: string): x is OfferFilter {
  return (OFFER_FILTERS as readonly string[]).includes(x);
}

function normalizeKey(raw: string | null): string {
  const k = (raw ?? "all").toString();

  // legacy mappings
  if (k === "pharmacie-plus") return "pharmacie";
  if (k === "stop-tabac") return "stop";
  if (k === "peer-support") return "peer";
  if (k === "face-to-face") return "face";

  return k;
}

const allOffers = ref<Offer[]>([]);

onMounted(async () => {
  try {
    allOffers.value = await getOffers();
  } catch {
    allOffers.value = [];
  }
});

const shown = computed<Offer[]>(() => {
  const list = allOffers.value;
  const key = normalizeKey(props.filterKey);

  if (list.length === 0) return [];

  if (isOfferFilter(key)) {
    return filterOffers(key, list);
  }

  if (key === "cipret") return list.filter(o => o.actor.toLowerCase().includes("cipret"));
  if (key === "pharmacie") return list.filter(o => o.actor.toLowerCase().includes("pharmacie"));
  if (key === "stop")
    return list.filter(
      o => o.actor.toLowerCase().includes("stop-tabac") || o.actor.toLowerCase().includes("stop")
    );

  return filterOffers("all", list);
});
</script>

<style scoped>
.dStep {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: var(--pad-top) var(--pad-x) var(--pad-bottom);
  gap: 18px;
  color: #fff;
}

/* Put the top cluster in a controlled place (no hacky negative margins) */
.dTop {
  display: grid;
  justify-items: center;
  align-content: start;
  padding-top: var(--cluster-top-offset);
  gap: 18px;
}

.dCluster {
  display: grid;
  grid-template-columns: var(--magpie-size) minmax(520px, var(--bubble-max-width));
  gap: var(--cluster-gap);
  align-items: center;
  width: min(100%, var(--cluster-max-width));
  justify-content: center;
}

.magpieWrap {
  width: var(--magpie-size);
  height: var(--magpie-size);
  display: grid;
  place-items: center;
}

.magpieImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.55));
}

.dBubble {
  width: 100%;
  max-width: var(--bubble-max-width);
  border-radius: var(--bubble-radius);
  padding: var(--bubble-pad);
  background: var(--bubble-bg);
  outline: var(--bubble-outline);
  box-shadow: var(--bubble-shadow);
  color: #fff;
  overflow: hidden;
}

.mainText {
  font-weight: 950;
  font-size: var(--main-text-size);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.midExplain {
  text-align: center;
  font-weight: 900;
  font-size: var(--explain-text-size);
  line-height: 1.35;
  opacity: 0.92;
  max-width: 980px;
  margin-top: 120px;
}

/* list inside bubble */
.list {
  margin-top: 14px;
  display: grid;
  gap: 12px;
  max-height: 580px;
  overflow: auto;
  padding-right: 6px;
}

.card {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 16px;
  padding: 12px 14px;
}

.actor {
  font-weight: 950;
  margin-bottom: 6px;
  font-size: 26px;
}

.meta {
  font-size: var(--meta-text-size);
  line-height: 1.35;
  opacity: 0.95;
  overflow-wrap: anywhere;
}

/* buttons */
.dActions {
  display: grid;
  gap: var(--btn-gap);
  margin-bottom: var(--actions-bottom-space);
  justify-items: center;
}

.dBtn {
  width: min(100%, var(--btn-max-width));
  border: none;
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-y) var(--btn-pad-x);
  font-size: var(--btn-font);
  font-weight: 950;
  cursor: pointer;
  color: #fff;
}

.dBtn--blue {
  background: rgba(60, 120, 220, 0.72);
}
</style>

