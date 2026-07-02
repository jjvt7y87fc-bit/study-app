"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { checkDeletePassword } from "@/lib/deletePassword";
import { calcHyakumasuPoints } from "@/lib/pet";
import { getTotalPoints } from "@/lib/petData";
import { getActiveProfile } from "@/lib/profile";
import type { Operation } from "@/lib/types";

export async function saveHyakumasuResult(params: {
  operation: Operation;
  timeSeconds: number;
  correctCount: number;
}): Promise<{
  previousResult: { time_seconds: number; correct_count: number } | null;
  earnedPoints: number;
  totalPoints: number;
}> {
  const activeProfile = await getActiveProfile();
  const profileId = activeProfile?.id ?? null;

  let prevQuery = supabase
    .from("hyakumasu_results")
    .select("time_seconds, correct_count")
    .eq("operation", params.operation)
    .order("taken_at", { ascending: false })
    .limit(1);
  if (profileId) prevQuery = prevQuery.eq("profile_id", profileId);
  const { data: prevData } = await prevQuery.maybeSingle();

  const earnedPoints = calcHyakumasuPoints(params.correctCount, params.timeSeconds);

  const { error } = await supabase.from("hyakumasu_results").insert({
    operation: params.operation,
    time_seconds: params.timeSeconds,
    correct_count: params.correctCount,
    points: earnedPoints,
    profile_id: profileId,
  });

  if (error) throw new Error(error.message);

  const totalPoints = await getTotalPoints();

  revalidatePath("/calendar");
  revalidatePath("/");
  return { previousResult: prevData ?? null, earnedPoints, totalPoints };
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
