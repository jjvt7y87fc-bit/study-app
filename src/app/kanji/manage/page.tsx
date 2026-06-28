import { supabase } from "@/lib/supabase";
import type { Grade, Kanji } from "@/lib/types";
import { createKanji, deleteKanji, updateKanji } from "@/app/kanji/actions";
import BulkImportForm from "@/app/kanji/manage/BulkImportForm";

export const dynamic = "force-dynamic";

const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];

async function getKanjiList(): Promise<Kanji[]> {
  const { data, error } = await supabase
    .from("kanji")
    .select("*")
    .order("grade", { ascending: true })
    .order("character", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function KanjiManagePage() {
  const kanjiList = await getKanjiList();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">漢字データ管理</h1>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-700">新しい単語を追加</h2>
        <form action={createKanji} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm text-gray-600">単語（漢字）</label>
            <input
              name="character"
              required
              maxLength={8}
              placeholder="例: 屋上"
              className="w-32 rounded border px-3 py-2 text-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              読み方（読点・スペース区切りで複数可）
            </label>
            <input
              name="readings"
              required
              placeholder="例: あさ、あした"
              className="w-64 rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">学年</label>
            <select name="grade" required className="rounded border px-3 py-2">
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}年生
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">意味（ヒント・省略可）</label>
            <input
              name="meaning"
              placeholder="例: 建物の一番上の屋根の上"
              className="w-64 rounded border px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            追加
          </button>
        </form>
      </section>

      <BulkImportForm />

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">
          登録済みの単語（{kanjiList.length}件）
        </h2>
        {kanjiList.length === 0 && (
          <p className="text-gray-500">
            まだ単語が登録されていません。上のフォームから追加してください。
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kanjiList.map((k) => (
            <KanjiCard key={k.id} kanji={k} />
          ))}
        </div>
      </section>
    </div>
  );
}

function KanjiCard({ kanji }: { kanji: Kanji }) {
  return (
    <form
      action={updateKanji}
      className="space-y-2 rounded-lg border bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="id" value={kanji.id} />
      <div className="flex items-center gap-3">
        <input
          name="character"
          defaultValue={kanji.character}
          maxLength={8}
          className="w-24 rounded border px-2 py-1 text-center text-2xl"
        />
        <select
          name="grade"
          defaultValue={kanji.grade}
          className="rounded border px-2 py-1"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}年生
            </option>
          ))}
        </select>
      </div>
      <input
        name="readings"
        defaultValue={kanji.readings.join("、")}
        className="w-full rounded border px-2 py-1"
      />
      <input
        name="meaning"
        defaultValue={kanji.meaning ?? ""}
        placeholder="意味（ヒント・省略可）"
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-gray-700 px-3 py-1 text-sm font-semibold text-white hover:bg-gray-800"
        >
          更新
        </button>
        <button
          type="submit"
          formAction={deleteKanji}
          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
        >
          削除
        </button>
      </div>
    </form>
  );
}
