"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/kanji", label: "漢字テスト" },
  { href: "/kanji/manage", label: "漢字管理" },
  { href: "/kanji/history", label: "漢字テスト結果" },
  { href: "/hyakumasu", label: "百マス計算" },
  { href: "/hyakumasu/calendar", label: "百マス計算カレンダー" },
];

export default function NavBar() {
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
      </div>
    </header>
  );
}
