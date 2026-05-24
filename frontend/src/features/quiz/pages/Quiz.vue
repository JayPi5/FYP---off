<template>
  <div class="page">
    <main class="wrap" aria-label="Quiz">
      <!-- Question -->
      <section class="card question" aria-label="Question">
        <p class="qText">
          <span v-if="question">{{ question.text }}</span>
          <span v-else-if="loading">Loading…</span>
          <span v-else>Unable to load question</span>
        </p>
      </section>

      <!-- Answers -->
      <section class="answers" aria-label="Answers">
        <button
          class="answer"
          :class="answerClass('A')"
          type="button"
          @click="pick('A')"
          :disabled="picked !== null || loading || !question"
        >
          <div class="badge">A</div>
          <div class="aText">{{ question?.answers?.A ?? "…" }}</div>
        </button>

        <button
          class="answer"
          :class="answerClass('B')"
          type="button"
          @click="pick('B')"
          :disabled="picked !== null || loading || !question"
        >
          <div class="badge">B</div>
          <div class="aText">{{ question?.answers?.B ?? "…" }}</div>
        </button>
      </section>

      <!-- Bottom area (Fact + Next) -->
      <section class="bottom" aria-label="Bottom">
        <div v-if="picked !== null" class="fact">
          <div class="factTitle">Did you know?</div>
          <div class="factText">{{ question?.fact }}</div>
        </div>

        <button
          v-if="picked !== null"
          class="next"
          type="button"
          @click="next"
          :disabled="loading"
        >
          Next
        </button>

        <div v-if="errorMsg" class="error">
          {{ errorMsg }}
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAllQuestions, postAnswer, type QuizQuestion } from "@/shared/services/api";

type Choice = "A" | "B";

const router = useRouter();

const questions = ref<QuizQuestion[]>([]);
const index = ref<number>(0);

const picked = ref<Choice | null>(null);
const isCorrect = ref<boolean | null>(null);

const loading = ref<boolean>(false);
const errorMsg = ref<string | null>(null);

const question = computed<QuizQuestion | null>(() => {
  const arr = questions.value;
  const i = index.value;
  if (i < 0 || i >= arr.length) return null;
  return arr[i] ?? null;
});

function shuffleInPlace(arr: QuizQuestion[]): QuizQuestion[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = arr[i];
    const b = arr[j];
    if (a === undefined || b === undefined) continue;
    arr[i] = b;
    arr[j] = a;
  }
  return arr;
}

async function startQuiz(): Promise<void> {
  loading.value = true;
  errorMsg.value = null;

  picked.value = null;
  isCorrect.value = null;
  index.value = 0;
  questions.value = [];

  try {
    const list = await getAllQuestions();
    questions.value = shuffleInPlace([...list]);

    if (questions.value.length === 0) {
      errorMsg.value = "No active questions.";
      return;
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Failed to load questions";
  } finally {
    loading.value = false;
  }
}

async function pick(choice: Choice): Promise<void> {
  if (!question.value) return;
  if (picked.value !== null) return;

  picked.value = choice;
  isCorrect.value = null;
  errorMsg.value = null;

  try {
    const res = await postAnswer({
      question_id: question.value.id,
      chosen: choice,
    });
    isCorrect.value = res.is_correct;
  } catch (e: unknown) {
    picked.value = null;
    isCorrect.value = null;
    errorMsg.value = e instanceof Error ? e.message : "Failed to submit answer";
  }
}

function answerClass(choice: Choice): string {
  if (picked.value === null) return "";
  if (picked.value !== choice) return "";
  if (isCorrect.value === null) return "";
  return isCorrect.value ? "correct" : "wrong";
}

function next(): void {
  if (picked.value === null) return;

  const nextIndex = index.value + 1;

  if (nextIndex >= questions.value.length) {
    router.push("/qr");
    return;
  }

  index.value = nextIndex;
  picked.value = null;
  isCorrect.value = null;
}

onMounted(() => startQuiz());
</script>

<style scoped>

*,
*::before,
*::after {
  box-sizing: border-box;
}


.page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}


.wrap {
  width: 100%;
  height: 100%;

  /* slightly less top padding + less overall gaps -> reduces dead middle */
  padding: clamp(22px, 3.6vh, 70px) clamp(18px, 4.5vw, 64px) clamp(18px, 3.2vh, 60px);

  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: clamp(14px, 2.2vh, 34px);
}

/* Shared card style */
.card {
  width: 100%;
  border-radius: 28px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
}

/* Question card */
.question {
  background: #fff;

 
  padding: clamp(16px, 2.1vh, 36px) clamp(16px, 2.6vw, 40px);
}

.qText {
  margin: 0;
  text-align: center;
  font-weight: 900;

  /* slightly smaller to prevent visual crowding */
  font-size: clamp(24px, 3.2vw, 55px);

  line-height: 1.12;
  color: #1b1b1b;

  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Answers: always side-by-side, never overflow */
.answers {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

  /* a bit tighter */
  gap: clamp(12px, 2vh, 30px);

  /* pushes answers slightly down */
  margin-top: 150px;
}

/* Answer button */
.answer {
  width: 100%;

  /* slightly taller = nicer touch target */
  height: clamp(135px, 14.2vh, 235px);

  border: none;
  border-radius: 28px;
  background: #0b5fbf;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  transition: transform 120ms ease;

  padding: clamp(10px, 1.6vh, 18px);
  display: grid;
  place-items: center;
}

.answer:active {
  transform: scale(0.99);
}

.answer:disabled {
  cursor: default;
  opacity: 0.98;
}

.answer.correct {
  background: #0f7a3c;
}
.answer.wrong {
  background: #c6160a;
}

.badge {
  position: absolute;
  top: clamp(10px, 1.5vh, 18px);
  left: 50%;
  transform: translateX(-50%);
  width: clamp(40px, 4.6vh, 62px);
  height: clamp(40px, 4.6vh, 62px);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: clamp(18px, 2.2vh, 28px);
}

.aText {
  width: 100%;
  text-align: center;
  font-weight: 900;
  font-size: clamp(20px, 3vw, 44px);
  line-height: 1.12;
  padding: 0 clamp(6px, 1.2vw, 16px);

  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Bottom area: bring it UP a bit (fills the dead middle) */
.bottom {
  width: 100%;
  margin-top: auto;
  margin-bottom : 80px;
  display: grid;
  gap: clamp(200px, 1.8vh, 22px);

  /* was end; start makes it sit higher when there's space */
  align-content: start;

  /* slight lift */
  padding-top: clamp(10px, 2vh, 28px);
}

/* Fact box: make it a bit bigger */
.fact {
  background: rgba(25, 25, 26, 0.92);
  border-radius: 22px;

  /* more padding -> feels more premium and fills space */
  padding: clamp(18px, 2.4vh, 30px);

  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
}

.factTitle {
  font-weight: 900;
  font-size: clamp(16px, 2.1vh, 26px);
  margin-bottom: 8px;
  opacity: 0.95;
}

.factText {
  font-weight: 650;

  /* slightly bigger text */
  font-size: 30px;

  line-height: 1.25;
  color: rgba(255, 255, 255, 0.92);

  /* allow more fact to show, still safe */
  max-height: clamp(150px, 20vh, 320px);
  overflow: hidden;
}

/* Next button: bigger and more present */
.next {
  width: 100%;

  /* bigger */
  height: clamp(80px, 8.5vh, 125px);

  border: none;
  border-radius: 22px;
  background: #1b57b9;
  color: white;
  font-weight: 900;

  /* bigger text */
  font-size: 60px;

  cursor: pointer;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  transition: transform 120ms ease;
}

.next:active {
  transform: scale(0.99);
}

/* Error */
.error {
  justify-self: center;
  background: rgba(198, 22, 10, 0.15);
  border: 1px solid rgba(198, 22, 10, 0.35);
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 14px;
  border-radius: 14px;
  font-weight: 650;
  font-size: 16px;
}

</style>
