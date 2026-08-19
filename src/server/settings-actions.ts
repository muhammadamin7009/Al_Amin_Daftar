"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireActiveSession } from "@/lib/session";
import { normalizePhone } from "@/lib/phone";
import { PIN_COST } from "@/lib/auth-check";
import { done, fail, type FormState } from "@/server/form-state";

export async function renameCompanyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSession();
  if (session.role !== "owner") {
    return fail({ form: "Buni faqat rahbar o'zgartira oladi." });
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return fail({ name: "Korxona nomini kiriting" });
  if (name.length > 60) return fail({ name: "Nomi juda uzun" });

  await db.company.update({
    where: { id: session.companyId },
    data: { name },
  });

  revalidatePath("/sozlamalar");
  revalidatePath("/");
  return done();
}

export async function addUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSession();
  if (session.role !== "owner") {
    return fail({ form: "Xodim qo'shishni faqat rahbar qila oladi." });
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return fail({ name: "Ismini kiriting" });
  if (name.length > 60) return fail({ name: "Ismi juda uzun" });

  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return fail({ phone: "Raqam to'liq emas" });

  const pin = String(formData.get("pin") ?? "");
  if (!/^\d{4}$/.test(pin)) return fail({ pin: "4 xonali raqam kiriting" });

  const exists = await db.user.findUnique({
    where: { phone },
    select: { id: true },
  });
  if (exists) return fail({ phone: "Bu raqam allaqachon ro'yxatda" });

  await db.user.create({
    data: {
      companyId: session.companyId,
      name,
      phone,
      pinHash: await bcrypt.hash(pin, PIN_COST),
      role: "xodim",
    },
  });

  revalidatePath("/sozlamalar");
  return done();
}

export async function removeUserAction(formData: FormData): Promise<void> {
  const session = await requireActiveSession();
  if (session.role !== "owner") return;

  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === session.userId) return;

  await db.user.deleteMany({
    where: { id: userId, companyId: session.companyId, role: "xodim" },
  });

  revalidatePath("/sozlamalar");
}

/**
 * O'z maxfiy raqamini almashtirish. Kimdir kodni bilib qolsa,
 * egasi hech kimdan so'ramasdan o'zi almashtira olsin.
 */
export async function changePinAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSession();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!/^\d{4}$/.test(current)) return fail({ current: "Hozirgi kodni kiriting" });
  if (!/^\d{4}$/.test(next)) return fail({ next: "Yangi kod 4 xonali bo'lsin" });
  if (current === next) return fail({ next: "Yangi kod eskisidan farq qilsin" });

  const user = await db.user.findFirst({
    where: { id: session.userId, companyId: session.companyId },
    select: { id: true, phone: true, pinHash: true },
  });
  if (!user) return fail({ form: "Foydalanuvchi topilmadi." });

  const ok = await bcrypt.compare(current, user.pinHash);
  if (!ok) return fail({ current: "Hozirgi kod noto'g'ri" });

  await db.user.update({
    where: { id: user.id },
    data: { pinHash: await bcrypt.hash(next, PIN_COST) },
  });
  await db.loginAttempt.deleteMany({ where: { phone: user.phone, ok: false } });

  revalidatePath("/sozlamalar");
  return done();
}
