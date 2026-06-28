"use client";

import Link from "next/link";
import { useState } from "react";
import { OPERATION_LABELS, type HyakumasuResult } from "@/lib/types";

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}
function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export default function CalendarView({
  year,
  month,
  results,
}: {
  year: number;
  month: number;
  results: HyakumasuResult[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDate = new Map<string, HyakumasuResult[]>();
  for (const r of results) {
    const key = dateKey(r.taken_at);
    byDate.set(key, [...(byDate.get(key) ?? []), r]);
  }

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0=日

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);

  const selectedResults = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
        <Link
          href={`/hyakumasu/calendar?y=${prev.year}&m=${prev.month}`}
          className="rounded bg-gray-200 px-3 py-1 font-semibold"
        >
          ← 前月
        </Link>
        <p className="text-lg font-bold">
          {year}年{month}月
        </p>
        <Link
          href={`/hyakumasu/calendar?y=${next.year}&m=${next.month}`}
          className="rounded bg-gray-200 px-3 py-1 font-semibold"
        >
          次月 →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
          <div key={w} className="font-bold text-gray-500">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
          )}`;
          const dayResults = byDate.get(key);
          const fastest = dayResults
            ? Math.min(...dayResults.map((r) => r.time_seconds))
            : null;

          return (
            <button
              key={i}
              type="button"
              onClick={() => dayResults && setSelectedDate(key)}
              className={`flex h-16 flex-col items-center justify-center rounded border ${
                dayResults ? "bg-green-50 hover:bg-green-100" : "bg-white"
              } ${selectedDate === key ? "ring-2 ring-green-600" : ""}`}
            >
              <span className="font-semibold">{day}</span>
              {fastest !== null && (
                <span className="text-xs text-green-700">{fastest.toFixed(1)}秒</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-bold text-gray-700">{selectedDate} の記録</h2>
          {selectedResults.length === 0 ? (
            <p className="text-gray-500">この日の記録はありません。</p>
          ) : (
            <ul className="space-y-2">
              {selectedResults.map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span>{new Date(r.taken_at).toLocaleTimeString("ja-JP")}</span>
                  <span>{OPERATION_LABELS[r.operation]}</span>
                  <span>{r.time_seconds.toFixed(1)}秒</span>
                  <span>{r.correct_count}/100</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
