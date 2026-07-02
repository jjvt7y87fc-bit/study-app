import "server-only";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export const PROFILE_COOKIE = "active_profile_id";

export async function getActiveProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PROFILE_COOKIE)?.value ?? null;
}

export async function getActiveProfile(): Promise<Profile | null> {
  const id = await getActiveProfileId();
  if (!id) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}
