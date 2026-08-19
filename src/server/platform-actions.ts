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

