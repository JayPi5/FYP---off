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
import { magpieSrc } from "../../../../state/communityUi";
import { getOffers } from "../../../../services/api";
import { filterOffers } from "../../../../data/offers";
import type { Offer, OfferFilter } from "../../../../data/offers";

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
  padding: 64px;
  gap: 18px;
  color: #fff;
}

/* Put the top cluster in a controlled place (no hacky negative margins) */
.dTop {
  display: grid;
  justify-items: center;
  align-content: start;
  padding-top: 280px; /* ✅ move bubble+magpie LOWER */
  gap: 18px;
}

.dCluster {
  display: grid;
  grid-template-columns: 320px minmax(520px, 760px);
  gap: 44px;
  align-items: center;
  width: 100%;
  justify-content: center;
}

.magpieWrap {
  width: 320px;
  height: 320px;
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
  max-width: 760px;
  border-radius: 28px;
  padding: 34px;
  background: rgba(255, 255, 255, 0.06);
  outline: 2px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
  color: #fff;
  overflow: hidden;             /* ✅ no weird overflow */
  
}

.mainText {
  font-weight: 950;
  font-size: 30px;
  line-height: 1.15;
  overflow-wrap: anywhere;      /* ✅ never overflow horizontally */
}

.midExplain {
  text-align: center;
  font-weight: 900;
  font-size: 35px;
  line-height: 1.35;
  opacity: 0.92;
  max-width: 980px;
  margin-top: 150px;
}

/* list inside bubble */
.list {
  margin-top: 14px;
  display: grid;
  gap: 12px;
  max-height: 580px;            /* ✅ stays inside bubble */
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
  font-size: 26px;              /* ✅ readable */
  line-height: 1.35;
  opacity: 0.95;
  overflow-wrap: anywhere;      /* ✅ no overflow */
}

/* buttons */
.dActions {
  display: grid;
  gap: 16px;
  margin-bottom: 240px;
  justify-items: center;        /* ✅ centered buttons */
}

.dBtn {
  width: min(100%, 920px);      /* ✅ centered + consistent */
  border: none;
  border-radius: 18px;
  padding: 22px 26px;
  font-size: 30px;
  font-weight: 950;
  cursor: pointer;
  color: #fff;
}

.dBtn--blue {
  background: rgba(60, 120, 220, 0.72);
}
</style>

