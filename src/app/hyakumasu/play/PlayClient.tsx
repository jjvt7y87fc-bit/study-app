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
    // 上段(top)は十分大きい数、左列(left)は0-9。top - left が必ず0以上になるようにする。
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

export default function PlayClient({ operation }: { operation: Operation }) {
  const { top, left } = useMemo(() => generateHeaders(operation), [operation]);
  const [answers, setAnswers] = useState<string[]>(Array(100).fill(""));
  const [phase, setPhase] = useState<Phase>("playing");
  const [elapsed, setElapsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (phase !== "playing") return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - (startRef.current ?? Date.now())) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  function handleChange(idx: number, value: string) {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = digitsOnly;
      return next;
    });

    const r = Math.floor(idx / 10);
    const c = idx % 10;
    const expectedLength = String(compute(operation, top[c], left[r])).length;
    if (digitsOnly.length >= expectedLength && digitsOnly.length > 0) {
      inputRefs.current[idx + 1]?.focus();
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
      await saveHyakumasuResult({
        operation,
        timeSeconds: Math.round(finalTime * 10) / 10,
        correctCount: correct,
      });
    } finally {
      setSaving(false);
    }
  }

  if (phase === "finished") {
    return (
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          結果（{OPERATION_LABELS[operation]}）
        </h1>
        <p className="text-xl">
          所要時間: <span className="font-bold">{elapsed.toFixed(1)}</span> 秒
        </p>
        <p className="text-xl">
          正解数: <span className="font-bold text-green-700">{correctCount}</span> / 100
        </p>
        {saving && <p className="text-sm text-gray-500">結果を保存中...</p>}
        <div className="flex gap-3">
          <Link href="/hyakumasu" className="rounded bg-green-600 px-4 py-2 text-white">
            もう一度
          </Link>
          <Link
            href="/calendar"
            className="rounded bg-gray-600 px-4 py-2 text-white"
          >
            カレンダーを見る
          </Link>
        </div>
      </div>
    );
  }

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
              {top.map((t, i) => (
                <td
                  key={i}
                  className="h-8 w-8 border bg-gray-100 text-xs font-bold sm:h-10 sm:w-10 sm:text-base"
                >
                  {t}
                </td>
              ))}
            </tr>
            {left.map((l, r) => (
              <tr key={r}>
                <td className="h-8 w-8 border bg-gray-100 text-xs font-bold sm:h-10 sm:w-10 sm:text-base">
                  {l}
                </td>
                {top.map((_, c) => {
                  const idx = r * 10 + c;
                  return (
                    <td key={c} className="border p-0">
                      <input
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        value={answers[idx]}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        inputMode="numeric"
                        className="h-8 w-8 text-center text-xs outline-none sm:h-10 sm:w-10 sm:text-base"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
