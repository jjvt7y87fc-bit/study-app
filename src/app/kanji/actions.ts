"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { Grade, KanjiMistake, ReviewStage } from "@/lib/types";

function parseReadings(raw: string): string[] {
  return raw
    .split(/[、,\s]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

export async function createKanji(formData: FormData) {
  const character = String(formData.get("character") ?? "").trim();
  const readings = parseReadings(String(formData.get("readings") ?? ""));
  const grade = Number(formData.get("grade")) as Grade;
  const meaning = String(formData.get("meaning") ?? "").trim();

  if (!character || readings.length === 0 || !grade) {
    throw new Error("漢字・読み方・学年はすべて必須です。");
  }

  const { error } = await supabase
    .from("kanji")
    .insert({ character, readings, grade, meaning: meaning || null });

  if (error) throw new Error(error.message);

  revalidatePath("/kanji/manage");
}

export async function updateKanji(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const character = String(formData.get("character") ?? "").trim();
  const readings = parseReadings(String(formData.get("readings") ?? ""));
  const grade = Number(formData.get("grade")) as Grade;
  const meaning = String(formData.get("meaning") ?? "").trim();

  if (!id || !character || readings.length === 0 || !grade) {
    throw new Error("漢字・読み方・学年はすべて必須です。");
  }

  const { error } = await supabase
    .from("kanji")
    .update({
      character,
      readings,
      grade,
      meaning: meaning || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/kanji/manage");
}

export type BulkImportError = { line: number; text: string; reason: string };
export type BulkImportSummary = {
  inserted: number;
  errors: BulkImportError[];
};

export async function bulkCreateKanji(formData: FormData): Promise<BulkImportSummary> {
  const raw = String(formData.get("bulkText") ?? "");
  const lines = raw.split(/\r?\n/);

  const rows: { character: string; readings: string[]; grade: Grade; meaning: string | null }[] = [];
  const errors: BulkImportError[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parts = trimmed.split(",");
    if (parts.length < 3) {
      errors.push({ line: i + 1, text: trimmed, reason: "カンマ区切りが3項目（単語,読み方,学年）になっていません" });
      return;
    }

    const character = parts[0].trim();
    const readings = parseReadings(parts[1]);
    const grade = Number(parts[2].trim()) as Grade;
    const meaning = parts.length > 3 ? parts.slice(3).join(",").trim() : "";

    if (!character) {
      errors.push({ line: i + 1, text: trimmed, reason: "単語が空です" });
      return;
    }
    if (readings.length === 0) {
      errors.push({ line: i + 1, text: trimmed, reason: "読み方が空です" });
      return;
    }
    if (!Number.isInteger(grade) || grade < 1 || grade > 6) {
      errors.push({ line: i + 1, text: trimmed, reason: "学年は1〜6の数字で指定してください" });
      return;
    }

    rows.push({ character, readings, grade, meaning: meaning || null });
  });

  if (rows.length > 0) {
    const { error } = await supabase.from("kanji").insert(rows);
    if (error) {
      errors.push({ line: 0, text: "", reason: `登録時にエラーが発生しました: ${error.message}` });
      revalidatePath("/kanji/manage");
      return { inserted: 0, errors };
    }
  }

  revalidatePath("/kanji/manage");
  return { inserted: rows.length, errors };
}

export async function deleteKanji(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("idが必要です。");

  const { error } = await supabase.from("kanji").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/kanji/manage");
}

export async function saveKanjiQuizResult(params: {
  grades: Grade[];
  totalCount: number;
  correctCount: number;
  mistakes: KanjiMistake[];
}) {
  const { error } = await supabase.from("kanji_quiz_results").insert({
    grades: params.grades,
    total_count: params.totalCount,
    correct_count: params.correctCount,
    mistakes: params.mistakes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/kanji/history");
}

export type ReviewOutcome = {
  kanjiId: string;
  correct: boolean;
  reviewId?: string;
  stage?: ReviewStage;
};

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function applyKanjiReviewUpdates(outcomes: ReviewOutcome[]) {
  for (const outcome of outcomes) {
    if (!outcome.correct) {
      // 不正解：いつのstageだったかに関わらず、翌日に再出題するstage0に戻す（新規なら作成）
      const { error } = await supabase
        .from("kanji_reviews")
        .upsert(
          { kanji_id: outcome.kanjiId, stage: 0, due_date: addDaysIso(1), updated_at: new Date().toISOString() },
          { onConflict: "kanji_id" }
        );
      if (error) throw new Error(error.message);
      continue;
    }

    if (!outcome.reviewId) {
      // 正解 & もともと再出題待ちではなかった単語 → 何もしない
      continue;
    }

    if (outcome.stage === 0) {
      const { error } = await supabase
        .from("kanji_reviews")
        .update({ stage: 1, due_date: addDaysIso(3), updated_at: new Date().toISOString() })
        .eq("id", outcome.reviewId);
      if (error) throw new Error(error.message);
    } else if (outcome.stage === 1) {
      const { error } = await supabase
        .from("kanji_reviews")
        .update({ stage: 2, due_date: addDaysIso(14), updated_at: new Date().toISOString() })
        .eq("id", outcome.reviewId);
      if (error) throw new Error(error.message);
    } else {
      // stage2で正解 → 習得済みとして削除
      const { error } = await supabase.from("kanji_reviews").delete().eq("id", outcome.reviewId);
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath("/kanji");
}
