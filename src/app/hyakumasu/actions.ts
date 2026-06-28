"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { Operation } from "@/lib/types";

export async function saveHyakumasuResult(params: {
  operation: Operation;
  timeSeconds: number;
  correctCount: number;
}) {
  const { error } = await supabase.from("hyakumasu_results").insert({
    operation: params.operation,
    time_seconds: params.timeSeconds,
    correct_count: params.correctCount,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/hyakumasu/calendar");
}
