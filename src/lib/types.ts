export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const GRADE_LABELS: Record<Grade, string> = {
  1: "小学1年",
  2: "小学2年",
  3: "小学3年",
  4: "小学4年",
  5: "小学5年",
  6: "小学6年",
  7: "中学1年",
  8: "中学2年",
  9: "中学3年",
  10: "高校1年",
  11: "高校2年",
  12: "高校3年",
};

export type Profile = {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
};

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
  points: number;
  profile_id: string | null;
  profiles?: { name: string; emoji: string } | null;
};

export type Operation = "add" | "sub" | "mul";

export type HyakumasuResult = {
  id: string;
  taken_at: string;
  operation: Operation;
  time_seconds: number;
  correct_count: number;
  points: number;
  profile_id: string | null;
  profiles?: { name: string; emoji: string } | null;
};

export const OPERATION_LABELS: Record<Operation, string> = {
  add: "足し算",
  sub: "引き算",
  mul: "かけ算",
};
