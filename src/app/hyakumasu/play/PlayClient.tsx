"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveHyakumasuResult } from "@/app/hyakumasu/actions";
import { getPetStage } from "@/lib/pet";
import PetStatus from "@/components/PetStatus";
import { OPERATION_LABELS, type Operation } from "@/lib/types";

function shuffledRange(start: number, count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => start + i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateHeaders(operation: Operation): { top: number[]; left: number[] } {
  if (operation === "sub") {
    return { top: shuffledRange(9, 10), left: shuffledRange(0, 10) };
  }
  return { top: shuffledRange(0, 10), left: shuffledRange(0, 10) };
}

function compute(operation: Operation, top: number, left: number): number {
  if (operation === "add") return top + left;
  if (operation === "sub") return top - left;
  return top * left;
}

type Phase = "playing" | "finished";
type PreviousResult = { time_seconds: number; correct_count: number } | null;

function ElapsedTimer({
  active,
  startRef,
}: {
  active: boolean;
  startRef: React.RefObject<number | null>;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setElapsed((Date.now() - (startRef.current ?? Date.now())) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [active, startRef]);

  return <p className="text-2xl font-mono font-bold text-green-700">{elapsed.toFixed(1)}秒</p>;
}

const Cell = memo(function Cell({
  idx,
  value,
  state,
  isFocused,
  inCross,
  setInputRef,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
}: {
  idx: number;
  value: string;
  state: boolean | null;
  isFocused: boolean;
  inCross: boolean;
  setInputRef: (el: HTMLInputElement | null) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}) {
  let cellClass = "";
  if (isFocused) {
    cellClass = "bg-gray-900 text-white";
  } else if (state === true) {
    cellClass = inCross ? "bg-green-200 text-green-800" : "bg-green-50 text-green-700";
  } else if (state === false) {
    cellClass = inCross ? "bg-red-200 text-red-800" : "bg-red-50 text-red-700";
  } else if (inCross) {
    cellClass = "bg-yellow-100";
  }

  return (
    <td className="border p-0">
      <input
        ref={setInputRef}
        data-idx={idx}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        inputMode="numeric"
        className={`h-8 w-8 text-center text-xs outline-none sm:h-10 sm:w-10 sm:text-base transition-colors ${cellClass}`}
      />
    </td>
  );
});

export default function PlayClient({ operation }: { operation: Operation }) {
  const { top, left } = useMemo(() => generateHeaders(operation), [operation]);
  const [answers, setAnswers] = useState<string[]>(Array(100).fill(""));
  const [correctness, setCorrectness] = useState<(boolean | null)[]>(Array(100).fill(null));
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("playing");
  const [finalElapsed, setFinalElapsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [previousResult, setPreviousResult] = useState<PreviousResult>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    if (el) {
      inputRefs.current[Number(el.dataset.idx)] = el;
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = Number(e.currentTarget.dataset.idx);
      if (!startRef.current) {
        startRef.current = Date.now();
        setStarted(true);
      }

      const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
      setAnswers((prev) => {
        const next = [...prev];
        next[idx] = digitsOnly;
        return next;
      });

      const r = Math.floor(idx / 10);
      const c = idx % 10;
      const expected = compute(operation, top[c], left[r]);
      const expectedLength = String(expected).length;
      const isComplete = digitsOnly.length >= expectedLength && digitsOnly.length > 0;

      setCorrectness((prev) => {
        const next = [...prev];
        next[idx] = isComplete ? Number(digitsOnly) === expected : null;
        return next;
      });

      if (isComplete) {
        if (idx === 99) {
          void score();
        } else {
          inputRefs.current[idx + 1]?.focus();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operation, top, left]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const idx = Number(e.currentTarget.dataset.idx);
    if (e.key === "Enter" || e.key === "ArrowRight") {
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "ArrowLeft") {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowDown") {
      inputRefs.current[idx + 10]?.focus();
    } else if (e.key === "ArrowUp") {
      inputRefs.current[idx - 10]?.focus();
    }
  }, []);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocusedIdx(Number(e.currentTarget.dataset.idx));
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIdx(null);
  }, []);

  async function score() {
    const finalTime = (Date.now() - (startRef.current ?? Date.now())) / 1000;
    let correct = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const idx = r * 10 + c;
        const expected = compute(operation, top[c], left[r]);
        if (Number(answers[idx]) === expected) correct++;
      }
    }
    setFinalElapsed(finalTime);
    setCorrectCount(correct);
    setPhase("finished");
    setSaving(true);
    try {
      const {
        previousResult: prev,
        earnedPoints: earned,
        totalPoints: total,
      } = await saveHyakumasuResult({
        operation,
        timeSeconds: Math.round(finalTime * 10) / 10,
        correctCount: correct,
      });
      setPreviousResult(prev);
      setEarnedPoints(earned);
      setTotalPoints(total);
    } finally {
      setSaving(false);
    }
  }

  if (phase === "finished") {
    const timeBonus = Math.max(0, earnedPoints - correctCount);
    const leveledUp =
      totalPoints > 0 && getPetStage(totalPoints - earnedPoints).level < getPetStage(totalPoints).level;
    const timeDiff = previousResult !== null ? finalElapsed - previousResult.time_seconds : null;
    const countDiff = previousResult !== null ? correctCount - previousResult.correct_count : null;

    return (
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          結果（{OPERATION_LABELS[operation]}）
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">所要時間</p>
            <p className="text-3xl font-bold">{finalElapsed.toFixed(1)}<span className="text-lg">秒</span></p>
            {timeDiff !== null && (
              <p className={`mt-1 text-sm font-semibold ${timeDiff < 0 ? "text-green-600" : "text-red-500"}`}>
                {timeDiff < 0
                  ? `▲ ${Math.abs(timeDiff).toFixed(1)}秒速い！`
                  : `▼ ${timeDiff.toFixed(1)}秒遅い`}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">正解数</p>
            <p className="text-3xl font-bold text-green-700">{correctCount}<span className="text-lg text-gray-400">/100</span></p>
            {countDiff !== null && (
              <p className={`mt-1 text-sm font-semibold ${countDiff > 0 ? "text-green-600" : countDiff < 0 ? "text-red-500" : "text-gray-500"}`}>
                {countDiff > 0
                  ? `▲ ${countDiff}問増加！`
                  : countDiff < 0
                    ? `▼ ${Math.abs(countDiff)}問減少`
                    : "前回と同じ"}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-lg font-bold text-yellow-800">
            ⭐ {earnedPoints} ポイント獲得！
          </p>
          <p className="mt-1 text-sm text-yellow-700">
            正解 {correctCount}pt
            {timeBonus > 0 && (
              <span className="ml-2">＋ タイムボーナス {timeBonus}pt（{Math.floor(finalElapsed)}秒以内）</span>
            )}
          </p>
        </div>

        {!saving && <PetStatus totalPoints={totalPoints} leveledUp={leveledUp} />}

        {previousResult === null && !saving && (
          <p className="text-sm text-gray-400">（初回記録です）</p>
        )}
        {saving && <p className="text-sm text-gray-500">結果を保存中...</p>}

        <div className="flex gap-3">
          <Link href="/hyakumasu" className="rounded bg-green-600 px-4 py-2 text-white">
            もう一度
          </Link>
          <Link href="/calendar" className="rounded bg-gray-600 px-4 py-2 text-white">
            カレンダーを見る
          </Link>
        </div>
      </div>
    );
  }

  const focusedRow = focusedIdx !== null ? Math.floor(focusedIdx / 10) : -1;
  const focusedCol = focusedIdx !== null ? focusedIdx % 10 : -1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">{OPERATION_LABELS[operation]}</h1>
        <ElapsedTimer active={started && phase === "playing"} startRef={startRef} />
        <button
          type="button"
          onClick={score}
          className="rounded bg-green-600 px-5 py-2 font-bold text-white"
        >
          採点
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-center">
          <tbody>
            <tr>
              <td className="h-8 w-8 border bg-gray-100 text-xs sm:h-10 sm:w-10 sm:text-base"></td>
              {top.map((t, c) => {
                const isHighlighted = c === focusedCol;
                return (
                  <td
                    key={c}
                    className={`h-8 w-8 border text-xs font-bold sm:h-10 sm:w-10 sm:text-base transition-colors ${
                      isHighlighted ? "bg-gray-800 text-white" : "bg-gray-100"
                    }`}
                  >
                    {t}
                  </td>
                );
              })}
            </tr>
            {left.map((l, r) => {
              const isRowHighlighted = r === focusedRow;
              return (
                <tr key={r}>
                  <td
                    className={`h-8 w-8 border text-xs font-bold sm:h-10 sm:w-10 sm:text-base transition-colors ${
                      isRowHighlighted ? "bg-gray-800 text-white" : "bg-gray-100"
                    }`}
                  >
                    {l}
                  </td>
                  {top.map((_, c) => {
                    const idx = r * 10 + c;
                    const isFocused = focusedIdx === idx;
                    const inCross = !isFocused && (r === focusedRow || c === focusedCol);

                    return (
                      <Cell
                        key={c}
                        idx={idx}
                        value={answers[idx]}
                        state={correctness[idx]}
                        isFocused={isFocused}
                        inCross={inCross}
                        setInputRef={setInputRef}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
