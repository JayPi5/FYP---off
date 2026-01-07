import { createRouter, createWebHistory } from "vue-router";

import ModeSelect from "./pages/ModeSelect.vue";
import Quiz from "./pages/Quiz.vue";
import Discussion from "./pages/Discussion.vue";
import QR from "./pages/QR.vue";
import Chatbot from "./pages/Chatbot.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/modes" }, // Home removed
    { path: "/modes", component: ModeSelect },
    { path: "/quiz", component: Quiz },
    { path: "/discussion", component: Discussion },
    { path: "/qr", component: QR },
    { path: "/chatbot", component: Chatbot },

  ],
});


