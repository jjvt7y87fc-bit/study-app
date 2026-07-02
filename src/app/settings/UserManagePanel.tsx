import Link from "next/link";
import { createProfile, deleteProfile } from "@/app/profiles/actions";
import DeleteRecordButton from "@/components/DeleteRecordButton";
import AvatarPicker from "@/components/AvatarPicker";
import type { Profile } from "@/lib/types";

export default function UserManagePanel({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="space-y-8">
      <Link href="/profiles" className="inline-block text-sm font-semibold text-blue-600 underline">
        ← ユーザー選択画面に戻る
      </Link>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-700">新しいユーザーを追加</h2>
        <form action={createProfile} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">名前</label>
            <input
              name="name"
              required
              maxLength={20}
              placeholder="例: たろう"
              className="w-40 rounded border px-3 py-2"
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">アイコン（パーツごとに選べます）</p>
            <AvatarPicker />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            追加
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">登録済みのユーザー（{profiles.length}人）</h2>
        {profiles.length === 0 ? (
          <p className="text-gray-500">まだユーザーが登録されていません。上のフォームから追加してください。</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="font-bold text-gray-800">{p.name}</span>
                </div>
                <DeleteRecordButton id={p.id} action={deleteProfile} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
