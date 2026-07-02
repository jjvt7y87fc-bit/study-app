"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { checkDeletePassword } from "@/lib/deletePassword";
import { PROFILE_COOKIE } from "@/lib/profile";

export async function createProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "🙂").trim();

  if (!name) {
    throw new Error("名前を入力してください。");
  }

  const { error } = await supabase.from("profiles").insert({ name, emoji: emoji || "🙂" });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/profiles");
}

export async function deleteProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");

  const passwordError = checkDeletePassword(password);
  if (passwordError) return { success: false, error: passwordError };

  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/profiles");
  return { success: true };
}

export async function selectProfile(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("from") ?? "/");

  if (!id) throw new Error("ユーザーが選択されていません。");

  const cookieStore = await cookies();
  cookieStore.set(PROFILE_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect(redirectTo || "/");
}
