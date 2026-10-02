"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/access";
import { findCode } from "@/lib/demo-data";

export type EnterCodeState = { error: string | null };

export async function enterCode(
  _prev: EnterCodeState,
  formData: FormData,
): Promise<EnterCodeState> {
  const input = String(formData.get("code") ?? "");
  const code = findCode(input);
  if (!code) {
    return { error: "Ce code n'est pas reconnu. Vérifiez-le auprès de l'école." };
  }
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, code.code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
  });
  redirect("/catalogue");
}

export async function leave() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  redirect("/");
}
