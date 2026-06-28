"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "study_app_session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;
  const redirectTo = String(formData.get("from") ?? "/");

  if (!expected || password !== expected) {
    redirect(`/login?error=1&from=${encodeURIComponent(redirectTo)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect(redirectTo || "/");
}
