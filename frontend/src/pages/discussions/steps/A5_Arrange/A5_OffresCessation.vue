<template>
  <DiscussionLayout>
    <StepScreen
      title="ARRANGE (5A)"
      :magpie-src="magpieSrc"
      main-text="Here is what I found! There are many options."
      explanation="This is the full list. Want me to show only the most relevant ones?"
      :actions="actions"
      @action="onAction"
    >
      <template #extra>
        <OfferList :offers="offers" />
      </template>
    </StepScreen>
  </DiscussionLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import DiscussionLayout from "../../DiscussionLayout.vue";
import StepScreen from "../shared/StepScreen.vue";
import OfferList from "../../../../components/discussion/OfferList.vue";

import type { Offer } from "../../../../data/offers";
import { getOffers } from "../../../../services/api";
import { offersFilter } from "../../../../state/discussion";
import { magpieSrc } from "../../../../state/communityUi";

const router = useRouter();
const offers = ref<Offer[]>([]);

onMounted(async () => {
  try {
    offers.value = await getOffers();
  } catch {
    offers.value = [];
  }
});

const actions = [
  { id: "filter", label: "Show me the most relevant ones", tone: "primary" },
  { id: "ai", label: "What about the AI coach?!", tone: "secondary" },
] as const;

function onAction(id: string) {
  if (id === "ai") {
    router.push("/discussion/arrange/app-versions");
    return;
  }
  offersFilter.value = "recommended";
  router.push("/discussion/arrange/offers-filtered");
}
</script>
