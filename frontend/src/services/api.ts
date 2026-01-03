const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://127.0.0.1:8000";

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export type QuizQuestion = {
  id: number;
  text: string;
  answers: { A: string; B: string };
  correct?: "A" | "B";
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

export function getRandomQuestion() {
  return request<QuizQuestion>("/api/quiz/question");
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
