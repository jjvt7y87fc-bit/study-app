import { login } from "@/app/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h1 className="text-center text-xl font-bold text-gray-800">学習アプリ</h1>
        <p className="text-center text-sm text-gray-500">パスワードを入力してください</p>
        <input type="hidden" name="from" value={from ?? "/"} />
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded border px-3 py-2 text-center text-lg"
        />
        {error && (
          <p className="text-center text-sm text-red-600">パスワードが正しくありません</p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          入る
        </button>
      </form>
    </div>
  );
}
