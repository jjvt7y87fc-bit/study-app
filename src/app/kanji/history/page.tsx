import { supabase } from "@/lib/supabase";
import type { KanjiQuizResult } from "@/lib/types";
import HistoryChart from "@/app/kanji/history/HistoryChart";

export const dynamic = "force-dynamic";

async function getResults(): Promise<KanjiQuizResult[]> {
  const { data, error } = await supabase
    .from("kanji_quiz_results")
    .select("*")
    .order("taken_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function KanjiHistoryPage() {
  const results = await getResults();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">漢字テストの結果</h1>

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
                  {new Date(r.taken_at).toLocaleString("ja-JP")}　{r.grades
                    .map((g) => `${g}年`)
                    .join("・")}　{r.correct_count}/{r.total_count}問正解
                </summary>
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
