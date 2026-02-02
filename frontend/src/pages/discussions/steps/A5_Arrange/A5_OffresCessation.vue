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
import { computed } from "vue";
import { useRouter } from "vue-router";
import DiscussionLayout from "../../DiscussionLayout.vue";
import StepScreen from "../shared/StepScreen.vue";
import OfferList from "../../../../components/discussion/OfferList.vue";

import { OFFERS } from "../../../../data/offers";
import { offersFilter } from "../../../../state/discussion";

import { ledLabel } from "../../../../state/community";
import magpieGreen from "../../../assets/magpie_green.png";
import magpieOrange from "../../../assets/magpie_orange.png";
import magpieRed from "../../../assets/magpie_red.png";

const router = useRouter();
const offers = OFFERS;

const magpieSrc = computed(() => {
  const v = (ledLabel.value ?? "").toLowerCase();
  if (v.includes("green")) return magpieGreen;
  if (v.includes("orange") || v.includes("yellow") || v.includes("amber")) return magpieOrange;
  return magpieRed;
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
