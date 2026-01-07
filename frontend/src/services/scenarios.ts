import { OFFERS } from "./offers";

export type NodeTag = "ask" | "advise" | "assess" | "assist" | "arrange" | "end";

export type ChoiceEffect =
  | { type: "setFlag"; key: string; value: unknown }
  | { type: "proposeOffer"; offerId: string }
  | { type: "markQrIntent"; offerId?: string }
  | { type: "completeSession" };

export type Choice = {
  label: string;
  next: string;
  effects?: ChoiceEffect[];
};

export type Node = {
  id: string;
  text: string;
  tag?: NodeTag;
  choices: [Choice, Choice, Choice, Choice];
};

export type Scenario = {
  id: string;
  title: string;
  introHint?: string;
  startId: string;
  nodes: Record<string, Node>;
};

const offerName = (id: string) => OFFERS.find(o => o.id === id)?.name ?? id;

/**
 * Tone rules baked into writing:
 * - short, natural, not “therapy”
 * - no guilt / no lecture
 * - practical + campus-relevant
 * - “help the bird” framing without being childish
 */
export const DISCUSSION_SCENARIOS: Scenario[] = [
  {
    id: "practical",
    title: "Quick & practical",
    introHint: "Fast path → one useful option",
    startId: "p0",
    nodes: {
      p0: {
        id: "p0",
        text: "Hey. I’m getting out of breath lately. If you help me for 60 seconds, we can pick one support option in this region. Deal?",
        choices: [
          { label: "Deal. What do you need?", next: "p1" },
          { label: "I’m in a rush.", next: "p_rush" },
          { label: "I’m not trying to quit.", next: "p_notready" },
          { label: "I only smoke sometimes.", next: "p_light" },
        ],
      },

      // ASK
      p1: {
        id: "p1",
        tag: "ask",
        text: "First: when do cigarettes usually happen for you?",
        choices: [
          { label: "Stress / nerves.", next: "p2_stress" },
          { label: "Routine (coffee, breaks).", next: "p2_routine" },
          { label: "Social / with friends.", next: "p2_social" },
          { label: "Honestly: everywhere.", next: "p2_everywhere" },
        ],
      },

      // ADVISE (light, non-lecture)
      p2_stress: {
        id: "p2_stress",
        tag: "advise",
        text: "That makes sense. If we aim for one tiny change today, it should be built for stress — not willpower.",
        choices: [
          { label: "Okay. What tiny change?", next: "p3_assess" },
          { label: "I hate “tips”.", next: "p3_assess" },
          { label: "I just want help options.", next: "p4_offers" },
          { label: "Not today.", next: "p_end_soft" },
        ],
      },
      p2_routine: {
        id: "p2_routine",
        tag: "advise",
        text: "Routine smokers are predictable — which is good. One small swap can reduce the count without drama.",
        choices: [
          { label: "Okay. Keep it simple.", next: "p3_assess" },
          { label: "I’m not changing my routine.", next: "p3_assess" },
          { label: "Just show support options.", next: "p4_offers" },
          { label: "Not today.", next: "p_end_soft" },
        ],
      },
      p2_social: {
        id: "p2_social",
        tag: "advise",
        text: "Social smoking is tricky because it’s tied to people, not nicotine. We can still pick something realistic.",
        choices: [
          { label: "Okay. What’s realistic?", next: "p3_assess" },
          { label: "I’m not quitting my friends.", next: "p3_assess" },
          { label: "Skip to help options.", next: "p4_offers" },
          { label: "Not today.", next: "p_end_soft" },
        ],
      },
      p2_everywhere: {
        id: "p2_everywhere",
        tag: "advise",
        text: "If it’s everywhere, the win is picking one situation to handle first — not the whole life at once.",
        choices: [
          { label: "Okay. One situation.", next: "p3_assess" },
          { label: "Sounds impossible.", next: "p3_assess" },
          { label: "Show support options.", next: "p4_offers" },
          { label: "Not today.", next: "p_end_soft" },
        ],
      },

      // ASSESS
      p3_assess: {
        id: "p3_assess",
        tag: "assess",
        text: "Right now, which one is closest?",
        choices: [
          { label: "I’m thinking about quitting soon.", next: "p4_offers", effects: [{ type: "setFlag", key: "ready", value: "soon" }] },
          { label: "I’m unsure, but curious.", next: "p4_offers", effects: [{ type: "setFlag", key: "ready", value: "unsure" }] },
          { label: "Not quitting — just reducing.", next: "p4_offers", effects: [{ type: "setFlag", key: "ready", value: "reduce" }] },
          { label: "Not ready at all.", next: "p_notready", effects: [{ type: "setFlag", key: "ready", value: "no" }] },
        ],
      },

      // ASSIST = propose one real offer
      p4_offers: {
        id: "p4_offers",
        tag: "assist",
        text: "If you had to pick ONE thing that would actually help (for me… and maybe for you), what would it be?",
        choices: [
          {
            label: `Talk to a coach (local) — ${offerName("cipret")}`,
            next: "p5_arrange",
            effects: [{ type: "proposeOffer", offerId: "cipret" }],
          },
          {
            label: `Structured follow-up (local) — ${offerName("ligue_ne")}`,
            next: "p5_arrange",
            effects: [{ type: "proposeOffer", offerId: "ligue_ne" }],
          },
          {
            label: `Quick resources — ${offerName("stop_tabac")}`,
            next: "p5_arrange",
            effects: [{ type: "proposeOffer", offerId: "stop_tabac" }],
          },
          {
            label: `Online support — ${offerName("safezone")}`,
            next: "p5_arrange",
            effects: [{ type: "proposeOffer", offerId: "safezone" }],
          },
        ],
      },

      // ARRANGE = QR intent
      p5_arrange: {
        id: "p5_arrange",
        tag: "arrange",
        text: "Nice. Want the QR so you can grab it later without thinking too much about it now?",
        choices: [
          { label: "Yes. Show the QR.", next: "p_end_complete", effects: [{ type: "markQrIntent" }] },
          { label: "Not now — just note it.", next: "p_end_complete" },
          { label: "Switch to a different option.", next: "p4_offers" },
          { label: "I’m done for today.", next: "p_end_soft" },
        ],
      },

      // Soft exits
      p_rush: {
        id: "p_rush",
        text: "No problem. If you want the fastest useful thing: pick one support option and leave with the QR.",
        choices: [
          { label: "Okay, show options.", next: "p4_offers" },
          { label: "Just give me quick resources.", next: "p5_quick", effects: [{ type: "proposeOffer", offerId: "stop_tabac" }] },
          { label: "I’ll come back later.", next: "p_end_soft" },
          { label: "I’m leaving.", next: "p_end_soft" },
        ],
      },
      p_light: {
        id: "p_light",
        text: "That can still turn into a habit fast — especially in stress weeks. Want to keep it occasional on purpose?",
        choices: [
          { label: "Yes, keep it occasional.", next: "p3_assess" },
          { label: "I don’t care.", next: "p_notready" },
          { label: "Show support options anyway.", next: "p4_offers" },
          { label: "Not today.", next: "p_end_soft" },
        ],
      },
      p_notready: {
        id: "p_notready",
        text: "Fair. No pressure. If you ever decide to reduce even a little, having one option ready helps.",
        choices: [
          { label: "Show the simplest option.", next: "p5_quick", effects: [{ type: "proposeOffer", offerId: "stop_tabac" }] },
          { label: "Show local options.", next: "p4_offers" },
          { label: "Maybe later.", next: "p_end_soft" },
          { label: "Stop asking.", next: "p_end_soft" },
        ],
      },
      p5_quick: {
        id: "p5_quick",
        text: "Here’s the quick one: a single page of options you can open later. Want the QR?",
        choices: [
          { label: "Yes, show QR.", next: "p_end_complete", effects: [{ type: "markQrIntent" }] },
          { label: "No, I’ll remember.", next: "p_end_complete" },
          { label: "Actually show other options.", next: "p4_offers" },
          { label: "Done.", next: "p_end_soft" },
        ],
      },

      // END nodes
      p_end_complete: {
        id: "p_end_complete",
        tag: "end",
        text: "Thanks. That genuinely helps. I’ll keep breathing a bit easier if people keep doing this.",
        choices: [
          { label: "Finish", next: "p_done", effects: [{ type: "completeSession" }] },
          { label: "Show QR now", next: "p_done", effects: [{ type: "markQrIntent" }, { type: "completeSession" }] },
          { label: "Restart", next: "p0" },
          { label: "Back to menu", next: "p_done" },
        ],
      },
      p_end_soft: {
        id: "p_end_soft",
        tag: "end",
        text: "All good. If you want later, come back and we’ll keep it simple.",
        choices: [
          { label: "Back to menu", next: "p_done" },
          { label: "Restart", next: "p0" },
          { label: "Show options anyway", next: "p4_offers" },
          { label: "Finish", next: "p_done" },
        ],
      },
      p_done: {
        id: "p_done",
        tag: "end",
        text: " ",
        choices: [
          { label: " ", next: "p_done" },
          { label: " ", next: "p_done" },
          { label: " ", next: "p_done" },
          { label: " ", next: "p_done" },
        ],
      },
    },
  },

  // Scenario 2: resistant / tired (still useful, not preachy)
  {
    id: "resistant",
    title: "Not in the mood",
    introHint: "No pressure → still leave with something useful",
    startId: "r0",
    nodes: {
      r0: {
        id: "r0",
        text: "I’m not here to convince you of anything. If you want, we can just find the least-annoying kind of help option.",
        choices: [
          { label: "Okay. Least annoying.", next: "r1" },
          { label: "I don’t want help.", next: "r_end" },
          { label: "I only want to reduce.", next: "r1", effects: [{ type: "setFlag", key: "ready", value: "reduce" }] },
          { label: "I’m just killing time.", next: "r1" },
        ],
      },
      r1: {
        id: "r1",
        tag: "ask",
        text: "What’s the main reason cigarettes stay in your day?",
        choices: [
          { label: "Stress.", next: "r2" },
          { label: "Habit.", next: "r2" },
          { label: "Social.", next: "r2" },
          { label: "No idea.", next: "r2" },
        ],
      },
      r2: {
        id: "r2",
        tag: "assess",
        text: "Right now, what would you tolerate?",
        choices: [
          { label: `A website I can skim later (${offerName("stop_tabac")}).`, next: "r3", effects: [{ type: "proposeOffer", offerId: "stop_tabac" }] },
          { label: `An online chat/consult (${offerName("safezone")}).`, next: "r3", effects: [{ type: "proposeOffer", offerId: "safezone" }] },
          { label: `A real person (local coaching).`, next: "r3", effects: [{ type: "proposeOffer", offerId: "cipret" }] },
          { label: `Nothing. Seriously.`, next: "r_end" },
        ],
      },
      r3: {
        id: "r3",
        tag: "arrange",
        text: "Cool. Want the QR so you don’t have to remember it?",
        choices: [
          { label: "Yes, QR.", next: "r_end2", effects: [{ type: "markQrIntent" }] },
          { label: "No, I’m good.", next: "r_end2" },
          { label: "Switch option.", next: "r2" },
          { label: "Stop here.", next: "r_end" },
        ],
      },
      r_end2: {
        id: "r_end2",
        tag: "end",
        text: "That’s enough for today. You didn’t overthink it — perfect.",
        choices: [
          { label: "Finish", next: "r_done", effects: [{ type: "completeSession" }] },
          { label: "Back to menu", next: "r_done" },
          { label: "Restart", next: "r0" },
          { label: "Show QR now", next: "r_done", effects: [{ type: "markQrIntent" }, { type: "completeSession" }] },
        ],
      },
      r_end: {
        id: "r_end",
        tag: "end",
        text: "No worries. If you ever want the fastest option, it’s one QR and you’re out.",
        choices: [
          { label: "Back to menu", next: "r_done" },
          { label: "Restart", next: "r0" },
          { label: "Show fast QR anyway", next: "r_done", effects: [{ type: "proposeOffer", offerId: "stop_tabac" }, { type: "markQrIntent" }] },
          { label: "Finish", next: "r_done" },
        ],
      },
      r_done: {
        id: "r_done",
        tag: "end",
        text: " ",
        choices: [
          { label: " ", next: "r_done" },
          { label: " ", next: "r_done" },
          { label: " ", next: "r_done" },
          { label: " ", next: "r_done" },
        ],
      },
    },
  },
];
