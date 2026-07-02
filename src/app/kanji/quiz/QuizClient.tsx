"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  applyKanjiReviewUpdates,
  saveKanjiQuizResult,
  type ReviewOutcome,
} from "@/app/kanji/actions";
import { getPetStage } from "@/lib/pet";
import PetStatus from "@/components/PetStatus";
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

type ResultItem = {
  character: string;
  correctReadings: string[];
  yourAnswer: string;
  isCorrect: boolean;
  mode: QuizMode;
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
  items,
  saving,
  reachedLimit,
  earnedPoints,
  totalPoints,
}: {
  items: ResultItem[];
  saving: boolean;
  reachedLimit: boolean;
  earnedPoints?: number;
  totalPoints?: number;
}) {
  const correctCount = items.filter((i) => i.isCorrect).length;
  const leveledUp =
    totalPoints !== undefined &&
    earnedPoints !== undefined &&
    getPetStage(totalPoints - earnedPoints).level < getPetStage(totalPoints).level;

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">結果</h1>
      <p className="text-xl">
        {items.length}問中 <span className="font-bold text-blue-600">{correctCount}</span>{" "}
        問正解！
      </p>
      {earnedPoints !== undefined && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-lg font-bold text-yellow-800">
            ⭐ {earnedPoints.toLocaleString()} ポイント獲得！
            <span className="ml-2 text-sm font-normal text-yellow-600">
              （{correctCount}問 × 10pt）
            </span>
          </p>
        </div>
      )}
      {!saving && totalPoints !== undefined && (
        <PetStatus totalPoints={totalPoints} leveledUp={leveledUp} />
      )}
      {reachedLimit && (
        <p className="text-sm text-gray-500">
          {MISTAKE_LIMIT}問間違えたので、今日はここまでです。間違えた単語は翌日もう一度出題されます。
        </p>
      )}
      {saving && <p className="text-sm text-gray-500">結果を保存中...</p>}
      <div>
        <h2 className="mb-2 font-semibold text-gray-700">回答一覧</h2>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className={`flex flex-wrap items-center gap-2 text-sm ${
                item.isCorrect ? "text-blue-700" : "text-red-600"
              }`}
            >
              <span className="w-5 flex-none text-center text-lg font-bold">
                {item.isCorrect ? "○" : "×"}
              </span>
              <span className="text-lg font-bold">{item.character}</span>
              {item.mode === "write" ? (
                <span>{item.isCorrect ? "正しく書けました" : "書けませんでした"}</span>
              ) : (
                <span>
                  正解: {item.correctReadings.join("、")}　あなたの回答:{" "}
                  {item.yourAnswer || "（無回答）"}
                </span>
              )}
            </li>
          ))}
        </ul>
        {correctCount < items.length && (
          <p className="mt-2 text-sm text-gray-500">
            間違えた単語は翌日・3日後・14日後に再出題され、正解し続けると出なくなります。
          </p>
        )}
      </div>
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
  const [log, setLog] = useState<ResultItem[]>([]);
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([]);
  const [phase, setPhase] = useState<ReadPhase>("quiz");
  const [saving, setSaving] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | undefined>(undefined);
  const [totalPoints, setTotalPoints] = useState<number | undefined>(undefined);

  const current = candidates[index];
  const wrongCount = log.filter((i) => !i.isCorrect).length;
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

    const newLog: ResultItem[] = [
      ...log,
      {
        character: current.kanji.character,
        correctReadings: current.kanji.readings,
        yourAnswer: trimmed,
        isCorrect,
        mode: "read",
      },
    ];
    setLog(newLog);

    setAnswer("");

    const newWrongCount = newLog.filter((i) => !i.isCorrect).length;
    const reachedLimit = newWrongCount >= MISTAKE_LIMIT;
    const isLastCandidate = index === candidates.length - 1;

    if (reachedLimit || isLastCandidate) {
      void finish(newLog, newOutcomes);
    } else {
      setIndex((i) => i + 1);
    }
  }

  async function finish(finalLog: ResultItem[], finalOutcomes: ReviewOutcome[]) {
    setPhase("result");
    setSaving(true);
    try {
      const mistakes: KanjiMistake[] = finalLog
        .filter((i) => !i.isCorrect)
        .map((i) => ({
          character: i.character,
          correct_readings: i.correctReadings,
          your_answer: i.yourAnswer,
          mode: "read" as const,
        }));
      const [pointsResult] = await Promise.all([
        saveKanjiQuizResult({
          grades,
          totalCount: finalOutcomes.length,
          correctCount: finalOutcomes.length - mistakes.length,
          mistakes,
        }),
        applyKanjiReviewUpdates(finalOutcomes),
      ]);
      setEarnedPoints(pointsResult.earnedPoints);
      setTotalPoints(pointsResult.totalPoints);
    } finally {
      setSaving(false);
    }
  }

  if (phase === "result") {
    return (
      <ResultView
        items={log}
        saving={saving}
        reachedLimit={wrongCount >= MISTAKE_LIMIT}
        earnedPoints={earnedPoints}
        totalPoints={totalPoints}
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
  const [earnedPoints, setEarnedPoints] = useState<number | undefined>(undefined);
  const [totalPoints, setTotalPoints] = useState<number | undefined>(undefined);
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
      const [pointsResult] = await Promise.all([
        saveKanjiQuizResult({
          grades,
          totalCount: outcomes.length,
          correctCount,
          mistakes,
        }),
        applyKanjiReviewUpdates(outcomes),
      ]);
      setEarnedPoints(pointsResult.earnedPoints);
      setTotalPoints(pointsResult.totalPoints);
    } finally {
      setSaving(false);
      setPhase("result");
    }
  }

  if (phase === "result") {
    const items: ResultItem[] = drawings.map((d, i) => ({
      character: d.candidate.kanji.character,
      correctReadings: d.candidate.kanji.readings,
      yourAnswer: "",
      isCorrect: judgments[i] === true,
      mode: "write",
    }));
    return (
      <ResultView
        items={items}
        saving={saving}
        reachedLimit={false}
        earnedPoints={earnedPoints}
        totalPoints={totalPoints}
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
