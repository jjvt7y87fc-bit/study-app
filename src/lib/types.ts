export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export type Kanji = {
  id: string;
  character: string;
  readings: string[];
  grade: Grade;
  meaning: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizMode = "read" | "write";

export type KanjiMistake = {
  character: string;
  correct_readings: string[];
  your_answer: string;
  mode?: QuizMode;
};

export type ReviewStage = 0 | 1 | 2;

export type KanjiReview = {
  id: string;
  kanji_id: string;
  stage: ReviewStage;
  due_date: string;
};

export type QuizCandidate = {
  kanji: Kanji;
  review?: { id: string; stage: ReviewStage };
};

export type KanjiQuizResult = {
  id: string;
  taken_at: string;
  grades: Grade[];
  total_count: number;
  correct_count: number;
  mistakes: KanjiMistake[];
};

export type Operation = "add" | "sub" | "mul";

export type HyakumasuResult = {
  id: string;
  taken_at: string;
  operation: Operation;
  time_seconds: number;
  correct_count: number;
};

export const OPERATION_LABELS: Record<Operation, string> = {
  add: "足し算",
  sub: "引き算",
  mul: "かけ算",
};
