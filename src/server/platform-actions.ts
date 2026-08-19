"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  endPlatformSession,
  requirePlatform,
  startPlatformSession,
} from "@/lib/platform-session";
import { fail, type FormState } from "@/server/form-state";

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 5;

/** Platforma kirishi ham cheklangan — parol tanlab ko'rilmasin */
async function tooManyAttempts(login: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const failures = await db.loginAttempt.count({
    where: { phone: `platform:${login}`, ok: false, at: { gte: since } },
  });
  return failures >= MAX_FAILURES;
}

export async function platformLoginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!login) return fail({ login: "Login kiriting" });
  if (!password) return fail({ password: "Parol kiriting" });

  if (await tooManyAttempts(login)) {
    return fail({
      form: `Ko'p marta xato kiritildi. ${WINDOW_MINUTES} daqiqadan keyin urining.`,
    });
  }

  const admin = await db.platformAdmin.findUnique({ where: { login } });
  const ok = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  await db.loginAttempt.create({ data: { phone: `platform:${login}`, ok } });

  if (!admin || !ok) return fail({ form: "Login yoki parol noto'g'ri." });

  await db.loginAttempt.deleteMany({
    where: { phone: `platform:${login}`, ok: false },
  });
  await startPlatformSession({ adminId: admin.id, login: admin.login });

  redirect("/platform");
}

export async function platformLogoutAction(): Promise<void> {
  await endPlatformSession();
  redirect("/platform/login");
}

export async function blockCompanyAction(formData: FormData): Promise<void> {
  await requirePlatform();

  const companyId = String(formData.get("companyId") ?? "");
  const on = String(formData.get("on") ?? "") === "1";
  if (!companyId) return;

  await db.company.update({
    where: { id: companyId },
    data: { blockedAt: on ? new Date() : null },
  });

  revalidatePath("/platform");
}

/** To'lov qabul qilindi — muddat oyma-oy uzaytiriladi */
export async function extendPaymentAction(formData: FormData): Promise<void> {
  await requirePlatform();

  const companyId = String(formData.get("companyId") ?? "");
  const months = Number(String(formData.get("months") ?? "1"));
  if (!companyId || !Number.isInteger(months) || months < 1 || months > 24) {
    return;
  }

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { paidUntil: true, trialEndsAt: true },
  });
  if (!company) return;

  const now = new Date();
  // Muddat tugamagan bo'lsa ustiga qo'shamiz, tugagan bo'lsa bugundan boshlaymiz
  const base =
    company.paidUntil && company.paidUntil > now ? company.paidUntil : now;

  const until = new Date(base);
  until.setMonth(until.getMonth() + months);

  await db.company.update({
    where: { id: companyId },
    data: { paidUntil: until },
  });

  revalidatePath("/platform");
}

export async function clearPaymentAction(formData: FormData): Promise<void> {
  await requirePlatform();

  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId) return;

  await db.company.update({
    where: { id: companyId },
    data: { paidUntil: null },
  });

  revalidatePath("/platform");
}


export type ResetPinState = { pin?: string; error?: string; at?: number };

/**
 * Egasi kodini unutgan bo'lsa — yangi kod beriladi va bir marta ekranda
 * ko'rsatiladi. Eski kodni hech kim, biz ham, ko'ra olmaymiz: u hashlangan.
 */
export async function resetOwnerPinAction(
  _prev: ResetPinState,
  formData: FormData,
): Promise<ResetPinState> {
  await requirePlatform();

  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId) return { error: "Korxona topilmadi.", at: Date.now() };

  const owner = await db.user.findFirst({
    where: { companyId, role: "owner" },
    orderBy: { createdAt: "asc" },
    select: { id: true, phone: true },
  });
  if (!owner) return { error: "Bu korxonada rahbar yo'q.", at: Date.now() };

  // 4 xonali tasodifiy kod
  const pin = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, "0");

  await db.user.update({
    where: { id: owner.id },
    data: { pinHash: await bcrypt.hash(pin, 12) },
  });

  // Eski bloklanish hisobini ham tozalaymiz, egasi darrov kira olsin
  await db.loginAttempt.deleteMany({ where: { phone: owner.phone, ok: false } });

  revalidatePath("/platform");
  return { pin, at: Date.now() };
}

/**
 * Korxonani butunlay o'chirish. Ichidagi hamma narsa — foydalanuvchilar,
 * mijozlar, yozuvlar — birga ketadi va qaytarib bo'lmaydi.
 * Shuning uchun nomini qo'lda yozib tasdiqlash so'raladi.
 */
export async function deleteCompanyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePlatform();

  const companyId = String(formData.get("companyId") ?? "");
  const typed = String(formData.get("confirmName") ?? "").trim();
  if (!companyId) return fail({ form: "Korxona topilmadi." });

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });
  if (!company) return fail({ form: "Korxona topilmadi." });

  if (typed.toLowerCase() !== company.name.trim().toLowerCase()) {
    return fail({ confirmName: "Nom to'g'ri kelmadi" });
  }

  await db.company.delete({ where: { id: companyId } });

  revalidatePath("/platform");
  return { ok: true, at: Date.now() };
}
