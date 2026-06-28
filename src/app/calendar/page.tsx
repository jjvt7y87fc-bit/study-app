import { supabase } from "@/lib/supabase";
import type { HyakumasuResult, KanjiQuizResult } from "@/lib/types";
import CalendarView from "@/app/calendar/CalendarView";

export const dynamic = "force-dynamic";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { y, m } = await searchParams;
  const now = new Date();
  const year = Number(y) || now.getFullYear();
  const month = Number(m) || now.getMonth() + 1; // 1-12

  const start = `${year}-${pad(month)}-01T00:00:00`;
  const endDate = new Date(year, month, 1); // 翌月1日
  const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-01T00:00:00`;

  const [hyakumasuRes, kanjiRes] = await Promise.all([
    supabase
      .from("hyakumasu_results")
      .select("*")
      .gte("taken_at", start)
      .lt("taken_at", end)
      .order("taken_at", { ascending: true }),
    supabase
      .from("kanji_quiz_results")
      .select("*")
      .gte("taken_at", start)
      .lt("taken_at", end)
      .order("taken_at", { ascending: true }),
  ]);

  if (hyakumasuRes.error) throw new Error(hyakumasuRes.error.message);
  if (kanjiRes.error) throw new Error(kanjiRes.error.message);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">学習カレンダー</h1>
      <CalendarView
        year={year}
        month={month}
        hyakumasuResults={(hyakumasuRes.data ?? []) as HyakumasuResult[]}
        kanjiResults={(kanjiRes.data ?? []) as KanjiQuizResult[]}
      />
    </div>
  );
}
