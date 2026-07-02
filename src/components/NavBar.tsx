"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/types";
import PetMascotBar from "@/components/PetMascotBar";

const links = [
  { href: "/settings", label: "設定" },
  { href: "/kanji/history", label: "漢字テスト結果" },
  { href: "/calendar", label: "学習カレンダー" },
];

export default function NavBar({
  activeProfile,
  totalPoints,
}: {
  activeProfile: Profile | null;
  totalPoints: number;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-4 text-lg font-bold text-blue-700">
          学習アプリ
        </Link>
        <nav className="flex flex-wrap gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              data-active={pathname === link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/profiles"
          className="ml-auto flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {activeProfile ? (
            <>
              <span className="text-lg">{activeProfile.emoji}</span>
              {activeProfile.name}
            </>
          ) : (
            "ユーザー選択"
          )}
        </Link>
      </div>
      <PetMascotBar totalPoints={totalPoints} />
    </header>
  );
}
