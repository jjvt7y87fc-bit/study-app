import Link from "next/link";
import OperationSelect from "@/app/hyakumasu/OperationSelect";

export default function HyakumasuTopPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">百マス計算</h1>
        <Link
          href="/hyakumasu/calendar"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          カレンダーで履歴を見る →
        </Link>
      </div>
      <OperationSelect />
    </div>
  );
}
