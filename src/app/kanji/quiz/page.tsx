import { supabase } from "@/lib/supabase";
import { GRADES, type Grade, type Kanji, type KanjiReview, type QuizCandidate, type QuizMode } from "@/lib/types";
import QuizClient from "@/app/kanji/quiz/QuizClient";

export const dynamic = "force-dynamic";

function parseGrades(raw: string | undefined): Grade[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((g) => Number(g))
    .filter((g): g is Grade => (GRADES as number[]).includes(g));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function KanjiQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ grades?: string; mode?: string }>;
}) {
  const { grades: gradesParam, mode: modeParam } = await searchParams;
  const grades = parseGrades(gradesParam);
  const mode: QuizMode = modeParam === "write" ? "write" : "read";

  if (grades.length === 0) {
    return (
      <p className="text-gray-600">
        学年が選択されていません。
        <a href="/kanji" className="text-blue-600 underline">
          漢字テストのトップ
        </a>
        からやり直してください。
      </p>
    );
  }

  const { data: kanjiData, error: kanjiError } = await supabase
    .from("kanji")
    .select("*")
    .in("grade", grades);

  if (kanjiError) throw new Error(kanjiError.message);

  const kanjiList = (kanjiData ?? []) as Kanji[];

  if (kanjiList.length === 0) {
    return <p className="text-gray-600">選択した学年の漢字データがありません。</p>;
  }

  const kanjiIds = kanjiList.map((k) => k.id);
  const { data: reviewData, error: reviewError } = await supabase
    .from("kanji_reviews")
    .select("*")
    .in("kanji_id", kanjiIds);

  if (reviewError) throw new Error(reviewError.message);

  const reviews = (reviewData ?? []) as KanjiReview[];
  const reviewByKanjiId = new Map(reviews.map((r) => [r.kanji_id, r]));
  const today = todayIso();

  const dueReviewCandidates: QuizCandidate[] = [];
  const newCandidates: QuizCandidate[] = [];

  for (const kanji of kanjiList) {
    const review = reviewByKanjiId.get(kanji.id);
    if (!review) {
      newCandidates.push({ kanji });
    } else if (review.due_date <= today) {
      dueReviewCandidates.push({ kanji, review: { id: review.id, stage: review.stage } });
    }
    // 復習待ちだがまだ期日が来ていない単語は、今日の出題からは除外する
  }

  const candidates = [...shuffle(dueReviewCandidates), ...shuffle(newCandidates)];

  if (candidates.length === 0) {
    return (
      <p className="text-gray-600">
        選択した学年の単語は、すべて復習待ち（まだ再出題の期日が来ていません）です。
        日をまたいでから挑戦してください。
      </p>
    );
  }

  return <QuizClient candidates={candidates} grades={grades} mode={mode} />;
}
