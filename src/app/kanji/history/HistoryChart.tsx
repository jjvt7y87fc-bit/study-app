"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KanjiQuizResult } from "@/lib/types";

export default function HistoryChart({
  results,
}: {
  results: KanjiQuizResult[];
}) {
  const data = [...results]
    .reverse()
    .map((r) => ({
      date: new Date(r.taken_at).toLocaleDateString("ja-JP"),
      正解率: Math.round((r.correct_count / r.total_count) * 100),
    }));

  return (
    <div className="h-64 rounded-xl border bg-white p-4 shadow-sm">
      <p className="mb-2 font-semibold text-gray-700">正解率の推移（%）</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="正解率" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
