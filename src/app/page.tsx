import Link from "next/link";
import PetStatus from "@/components/PetStatus";
import { getTotalPoints } from "@/lib/petData";

export const dynamic = "force-dynamic";

const cards = [
  {
    href: "/kanji",
    title: "漢字テスト",
    description: "学年を選んでひらがな読みクイズに挑戦しよう",
    color: "bg-blue-600",
  },
  {
    href: "/hyakumasu",
    title: "百マス計算",
    description: "足し算・引き算・かけ算のスピード計算に挑戦しよう",
    color: "bg-green-600",
  },
];

export default async function HomePage() {
  const totalPoints = await getTotalPoints();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">学習アプリ</h1>
      <PetStatus totalPoints={totalPoints} />
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.color} rounded-xl p-6 text-white shadow transition hover:opacity-90`}
          >
            <h2 className="text-xl font-bold">{card.title}</h2>
            <p className="mt-2 text-sm opacity-90">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
