"use client";

import { getPetStage, PET_NAME } from "@/lib/pet";
import CocoMascot from "@/components/CocoMascot";

export default function PetMascotBar({ totalPoints }: { totalPoints: number }) {
  const stage = getPetStage(totalPoints);

  return (
    <div className="relative h-14 w-full overflow-hidden border-b bg-gradient-to-r from-amber-50 to-orange-50">
      <style>{`
        @keyframes pet-mascot-walk {
          0%   { left: 0%; transform: translateY(-50%) scaleX(1); }
          45%  { left: calc(100% - 56px); transform: translateY(-50%) scaleX(1); }
          50%  { left: calc(100% - 56px); transform: translateY(-50%) scaleX(-1); }
          95%  { left: 0%; transform: translateY(-50%) scaleX(-1); }
          100% { left: 0%; transform: translateY(-50%) scaleX(1); }
        }
      `}</style>
      <div
        className="absolute top-1/2"
        style={{ animation: "pet-mascot-walk 16s linear infinite" }}
        title={`${PET_NAME}（Lv.${stage.level} ${stage.name}）`}
      >
        <CocoMascot size={52} walking />
      </div>
    </div>
  );
}
