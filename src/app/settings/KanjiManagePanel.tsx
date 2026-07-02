import { GRADES, GRADE_LABELS, type Kanji } from "@/lib/types";
import { createKanji, deleteKanji, updateKanji } from "@/app/kanji/actions";
import BulkImportForm from "@/app/settings/BulkImportForm";
import DeleteRecordButton from "@/components/DeleteRecordButton";

export default function KanjiManagePanel({ kanjiList }: { kanjiList: Kanji[] }) {
  return (
    <div className="space-y-8">
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
                  {GRADE_LABELS[g]}
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
    <div className="space-y-2 rounded-lg border bg-white p-4 shadow-sm">
      <form action={updateKanji} className="space-y-2">
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
                {GRADE_LABELS[g]}
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
        <button
          type="submit"
          className="rounded bg-gray-700 px-3 py-1 text-sm font-semibold text-white hover:bg-gray-800"
        >
          更新
        </button>
      </form>
      <DeleteRecordButton id={kanji.id} action={deleteKanji} />
    </div>
  );
}
