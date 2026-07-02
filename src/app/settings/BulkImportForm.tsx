"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bulkCreateKanji, type BulkImportSummary } from "@/app/kanji/actions";

export default function BulkImportForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("bulkText", text);
    startTransition(async () => {
      const result = await bulkCreateKanji(formData);
      setSummary(result);
      if (result.errors.length === 0) {
        setText("");
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-2 font-semibold text-gray-700">単語をまとめて登録</h2>
      <p className="mb-3 text-sm text-gray-500">
        1行に1つずつ、<strong>単語,読み方（スペース区切りで複数可）,学年,意味（省略可）</strong>
        の順でカンマ区切りで入力してください（単語は1文字の漢字でも、複数文字の熟語でもOKです。意味はヒントとしてクイズ中に表示されます）。
        <br />
        例: <code className="rounded bg-gray-100 px-1">屋上,おくじょう,3,建物の一番上の屋根の上</code>
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"屋上,おくじょう,3,建物の一番上の屋根の上\n安心,あんしん,3\n暗算,あんざん,3,頭の中だけで計算すること"}
          className="w-full rounded border px-3 py-2 font-mono text-sm"
        />
        <button
          type="submit"
          disabled={isPending || text.trim().length === 0}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "登録中..." : "まとめて登録"}
        </button>
      </form>

      {summary && (
        <div className="mt-4 space-y-2 text-sm">
          <p className="font-semibold text-green-700">
            {summary.inserted}件 登録しました
          </p>
          {summary.errors.length > 0 && (
            <div className="rounded border border-red-200 bg-red-50 p-3">
              <p className="mb-1 font-semibold text-red-700">
                {summary.errors.length}件 エラーがありました（該当行は登録されていません）
              </p>
              <ul className="space-y-1 text-red-700">
                {summary.errors.map((e, i) => (
                  <li key={i}>
                    {e.line > 0 && <>{e.line}行目: </>}
                    {e.text && <span className="font-mono">「{e.text}」</span>} {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
