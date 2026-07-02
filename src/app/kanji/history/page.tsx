import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GRADE_LABELS, type KanjiQuizResult } from "@/lib/types";
import { getActiveProfile } from "@/lib/profile";
import HistoryChart from "@/app/kanji/history/HistoryChart";
import { deleteKanjiQuizResult } from "@/app/kanji/actions";
import DeleteRecordButton from "@/components/DeleteRecordButton";

export const dynamic = "force-dynamic";

async function getResults(profileId: string | null, view: "me" | "all"): Promise<KanjiQuizResult[]> {
  let query = supabase
    .from("kanji_quiz_results")
    .select("*, profiles(name, emoji)")
    .order("taken_at", { ascending: false })
    .limit(100);

  if (view === "me" && profileId) {
    query = query.eq("profile_id", profileId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as KanjiQuizResult[];
}

export default async function KanjiHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view: "me" | "all" = viewParam === "all" ? "all" : "me";
  const activeProfile = await getActiveProfile();
  const results = await getResults(activeProfile?.id ?? null, view);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">漢字テストの結果</h1>
        <div className="flex gap-1 rounded-full border bg-white p-1 text-sm">
          <Link
            href="/kanji/history?view=me"
            className={`rounded-full px-3 py-1 font-semibold ${
              view === "me" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            {activeProfile ? `${activeProfile.name}の記録` : "自分の記録"}
          </Link>
          <Link
            href="/kanji/history?view=all"
            className={`rounded-full px-3 py-1 font-semibold ${
              view === "all" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            みんなの記録
          </Link>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-gray-500">まだテスト結果がありません。</p>
      ) : (
        <>
          <HistoryChart results={results} />

          <div className="space-y-3">
            {results.map((r) => (
              <details
                key={r.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <summary className="cursor-pointer font-semibold text-gray-700">
                  {view === "all" && (
                    <span className="mr-2">
                      {r.profiles?.emoji ?? "❓"} {r.profiles?.name ?? "不明"}
                    </span>
                  )}
                  {new Date(r.taken_at).toLocaleString("ja-JP")}　{r.grades
                    .map((g) => GRADE_LABELS[g])
                    .join("・")}　{r.correct_count}/{r.total_count}問正解
                </summary>
                <div className="mt-2">
                  <DeleteRecordButton id={r.id} action={deleteKanjiQuizResult} />
                </div>
                {r.mistakes.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    {r.mistakes.map((m, i) => (
                      <li key={i}>
                        <span className="text-lg font-bold">{m.character}</span>
                        正解: {m.correct_readings.join("、")}　回答:{" "}
                        {m.your_answer || "（無回答）"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-green-600">全問正解！</p>
                )}
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
