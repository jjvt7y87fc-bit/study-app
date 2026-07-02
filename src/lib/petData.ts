import "server-only";
import { supabase } from "@/lib/supabase";

export async function getTotalPoints(): Promise<number> {
  const [{ data: kanjiRows, error: kErr }, { data: hyakumasuRows, error: hErr }] =
    await Promise.all([
      supabase.from("kanji_quiz_results").select("points"),
      supabase.from("hyakumasu_results").select("points"),
    ]);

  if (kErr) throw new Error(kErr.message);
  if (hErr) throw new Error(hErr.message);

  const kanjiTotal = (kanjiRows ?? []).reduce((sum, r) => sum + (r.points ?? 0), 0);
  const hyakumasuTotal = (hyakumasuRows ?? []).reduce((sum, r) => sum + (r.points ?? 0), 0);

  return kanjiTotal + hyakumasuTotal;
}
