"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { saveHyakumasuResult } from "@/app/hyakumasu/actions";
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

function calcPoints(correctCount: number, timeSeconds: number): { base: number; timeBonus: number; total: number } {
  const base = correctCount;
  const timeBonus = Math.max(0, 100 - Math.floor(timeSeconds));
  return { base, timeBonus, total: base + timeBonus };
}

type Phase = "playing" | "finished";
type PreviousResult = { time_seconds: number; correct_count: number } | null;

export default function PlayClient({ operation }: { operation: Operation }) {
  const { top, left } = useMemo(() => generateHeaders(operation), [operation]);
  const [answers, setAnswers] = useState<string[]>(Array(100).fill(""));
  const [correctness, setCorrectness] = useState<(boolean | null)[]>(Array(100).fill(null));
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("playing");
  const [elapsed, setElapsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [previousResult, setPreviousResult] = useState<PreviousResult>(null);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!started || phase !== "playing") return;
    const id = setInterval(() => {
      setElapsed((Date.now() - (startRef.current ?? Date.now())) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [started, phase]);

  function handleChange(idx: number, value: string) {
    if (!started) {
      startRef.current = Date.now();
      setStarted(true);
    }

    const digitsOnly = value.replace(/[^0-9]/g, "");
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
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === "ArrowRight") {
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "ArrowLeft") {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowDown") {
      inputRefs.current[idx + 10]?.focus();
    } else if (e.key === "ArrowUp") {
      inputRefs.current[idx - 10]?.focus();
    }
  }

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
    setElapsed(finalTime);
    setCorrectCount(correct);
    setPhase("finished");
    setSaving(true);
    try {
      const { previousResult: prev } = await saveHyakumasuResult({
        operation,
        timeSeconds: Math.round(finalTime * 10) / 10,
        correctCount: correct,
      });
      setPreviousResult(prev);
    } finally {
      setSaving(false);
    }
  }

  if (phase === "finished") {
    const points = calcPoints(correctCount, elapsed);
    const timeDiff = previousResult !== null ? elapsed - previousResult.time_seconds : null;
    const countDiff = previousResult !== null ? correctCount - previousResult.correct_count : null;

    return (
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          結果（{OPERATION_LABELS[operation]}）
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">所要時間</p>
            <p className="text-3xl font-bold">{elapsed.toFixed(1)}<span className="text-lg">秒</span></p>
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
            ⭐ {points.total} ポイント獲得！
          </p>
          <p className="mt-1 text-sm text-yellow-700">
            正解 {points.base}pt
            {points.timeBonus > 0 && (
              <span className="ml-2">＋ タイムボーナス {points.timeBonus}pt（{Math.floor(elapsed)}秒以内）</span>
            )}
          </p>
        </div>

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
        <p className="text-2xl font-mono font-bold text-green-700">{elapsed.toFixed(1)}秒</p>
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
                    const state = correctness[idx];
                    const isFocused = focusedIdx === idx;
                    const inCross = !isFocused && (r === focusedRow || c === focusedCol);

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
                      <td key={c} className="border p-0">
                        <input
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          value={answers[idx]}
                          onChange={(e) => handleChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          onFocus={() => setFocusedIdx(idx)}
                          onBlur={() => setFocusedIdx(null)}
                          inputMode="numeric"
                          className={`h-8 w-8 text-center text-xs outline-none sm:h-10 sm:w-10 sm:text-base transition-colors ${cellClass}`}
                        />
                      </td>
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
