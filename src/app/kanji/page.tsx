import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GRADES, type Grade } from "@/lib/types";
import GradeSelectForm from "@/app/kanji/GradeSelectForm";

export const dynamic = "force-dynamic";

async function getGradeCounts(): Promise<Record<Grade, number>> {
  const { data, error } = await supabase.from("kanji").select("grade");
  if (error) throw new Error(error.message);

  const counts = Object.fromEntries(GRADES.map((g) => [g, 0])) as Record<Grade, number>;
  for (const row of data ?? []) {
    counts[row.grade as Grade] += 1;
  }
  return counts;
}

export default async function KanjiTopPage() {
  const counts = await getGradeCounts();
  const hasAnyKanji = Object.values(counts).some((c) => c > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">漢字テスト</h1>
        <Link
          href="/kanji/manage"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          漢字データを管理する →
        </Link>
      </div>

      {!hasAnyKanji ? (
        <p className="rounded-lg border bg-yellow-50 p-4 text-yellow-800">
          まだ漢字が登録されていません。「漢字データを管理する」から漢字を追加してください。
        </p>
      ) : (
        <GradeSelectForm counts={counts} />
      )}
    </div>
  );
}
