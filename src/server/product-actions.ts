"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireActiveSession } from "@/lib/session";
import { PRODUCT_SECTION, PRODUCT_UNIT } from "@/lib/sections";
import { parseMoney } from "@/lib/money";
import { isValidQty, parseQty } from "@/lib/qty";
import { isUsableDate, parseISODate } from "@/lib/day";
import { done, fail, type FormState } from "@/server/form-state";

export async function createProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSession();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return fail({ name: "Model nomini kiriting" });
  if (name.length > 60) return fail({ name: "Nomi juda uzun" });

  const description =
    String(formData.get("description") ?? "").trim().slice(0, 200) || null;


  const priceRaw = parseMoney(String(formData.get("price") ?? ""));
  if (priceRaw && !/^\d{1,15}$/.test(priceRaw)) {
    return fail({ price: "Narx noto'g'ri" });
  }

  await db.product.create({
    data: {
      companyId: session.companyId,
      name,
      description,
      unit: PRODUCT_UNIT,
      price: priceRaw ? new Prisma.Decimal(priceRaw) : null,
    },
  });

  revalidatePath(PRODUCT_SECTION.path);
  return done();
}

export async function createProductionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSession();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return fail({ form: "Mahsulot topilmadi." });

  const qty = parseQty(String(formData.get("qty") ?? ""));
  if (!qty) return fail({ qty: "Miqdorni kiriting" });
  if (!isValidQty(qty)) return fail({ qty: "Miqdor noto'g'ri" });

  const dateRaw = String(formData.get("date") ?? "");
  if (!isUsableDate(dateRaw)) return fail({ date: "Sana noto'g'ri" });
  const date = parseISODate(dateRaw);
  if (!date) return fail({ date: "Sana noto'g'ri" });

  const workerRaw = String(formData.get("workerId") ?? "");
  let workerId: string | null = null;
  if (workerRaw) {
    const worker = await db.party.findFirst({
      where: { id: workerRaw, companyId: session.companyId, kind: "ishchi" },
      select: { id: true },
    });
    if (!worker) return fail({ worker: "Ishchi topilmadi" });
    workerId = worker.id;
  }

  const product = await db.product.findFirst({
    where: { id: productId, companyId: session.companyId, deletedAt: null },
    select: { id: true },
  });
  if (!product) return fail({ form: "Mahsulot topilmadi." });

  await db.production.create({
    data: {
      companyId: session.companyId,
      productId: product.id,
      qty: new Prisma.Decimal(qty),
      workerId,
      date,
      createdBy: session.userId,
    },
  });

  revalidatePath(`${PRODUCT_SECTION.path}/${product.id}`);
  revalidatePath(PRODUCT_SECTION.path);
  return done();
}

/**
 * Modelni ro'yxatdan olib tashlash. Ishlab chiqarish va sotuv yozuvlari
 * o'z joyida qoladi — mijoz kartochkasidagi tarix buzilmaydi.
 */
export async function deleteProductAction(formData: FormData): Promise<void> {
  const session = await requireActiveSession();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const product = await db.product.findFirst({
    where: { id: productId, companyId: session.companyId, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!product) return;

  await db.product.update({
    where: { id: product.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(PRODUCT_SECTION.path);
  revalidatePath(`${PRODUCT_SECTION.path}/papka/${encodeURIComponent(product.name)}`);
  revalidatePath("/");
  redirect(PRODUCT_SECTION.path);
}
