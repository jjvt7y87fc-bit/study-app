import Link from "next/link";
import { getAllProfiles, getActiveProfileId } from "@/lib/profile";
import { selectProfile } from "@/app/profiles/actions";

export const dynamic = "force-dynamic";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const [profiles, activeId] = await Promise.all([getAllProfiles(), getActiveProfileId()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">だれがやる？</h1>

      {profiles.length === 0 ? (
        <p className="rounded-lg border bg-yellow-50 p-4 text-yellow-800">
          まだユーザーが登録されていません。
          <Link href="/settings" className="ml-1 font-semibold underline">
            設定画面
          </Link>
          から追加してください。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {profiles.map((p) => (
            <form key={p.id} action={selectProfile}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="from" value={from ?? "/"} />
              <button
                type="submit"
                className={`flex w-full flex-col items-center gap-2 rounded-xl border bg-white p-6 shadow-sm transition hover:bg-blue-50 ${
                  activeId === p.id ? "ring-2 ring-blue-600" : ""
                }`}
              >
                <span className="text-5xl">{p.emoji}</span>
                <span className="font-bold text-gray-800">{p.name}</span>
              </button>
            </form>
          ))}
        </div>
      )}

      <Link href="/settings" className="inline-block text-sm font-semibold text-blue-600 underline">
        ユーザーを追加・編集する
      </Link>
    </div>
  );
}
