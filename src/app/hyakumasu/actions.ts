"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { checkDeletePassword } from "@/lib/deletePassword";
import type { Operation } from "@/lib/types";

export async function saveHyakumasuResult(params: {
  operation: Operation;
  timeSeconds: number;
  correctCount: number;
}): Promise<{ previousResult: { time_seconds: number; correct_count: number } | null }> {
  const { data: prevData } = await supabase
    .from("hyakumasu_results")
    .select("time_seconds, correct_count")
    .eq("operation", params.operation)
    .order("taken_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("hyakumasu_results").insert({
    operation: params.operation,
    time_seconds: params.timeSeconds,
    correct_count: params.correctCount,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/calendar");
  return { previousResult: prevData ?? null };
}

export async function deleteHyakumasuResult(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");

  const passwordError = checkDeletePassword(password);
  if (passwordError) return { success: false, error: passwordError };

  const { error } = await supabase.from("hyakumasu_results").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/calendar");
  return { success: true };
}
