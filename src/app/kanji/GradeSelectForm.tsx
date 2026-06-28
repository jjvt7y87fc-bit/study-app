"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Grade } from "@/lib/types";

const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];

export default function GradeSelectForm({
  counts,
}: {
  counts: Record<Grade, number>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Grade[]>(
    counts[3] > 0 ? [3] : GRADES.filter((g) => counts[g] > 0).slice(0, 1)
  );

  function toggle(grade: Grade) {
    setSelected((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  }

  function start() {
    if (selected.length === 0) return;
    router.push(`/kanji/quiz?grades=${selected.join(",")}`);
  }

  return (
    <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
      <p className="font-semibold text-gray-700">学年を選んでください（複数選択可）</p>
      <div className="flex flex-wrap gap-3">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            disabled={counts[g] === 0}
            onClick={() => toggle(g)}
            className={`rounded-lg border px-4 py-2 font-semibold transition ${
              selected.includes(g)
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            } ${counts[g] === 0 ? "cursor-not-allowed opacity-40" : ""}`}
          >
            {g}年生（{counts[g]}問）
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={start}
        className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-40"
      >
        クイズを始める
      </button>
    </div>
  );
}
