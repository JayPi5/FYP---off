import { API_BASE } from "@/shared/config/apiBase";
import type { Offer } from "@/data/offers";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export type QuizQuestion = {
  id: number;
  text: string;
  answers: { A: string; B: string };
  fact: string;
};

export type AnswerPayload = {
  question_id: number;
  chosen: "A" | "B";
};

export type AnswerResponse = {
  ok: boolean;
  is_correct: boolean;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(joinUrl(API_BASE, path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }

  return (await res.json()) as T;
}

export function postAnswer(payload: AnswerPayload) {
  return request<AnswerResponse>("/api/quiz/answer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAllQuestions() {
  return request<QuizQuestion[]>("/api/quiz/questions");
}

export type CommunityStats = {
  completed5A_24h: number;
  offers_24h: number;
  scans_24h: number;
  abandons_24h: number;
  scans_8h: number;
  scan_percent_8h: number;
  help_points_8h: number;
  help_percent_8h: number;
};

export type HelpEventPayload = {
  event_kind: "assist" | "offers" | "app_link" | "session_complete" | "progress" | "abandon";
  points?: number;
};

export function getOffers() {
  return request<Offer[]>("/api/offers");
}

export function getCommunityStats() {
  return request<CommunityStats>("/api/community/stats");
}

export function postHelpEvent(payload: HelpEventPayload) {
  return request<{ ok: boolean; error?: string }>("/api/discussion/help-event", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
