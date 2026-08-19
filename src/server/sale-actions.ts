"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { PRODUCT_SECTION, SECTION, isUnit } from "@/lib/sections";
import { isValidAmount, parseMoney } from "@/lib/money";
import { isValidQty, parseQty } from "@/lib/qty";
import { isUsableDate, parseISODate } from "@/lib/day";
import { done, fail, type FormState } from "@/server/form-state";

const PATH = SECTION.mijoz.path;

export async function createSaleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const partyId = String(formData.get("partyId") ?? "");
  if (!partyId) return fail({ form: "Mijoz topilmadi." });

  const productId = String(formData.get("productId") ?? "");
  const newName = String(formData.get("productNewName") ?? "").trim();
  const newUnit = String(formData.get("productNewUnit") ?? "");
  if (!productId && !newName) return fail({ product: "Mahsulotni tanlang" });
  if (!productId && !isUnit(newUnit)) {
    return fail({ product: "O'lchov birligini tanlang" });
  }

  const qty = parseQty(String(formData.get("qty") ?? ""));
  if (!qty) return fail({ qty: "Miqdorni kiriting" });
  if (!isValidQty(qty)) return fail({ qty: "Miqdor noto'g'ri" });

  const unitPrice = parseMoney(String(formData.get("unitPrice") ?? ""));
  if (!unitPrice) return fail({ unitPrice: "Narxni kiriting" });
  if (!isValidAmount(unitPrice)) return fail({ unitPrice: "Narx noto'g'ri" });

  const dateRaw = String(formData.get("date") ?? "");
  if (!isUsableDate(dateRaw)) return fail({ date: "Sana noto'g'ri" });
  const date = parseISODate(dateRaw);
  if (!date) return fail({ date: "Sana noto'g'ri" });

  const note = String(formData.get("note") ?? "").trim().slice(0, 100) || null;

  const party = await db.party.findFirst({
    where: { id: partyId, companyId: session.companyId, kind: "mijoz" },
    select: { id: true },
  });
  if (!party) return fail({ form: "Mijoz topilmadi." });

  const total = new Prisma.Decimal(qty)
    .times(new Prisma.Decimal(unitPrice))
    .toDecimalPlaces(2);

  await db.$transaction(async (tx) => {
    let usedProductId = productId;

    if (usedProductId) {
      const product = await tx.product.findFirst({
        where: { id: usedProductId, companyId: session.companyId },
        select: { id: true },
      });
      if (!product) throw new Error("mahsulot-topilmadi");
    } else {
      const created = await tx.product.create({
        data: {
          companyId: session.companyId,
          name: newName,
          unit: isUnit(newUnit) ? newUnit : "dona",
        },
      });
      usedProductId = created.id;
    }

    await tx.sale.create({
      data: {
        companyId: session.companyId,
        partyId: party.id,
        productId: usedProductId,
        qty: new Prisma.Decimal(qty),
        unitPrice: new Prisma.Decimal(unitPrice),
        total,
        date,
        note,
        createdBy: session.userId,
      },
    });
  });

  revalidatePath(`${PATH}/${party.id}`);
  revalidatePath(PATH);
  revalidatePath(PRODUCT_SECTION.path);
  revalidatePath("/");
  return done();
}
