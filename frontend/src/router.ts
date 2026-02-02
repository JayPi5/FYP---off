import { createRouter, createWebHistory } from "vue-router";

import Quiz from "./pages/Quiz.vue";
import QR from "./pages/QR.vue";

// ✅ new single flow entry point
import DiscussionFlow from "./pages/discussions/DiscussionFlow.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // default landing
    { path: "/", redirect: "/discussion" },

    // keep existing pages
    { path: "/quiz", name: "quiz", component: Quiz },
    { path: "/qr", name: "qr", component: QR },

    // ✅ discussion flow (internal state machine handles steps)
    { path: "/discussion", name: "discussion", component: DiscussionFlow },

    // optional: catch-all
    { path: "/:pathMatch(.*)*", redirect: "/discussion" },
  ],
});
