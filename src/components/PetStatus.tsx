import { PET_NAME, getProgressToNext } from "@/lib/pet";
import CocoMascot from "@/components/CocoMascot";

export default function PetStatus({
  totalPoints,
  leveledUp,
}: {
  totalPoints: number;
  leveledUp?: boolean;
}) {
  const { current, next, progressRatio } = getProgressToNext(totalPoints);

  return (
    <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      {leveledUp && (
        <p className="mb-2 text-center text-sm font-bold text-orange-600">
          🎉 レベルアップ！ {PET_NAME}が成長したよ！
        </p>
      )}
      <div className="flex items-center gap-4">
        <CocoMascot size={64} walking />
        <div className="flex-1">
          <p className="font-bold text-gray-800">
            {PET_NAME}（Lv.{current.level} {current.name}）
          </p>
          <p className="text-xs text-gray-500">累計 {totalPoints.toLocaleString()} pt</p>
          {next ? (
            <div className="mt-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all"
                  style={{ width: `${Math.round(progressRatio * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                次のレベルまであと {(next.minPoints - totalPoints).toLocaleString()} pt
              </p>
            </div>
          ) : (
            <p className="mt-1 text-xs font-semibold text-orange-600">最大レベルに到達！</p>
          )}
        </div>
      </div>
    </div>
  );
}
