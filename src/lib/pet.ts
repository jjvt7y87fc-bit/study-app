export type PetStage = {
  level: number;
  name: string;
  minPoints: number;
};

export const PET_NAME = "ココ";

export const PET_STAGES: PetStage[] = [
  { level: 1, name: "うまれたての子犬", minPoints: 0 },
  { level: 2, name: "よちよち子犬", minPoints: 300 },
  { level: 3, name: "元気な子犬", minPoints: 800 },
  { level: 4, name: "やんちゃな若犬", minPoints: 2000 },
  { level: 5, name: "頼れる大人の犬", minPoints: 5000 },
  { level: 6, name: "伝説の犬", minPoints: 10000 },
];

export function getPetStage(totalPoints: number): PetStage {
  let current = PET_STAGES[0];
  for (const stage of PET_STAGES) {
    if (totalPoints >= stage.minPoints) current = stage;
  }
  return current;
}

export function getNextStage(totalPoints: number): PetStage | null {
  const current = getPetStage(totalPoints);
  const idx = PET_STAGES.findIndex((s) => s.level === current.level);
  return PET_STAGES[idx + 1] ?? null;
}

export function getProgressToNext(totalPoints: number): {
  current: PetStage;
  next: PetStage | null;
  progressRatio: number;
} {
  const current = getPetStage(totalPoints);
  const next = getNextStage(totalPoints);
  if (!next) return { current, next: null, progressRatio: 1 };
  const ratio = (totalPoints - current.minPoints) / (next.minPoints - current.minPoints);
  return { current, next, progressRatio: Math.min(1, Math.max(0, ratio)) };
}

export function calcHyakumasuPoints(correctCount: number, timeSeconds: number): number {
  const timeBonus = Math.max(0, 100 - Math.floor(timeSeconds));
  return correctCount + timeBonus;
}
