import { supabase } from "@/lib/supabase";
import type { HyakumasuResult, KanjiQuizResult } from "@/lib/types";
import { getActiveProfile } from "@/lib/profile";
import CalendarView from "@/app/calendar/CalendarView";

export const dynamic = "force-dynamic";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; view?: string }>;
}) {
  const { y, m, view: viewParam } = await searchParams;
  const view: "me" | "all" = viewParam === "all" ? "all" : "me";
  const now = new Date();
  const year = Number(y) || now.getFullYear();
  const month = Number(m) || now.getMonth() + 1; // 1-12

  const start = `${year}-${pad(month)}-01T00:00:00`;
  const endDate = new Date(year, month, 1); // 翌月1日
  const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-01T00:00:00`;

  const activeProfile = await getActiveProfile();

  let hyakumasuQuery = supabase
    .from("hyakumasu_results")
    .select("*, profiles(name, emoji)")
    .gte("taken_at", start)
    .lt("taken_at", end)
    .order("taken_at", { ascending: true });
  let kanjiQuery = supabase
    .from("kanji_quiz_results")
    .select("*, profiles(name, emoji)")
    .gte("taken_at", start)
    .lt("taken_at", end)
    .order("taken_at", { ascending: true });

  if (view === "me" && activeProfile) {
    hyakumasuQuery = hyakumasuQuery.eq("profile_id", activeProfile.id);
    kanjiQuery = kanjiQuery.eq("profile_id", activeProfile.id);
  }

  const [hyakumasuRes, kanjiRes] = await Promise.all([hyakumasuQuery, kanjiQuery]);

  if (hyakumasuRes.error) throw new Error(hyakumasuRes.error.message);
  if (kanjiRes.error) throw new Error(kanjiRes.error.message);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">学習カレンダー</h1>
        <div className="flex gap-1 rounded-full border bg-white p-1 text-sm">
          <a
            href={`/calendar?y=${year}&m=${month}&view=me`}
            className={`rounded-full px-3 py-1 font-semibold ${
              view === "me" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            {activeProfile ? `${activeProfile.name}の記録` : "自分の記録"}
          </a>
          <a
            href={`/calendar?y=${year}&m=${month}&view=all`}
            className={`rounded-full px-3 py-1 font-semibold ${
              view === "all" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            みんなの記録
          </a>
        </div>
      </div>
      <CalendarView
        year={year}
        month={month}
        view={view}
        hyakumasuResults={(hyakumasuRes.data ?? []) as HyakumasuResult[]}
        kanjiResults={(kanjiRes.data ?? []) as KanjiQuizResult[]}
      />
    </div>
  );
}
