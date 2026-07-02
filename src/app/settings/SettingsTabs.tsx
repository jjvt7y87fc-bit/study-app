"use client";

import { useState } from "react";

export default function SettingsTabs({
  kanjiPanel,
  userPanel,
}: {
  kanjiPanel: React.ReactNode;
  userPanel: React.ReactNode;
}) {
  const [tab, setTab] = useState<"kanji" | "users">("kanji");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">設定</h1>
      <div className="flex gap-1 border-b">
        <button
          type="button"
          onClick={() => setTab("kanji")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold ${
            tab === "kanji"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
        >
          単語管理
        </button>
        <button
          type="button"
          onClick={() => setTab("users")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold ${
            tab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
        >
          ユーザー管理
        </button>
      </div>
      <div className={tab === "kanji" ? "block" : "hidden"}>{kanjiPanel}</div>
      <div className={tab === "users" ? "block" : "hidden"}>{userPanel}</div>
    </div>
  );
}
