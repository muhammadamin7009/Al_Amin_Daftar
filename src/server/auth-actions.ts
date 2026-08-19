"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { startSession, endSession } from "@/lib/session";
import { PIN_COST, verifyLogin } from "@/lib/auth-check";
import { WINDOW_MINUTES, lockMessage } from "@/lib/login-guard";

export type AuthState = { error?: string };

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phone = String(formData.get("phone") ?? "");
  const pin = String(formData.get("pin") ?? "");

  if (!normalizePhone(phone)) return { error: "Telefon raqam to'liq emas." };
  if (!/^\d{4}$/.test(pin)) return { error: "Maxfiy raqam 4 xonali bo'lsin." };

  const result = await verifyLogin(phone, pin);

  if (!result.ok) {
    if (result.reason === "locked") {
      return { error: lockMessage(result.minutesLeft) };
    }
    return {
      error:
        result.triesLeft > 0
          ? `Telefon yoki maxfiy raqam noto'g'ri. Yana ${result.triesLeft} marta urinib ko'rasiz.`
          : lockMessage(WINDOW_MINUTES),
    };
  }

  await startSession({
    userId: result.user.id,
    companyId: result.user.companyId,
    name: result.user.name,
    role: result.user.role,
  });

  redirect("/");
}

/**
 * Telefon raqam allaqachon ro'yxatdanmi — maxfiy raqam so'ralishidan oldin
 * tekshiriladi. Foydalanuvchi ikki marta PIN terib bo'lgach xato eshitmasin.
 */
export async function isPhoneTakenAction(phoneRaw: string): Promise<boolean> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return false;

  const exists = await db.user.findUnique({
    where: { phone },
    select: { id: true },
  });
  return !!exists;
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const pin = String(formData.get("pin") ?? "");

  if (companyName.length < 2) return { error: "Korxona nomini yozing." };
  if (companyName.length > 60) return { error: "Korxona nomi juda uzun." };
  if (!phone) return { error: "Telefon raqam to'liq emas." };
  if (!/^\d{4}$/.test(pin)) return { error: "Maxfiy raqam 4 xonali bo'lsin." };

  const exists = await db.user.findUnique({
    where: { phone },
    select: { id: true },
  });
  if (exists) {
    return { error: "Bu telefon raqam ro'yxatdan o'tgan. Kirish tugmasini bosing." };
  }

  const pinHash = await bcrypt.hash(pin, PIN_COST);

  const user = await db.$transaction(async (tx) => {
    const company = await tx.company.create({ data: { name: companyName } });
    return tx.user.create({
      data: {
        companyId: company.id,
        name: "Rahbar",
        phone,
        pinHash,
        role: "owner",
      },
    });
  });

  await startSession({
    userId: user.id,
    companyId: user.companyId,
    name: user.name,
    role: user.role,
  });

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}
