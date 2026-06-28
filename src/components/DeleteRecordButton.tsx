"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DeleteAction = (formData: FormData) => Promise<{ success: boolean; error?: string }>;

export default function DeleteRecordButton({
  id,
  action,
}: {
  id: string;
  action: DeleteAction;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-red-600 underline"
      >
        削除
      </button>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("password", password);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.success) {
        setError(result.error ?? "削除に失敗しました");
        return;
      }
      setOpen(false);
      setPassword("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="削除用パスワード"
        autoFocus
        className="w-32 rounded border px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "削除中..." : "削除する"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setPassword("");
          setError(null);
        }}
        className="text-xs text-gray-500 underline"
      >
        やめる
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
