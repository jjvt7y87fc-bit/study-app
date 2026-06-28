"use client";

import { useState } from "react";
import Link from "next/link";
import {
  applyKanjiReviewUpdates,
  saveKanjiQuizResult,
  type ReviewOutcome,
} from "@/app/kanji/actions";
import type { Grade, KanjiMistake, QuizCandidate, QuizMode } from "@/lib/types";

const MISTAKE_LIMIT = 10;

type Phase = "quiz" | "result";

export default function QuizClient({
  candidates,
  grades,
  mode,
}: {
  candidates: QuizCandidate[];
  grades: Grade[];
  mode: QuizMode;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<KanjiMistake[]>([]);
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [saving, setSaving] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintShownForIndex, setHintShownForIndex] = useState(-1);

  const current = candidates[index];
  const wrongCount = mistakes.length;
  const promptText =
    mode === "write" ? current.kanji.readings.join("・") : current.kanji.character;
  const fontSizeClass =
    mode === "read" && current.kanji.character.length <= 2 ? "text-7xl" : "text-5xl";

  if (hintShownForIndex !== index && showHint) {
    setShowHint(false);
  }
  if (hintShownForIndex !== index) {
    setHintShownForIndex(index);
  }

  function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = answer.trim();
    const isCorrect =
      mode === "write"
        ? trimmed === current.kanji.character
        : current.kanji.readings.includes(trimmed);

    const newOutcomes = [
      ...outcomes,
      {
        kanjiId: current.kanji.id,
        correct: isCorrect,
        reviewId: current.review?.id,
        stage: current.review?.stage,
      },
    ];
    setOutcomes(newOutcomes);

    let newMistakes = mistakes;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      newMistakes = [
        ...mistakes,
        {
          character: current.kanji.character,
          correct_readings: current.kanji.readings,
          your_answer: trimmed,
          mode,
        },
      ];
      setMistakes(newMistakes);
    }

    setAnswer("");

    const reachedLimit = newMistakes.length >= MISTAKE_LIMIT;
    const isLastCandidate = index === candidates.length - 1;

    if (reachedLimit || isLastCandidate) {
      void finish(newMistakes, newOutcomes);
    } else {
      setIndex((i) => i + 1);
    }
  }

  async function finish(finalMistakes: KanjiMistake[], finalOutcomes: ReviewOutcome[]) {
    setPhase("result");
    setSaving(true);
    try {
      await Promise.all([
        saveKanjiQuizResult({
          grades,
          totalCount: finalOutcomes.length,
          correctCount: finalOutcomes.length - finalMistakes.length,
          mistakes: finalMistakes,
        }),
        applyKanjiReviewUpdates(finalOutcomes),
      ]);
    } finally {
      setSaving(false);
    }
  }

  if (phase === "result") {
    const totalAnswered = correctCount + mistakes.length;
    return (
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">結果</h1>
        <p className="text-xl">
          {totalAnswered}問中 <span className="font-bold text-blue-600">{correctCount}</span>{" "}
          問正解！
        </p>
        {mistakes.length >= MISTAKE_LIMIT && (
          <p className="text-sm text-gray-500">
            {MISTAKE_LIMIT}問間違えたので、今日はここまでです。間違えた単語は翌日もう一度出題されます。
          </p>
        )}
        {saving && <p className="text-sm text-gray-500">結果を保存中...</p>}
        {mistakes.length > 0 && (
          <div>
            <h2 className="mb-2 font-semibold text-gray-700">間違えた単語</h2>
            <ul className="space-y-1">
              {mistakes.map((m, i) => (
                <li key={i} className="text-sm text-gray-700">
                  <span className="text-lg font-bold">{m.character}</span>
                  {m.mode === "write" ? (
                    <>
                      正解の漢字: {m.character}　あなたの回答: {m.your_answer || "（無回答）"}
                    </>
                  ) : (
                    <>
                      正解: {m.correct_readings.join("、")}　あなたの回答:{" "}
                      {m.your_answer || "（無回答）"}
                    </>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-gray-500">
              これらの単語は翌日・3日後・14日後に再出題され、正解し続けると出なくなります。
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Link href="/kanji" className="rounded bg-blue-600 px-4 py-2 text-white">
            もう一度
          </Link>
          <Link href="/kanji/history" className="rounded bg-gray-600 px-4 py-2 text-white">
            過去の結果を見る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        第{index + 1}問　間違い {wrongCount} / {MISTAKE_LIMIT}
      </p>
      <div className="flex justify-center">
        <span className={`${fontSizeClass} font-bold`}>{promptText}</span>
      </div>
      {current.kanji.meaning && (
        <div className="flex justify-center">
          {showHint ? (
            <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              {current.kanji.meaning}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-sm font-semibold text-blue-600 underline"
            >
              ヒントを見る
            </button>
          )}
        </div>
      )}
      <form onSubmit={submitAnswer} className="flex flex-col items-center gap-4">
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={mode === "write" ? "漢字で入力" : "ひらがなで入力"}
          className="w-64 rounded border px-4 py-3 text-center text-xl"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-6 py-2 font-bold text-white"
        >
          次へ
        </button>
      </form>
    </div>
  );
}
