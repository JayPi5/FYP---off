<template>
  <div class="screen">
    <div class="stageWrap">
      <div class="stage" aria-label="Quiz Stage (1920x1080)">
        <!-- QUIZ MODE -->
        <div>
          <!-- Question -->
          <div class="questionCard">
            <div class="questionText">
              <span v-if="question">{{ question.text }}</span>
              <span v-else-if="loading">Loading...</span>
              <span v-else>Unable to load question</span>
            </div>
          </div>

          <!-- Answers -->
          <div class="answersRow">
            <button
              class="answerCard"
              :class="answerClass('A')"
              type="button"
              @click="pick('A')"
              :disabled="picked !== null || loading || !question"
            >
              <div class="badge">A</div>
              <div class="answerText">{{ question?.answers?.A ?? "..." }}</div>
            </button>

            <button
              class="answerCard"
              :class="answerClass('B')"
              type="button"
              @click="pick('B')"
              :disabled="picked !== null || loading || !question"
            >
              <div class="badge">B</div>
              <div class="answerText">{{ question?.answers?.B ?? "..." }}</div>
            </button>
          </div>

          <!-- Fact + Next -->
          <div v-if="picked !== null" class="factRow">
            <div class="factBox">
              <div class="factTitle">Did you know?</div>
              <div class="factText">
                <span v-if="question">{{ question.fact }}</span>
              </div>
            </div>

            <button class="nextBtn" type="button" @click="next" :disabled="loading">
              Next
            </button>
          </div>

          <div v-if="errorMsg" class="errorToast">
            {{ errorMsg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAllQuestions, postAnswer, type QuizQuestion } from "../services/api";
import { logTelemetry, makeSessionId } from "../services/telemetry";

type Choice = "A" | "B";

const router = useRouter();

const questions = ref<QuizQuestion[]>([]);
const index = ref<number>(0);

const picked = ref<Choice | null>(null);
const isCorrect = ref<boolean | null>(null);
const sessionId = ref<string>("");

const loading = ref<boolean>(false);
const errorMsg = ref<string | null>(null);

// current question safely
const question = computed<QuizQuestion | null>(() => {
  const arr = questions.value;
  const i = index.value;
  if (i < 0 || i >= arr.length) return null;
  return arr[i] ?? null;
});

// strict-TS-safe shuffle
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

  // ✅ Finished: go to QR page
  if (nextIndex >= questions.value.length) {
    router.push({ path: "/qr", query: { mode: "quiz", sid: sessionId.value } });
    return;
  }

  index.value = nextIndex;

  // reset per-question state
  picked.value = null;
  isCorrect.value = null;
}

onMounted(async () => {
  sessionId.value = makeSessionId();

  // fire-and-forget so quiz still works even if telemetry endpoint is missing
  logTelemetry("quiz", "VISIT", sessionId.value).catch((e) => {
    console.error("VISIT telemetry failed:", e);
  });

  startQuiz();
});


</script>

<style scoped>
/* Fullscreen black background */
.screen {
  width: 100%;
  height: 100%;
  background: #0b0b0c;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
}


/* Wrapper for perfect centering */
.stageWrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Fixed 1920x1080 design canvas */

.stage {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
}


/* Question */
.questionCard {
  width: 1040px;
  background: #ffffff;
  border-radius: 28px;
  padding: 44px 52px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);

  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
}

.questionText {
  text-align: center;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  font-size: 44px;
  line-height: 1.15;
  color: #1b1b1b;
}

/* Answers */
.answersRow {
  position: absolute;
  top: 445px;
  left: 50%;
  transform: translateX(-50%);

  width: 1040px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 90px;
}

.answerCard {
  height: 230px;
  background: #0b5fbf;
  border: none;
  border-radius: 28px;

  position: relative;
  cursor: pointer;

  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  transition: transform 120ms ease, filter 120ms ease;
}

.answerCard:active {
  transform: scale(0.99);
}

.answerCard:disabled {
  cursor: default;
}

.answerCard.wrong {
  background: #c6160a;
}

.answerCard.correct {
  background: #0f7a3c;
}

.badge {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);

  width: 62px;
  height: 62px;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.14);
  display: grid;
  place-items: center;

  color: #ffffff;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  font-size: 28px;
}

.answerText {
  height: 100%;
  display: grid;
  place-items: center;

  color: #ffffff;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  font-size: 40px;
}

.factRow {
  position: absolute;
  top: 720px;
  left: 50%;
  transform: translateX(-50%);

  width: 1240px;

  display: flex;
  flex-direction: row;
  gap: 40px;

  align-items: stretch;
}

.factBox {
  flex: 1;
  background: rgba(25, 25, 26, 0.92);
  border-radius: 22px;
  padding: 26px 30px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
}

.factTitle {
  color: #ffffff;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  font-size: 26px;
  margin-bottom: 10px;
  opacity: 0.95;
}

.factText {
  color: rgba(255, 255, 255, 0.92);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 600;
  font-size: 30px;
  line-height: 1.25;
}

.nextBtn {
  width: 220px;
  height: auto;
  align-self: stretch;

  background: #1b57b9;
  border: none;
  border-radius: 18px;

  color: #ffffff;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 800;
  font-size: 34px;

  cursor: pointer;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  transition: transform 120ms ease;

  display: grid;
  place-items: center;
}

.nextBtn:active {
  transform: scale(0.99);
}

.errorToast {
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  background: rgba(198, 22, 10, 0.15);
  border: 1px solid rgba(198, 22, 10, 0.35);
  color: rgba(255, 255, 255, 0.9);
  padding: 12px 18px;
  border-radius: 14px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-weight: 600;
  font-size: 18px;
}
</style>
