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
