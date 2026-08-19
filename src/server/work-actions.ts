"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { SECTION } from "@/lib/sections";
import { isValidAmount, parseMoney } from "@/lib/money";
import { isValidQty, parseQty } from "@/lib/qty";
import { isUsableDate, parseISODate } from "@/lib/day";
import { done, fail, type FormState } from "@/server/form-state";

const PATH = SECTION.ishchi.path;

/**
 * Ishbay ishchi: qanday ish, soni, bir dona narxi.
 * Oylik ishchi: summa va sana — ikkita maydon yetarli.
 */
export async function createWorkAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const partyId = String(formData.get("partyId") ?? "");
  if (!partyId) return fail({ form: "Ishchi topilmadi." });

  const dateRaw = String(formData.get("date") ?? "");
  if (!isUsableDate(dateRaw)) return fail({ date: "Sana noto'g'ri" });
  const date = parseISODate(dateRaw);
  if (!date) return fail({ date: "Sana noto'g'ri" });

  const worker = await db.party.findFirst({
    where: { id: partyId, companyId: session.companyId, kind: "ishchi" },
    select: { id: true, payType: true },
  });
  if (!worker) return fail({ form: "Ishchi topilmadi." });

  // Oylik ishchi: bitta summa
  if (worker.payType === "oylik") {
    const amount = parseMoney(String(formData.get("amount") ?? ""));
    if (!amount) return fail({ amount: "Summani kiriting" });
    if (!isValidAmount(amount)) return fail({ amount: "Summa noto'g'ri" });

    await db.workEntry.create({
      data: {
        companyId: session.companyId,
        partyId: worker.id,
        label: "Oylik",
        qty: new Prisma.Decimal(1),
        unitPrice: new Prisma.Decimal(amount),
        amount: new Prisma.Decimal(amount),
        date,
        createdBy: session.userId,
      },
    });

    revalidatePath(`${PATH}/${worker.id}`);
    revalidatePath(PATH);
    revalidatePath("/");
    return done();
  }

  // Ishbay ishchi: mahsulot yoki oddiy matn + soni + narxi
  const productId = String(formData.get("workId") ?? "");
  const label = String(formData.get("workLabel") ?? "").trim().slice(0, 60);
  if (!productId && !label) return fail({ work: "Qanday ish ekanini yozing" });

  const qty = parseQty(String(formData.get("qty") ?? ""));
  if (!qty) return fail({ qty: "Sonini kiriting" });
  if (!isValidQty(qty)) return fail({ qty: "Son noto'g'ri" });

  const unitPrice = parseMoney(String(formData.get("unitPrice") ?? ""));
  if (!unitPrice) return fail({ unitPrice: "Narxni kiriting" });
  if (!isValidAmount(unitPrice)) return fail({ unitPrice: "Narx noto'g'ri" });

  if (productId) {
    const product = await db.product.findFirst({
      where: { id: productId, companyId: session.companyId, deletedAt: null },
      select: { id: true },
    });
    if (!product) return fail({ work: "Mahsulot topilmadi" });
  }

  const amount = new Prisma.Decimal(qty)
    .times(new Prisma.Decimal(unitPrice))
    .toDecimalPlaces(2);

  await db.workEntry.create({
    data: {
      companyId: session.companyId,
      partyId: worker.id,
      productId: productId || null,
      label: productId ? null : label,
      qty: new Prisma.Decimal(qty),
      unitPrice: new Prisma.Decimal(unitPrice),
      amount,
      date,
      createdBy: session.userId,
    },
  });

  revalidatePath(`${PATH}/${worker.id}`);
  revalidatePath(PATH);
  revalidatePath("/");
  return done();
}
