import { createRouter, createWebHistory } from "vue-router";

import Quiz from "@/features/quiz/pages/Quiz.vue";
import QR from "@/features/quiz/pages/QR.vue";
import DiscussionFlow from "@/features/discussion/pages/DiscussionFlow.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/discussion" },
    { path: "/quiz", name: "quiz", component: Quiz },
    { path: "/qr", name: "qr", component: QR },
    { path: "/discussion", name: "discussion", component: DiscussionFlow },
    { path: "/:pathMatch(.*)*", redirect: "/discussion" },
  ],
});
