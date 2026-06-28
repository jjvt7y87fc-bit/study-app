"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  applyKanjiReviewUpdates,
  saveKanjiQuizResult,
  type ReviewOutcome,
} from "@/app/kanji/actions";
import type { Grade, KanjiMistake, QuizCandidate, QuizMode } from "@/lib/types";
import HandwritingCanvas, {
  type HandwritingCanvasHandle,
} from "@/components/HandwritingCanvas";

const MISTAKE_LIMIT = 10;
const WRITE_BATCH_SIZE = 10;

type ReadPhase = "quiz" | "result";
type WritePhase = "writing" | "grading" | "result";

type Drawing = {
  candidate: QuizCandidate;
  dataUrl: string | null;
};

export default function QuizClient({
  candidates,
  grades,
  mode,
}: {
  candidates: QuizCandidate[];
  grades: Grade[];
  mode: QuizMode;
}) {
  if (mode === "write") {
    return <WriteQuiz candidates={candidates} grades={grades} />;
  }
  return <ReadQuiz candidates={candidates} grades={grades} />;
}

function ResultView({
  totalAnswered,
  correctCount,
  mistakes,
  saving,
  reachedLimit,
}: {
  totalAnswered: number;
  correctCount: number;
  mistakes: KanjiMistake[];
  saving: boolean;
  reachedLimit: boolean;
}) {
  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">結果</h1>
      <p className="text-xl">
        {totalAnswered}問中 <span className="font-bold text-blue-600">{correctCount}</span>{" "}
        問正解！
      </p>
      {reachedLimit && (
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
                  <>　正解の漢字: {m.character}</>
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

function HintBox({ meaning }: { meaning: string | null }) {
  const [showHint, setShowHint] = useState(false);
  if (!meaning) return null;
  return (
    <div className="flex justify-center">
      {showHint ? (
        <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{meaning}</p>
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
  );
}

function ReadQuiz({ candidates, grades }: { candidates: QuizCandidate[]; grades: Grade[] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<KanjiMistake[]>([]);
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([]);
  const [phase, setPhase] = useState<ReadPhase>("quiz");
  const [saving, setSaving] = useState(false);

  const current = candidates[index];
  const wrongCount = mistakes.length;
  const fontSizeClass = current.kanji.character.length <= 2 ? "text-7xl" : "text-5xl";

  function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = answer.trim();
    const isCorrect = current.kanji.readings.includes(trimmed);

    const newOutcomes: ReviewOutcome[] = [
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
          mode: "read" as const,
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
    return (
      <ResultView
        totalAnswered={correctCount + mistakes.length}
        correctCount={correctCount}
        mistakes={mistakes}
        saving={saving}
        reachedLimit={mistakes.length >= MISTAKE_LIMIT}
      />
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        第{index + 1}問　間違い {wrongCount} / {MISTAKE_LIMIT}
      </p>
      <div className="flex justify-center">
        <span className={`${fontSizeClass} font-bold`}>{current.kanji.character}</span>
      </div>
      <HintBox meaning={current.kanji.meaning} />
      <form onSubmit={submitAnswer} className="flex flex-col items-center gap-4">
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="ひらがなで入力"
          className="w-64 rounded border px-4 py-3 text-center text-xl"
        />
        <button type="submit" className="rounded bg-blue-600 px-6 py-2 font-bold text-white">
          次へ
        </button>
      </form>
    </div>
  );
}

function WriteQuiz({ candidates, grades }: { candidates: QuizCandidate[]; grades: Grade[] }) {
  const batch = candidates.slice(0, Math.min(WRITE_BATCH_SIZE, candidates.length));
  const [index, setIndex] = useState(0);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [judgments, setJudgments] = useState<Record<number, boolean>>({});
  const [phase, setPhase] = useState<WritePhase>("writing");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HandwritingCanvasHandle>(null);

  const current = batch[index];

  function goNext() {
    const dataUrl = canvasRef.current?.getDataUrl() ?? null;
    const newDrawings = [...drawings, { candidate: current, dataUrl }];
    setDrawings(newDrawings);

    if (index === batch.length - 1) {
      setPhase("grading");
    } else {
      setIndex((i) => i + 1);
    }
  }

  function setJudgment(i: number, correct: boolean) {
    setJudgments((prev) => ({ ...prev, [i]: correct }));
  }

  const allJudged = drawings.length > 0 && drawings.every((_, i) => judgments[i] !== undefined);

  async function submitGrading() {
    setSaving(true);
    const mistakes: KanjiMistake[] = [];
    const outcomes: ReviewOutcome[] = [];
    let correctCount = 0;

    drawings.forEach((d, i) => {
      const isCorrect = judgments[i] === true;
      if (isCorrect) {
        correctCount += 1;
      } else {
        mistakes.push({
          character: d.candidate.kanji.character,
          correct_readings: d.candidate.kanji.readings,
          your_answer: "",
          mode: "write",
        });
      }
      outcomes.push({
        kanjiId: d.candidate.kanji.id,
        correct: isCorrect,
        reviewId: d.candidate.review?.id,
        stage: d.candidate.review?.stage,
      });
    });

    try {
      await Promise.all([
        saveKanjiQuizResult({
          grades,
          totalCount: outcomes.length,
          correctCount,
          mistakes,
        }),
        applyKanjiReviewUpdates(outcomes),
      ]);
    } finally {
      setSaving(false);
      setPhase("result");
    }
  }

  if (phase === "result") {
    const correctCount = drawings.filter((_, i) => judgments[i] === true).length;
    const mistakes: KanjiMistake[] = drawings
      .filter((_, i) => judgments[i] !== true)
      .map((d) => ({
        character: d.candidate.kanji.character,
        correct_readings: d.candidate.kanji.readings,
        your_answer: "",
        mode: "write" as const,
      }));
    return (
      <ResultView
        totalAnswered={drawings.length}
        correctCount={correctCount}
        mistakes={mistakes}
        saving={saving}
        reachedLimit={false}
      />
    );
  }

  if (phase === "grading") {
    return (
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">採点しましょう</h1>
        <p className="text-sm text-gray-500">
          書いた文字と正解を見比べて、できていたら「できた」、できていなかったら「できなかった」を押してください。
        </p>
        <div className="space-y-4">
          {drawings.map((d, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 rounded-lg border p-3">
              <div className="text-center">
                <p className="mb-1 text-xs text-gray-500">書いた文字</p>
                {d.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.dataUrl}
                    alt="書いた文字"
                    className="h-24 w-24 rounded border bg-white"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded border bg-gray-50 text-xs text-gray-400">
                    （未記入）
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="mb-1 text-xs text-gray-500">正解</p>
                <p className="text-4xl font-bold">{d.candidate.kanji.character}</p>
                <p className="text-xs text-gray-500">
                  {d.candidate.kanji.readings.join("・")}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setJudgment(i, true)}
                  className={`rounded px-3 py-2 text-sm font-semibold ${
                    judgments[i] === true
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  できた
                </button>
                <button
                  type="button"
                  onClick={() => setJudgment(i, false)}
                  className={`rounded px-3 py-2 text-sm font-semibold ${
                    judgments[i] === false
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  できなかった
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={!allJudged || saving}
          onClick={submitGrading}
          className="rounded bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-40"
        >
          {saving ? "保存中..." : "結果を保存する"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        第{index + 1}問 / 全{batch.length}問
      </p>
      <div className="flex justify-center">
        <span className="text-5xl font-bold">{current.kanji.readings.join("・")}</span>
      </div>
      <HintBox meaning={current.kanji.meaning} />
      <div className="flex flex-col items-center gap-4">
        <HandwritingCanvas key={index} ref={canvasRef} />
        <button
          type="button"
          onClick={goNext}
          className="rounded bg-blue-600 px-6 py-2 font-bold text-white"
        >
          {index === batch.length - 1 ? "書き終わって採点へ" : "次へ"}
        </button>
      </div>
    </div>
  );
}
