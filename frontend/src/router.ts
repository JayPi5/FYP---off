import { createRouter, createWebHistory } from "vue-router";

import Quiz from "./pages/Quiz.vue";
import QR from "./pages/QR.vue";

// ✅ discussion screens
import Ecran0 from "./pages/discussions/Ecran_0.vue";
import Ecran1 from "./pages/discussions/Ecran1.vue";
import Ecran1b from "./pages/discussions/Ecran1b.vue";
import Ecran2 from "./pages/discussions/Ecran2.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/discussion/0" },

    // keep your existing routes if you want
    { path: "/quiz", component: Quiz },
    { path: "/qr", component: QR },

    // ✅ discussion flow
    { path: "/discussion", redirect: "/discussion/0" },
    { path: "/discussion/0", name: "ecran0", component: Ecran0 },
    { path: "/discussion/1", name: "ecran1", component: Ecran1 },
    { path: "/discussion/1b", name: "ecran1b", component: Ecran1b },
    { path: "/discussion/2", name: "ecran2", component: Ecran2 },
  ],
});
