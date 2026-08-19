"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { SECTION, isUnit } from "@/lib/sections";
import { isValidAmount, parseMoney } from "@/lib/money";
import { isValidQty, parseQty } from "@/lib/qty";
import { isUsableDate, parseISODate } from "@/lib/day";
import { done, fail, type FormState } from "@/server/form-state";

const PATH = SECTION.taminotchi.path;

export async function createPurchaseAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const partyId = String(formData.get("partyId") ?? "");
  if (!partyId) return fail({ form: "Xom-ashyochi topilmadi." });

  const materialId = String(formData.get("materialId") ?? "");
  const newName = String(formData.get("materialNewName") ?? "").trim();
  const newUnit = String(formData.get("materialNewUnit") ?? "");
  if (!materialId && !newName) return fail({ material: "Xom ashyoni tanlang" });
  if (!materialId && !isUnit(newUnit)) {
    return fail({ material: "O'lchov birligini tanlang" });
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
    where: { id: partyId, companyId: session.companyId, kind: "taminotchi" },
    select: { id: true },
  });
  if (!party) return fail({ form: "Xom-ashyochi topilmadi." });

  const total = new Prisma.Decimal(qty)
    .times(new Prisma.Decimal(unitPrice))
    .toDecimalPlaces(2);

  await db.$transaction(async (tx) => {
    let usedMaterialId = materialId;

    if (usedMaterialId) {
      const material = await tx.material.findFirst({
        where: { id: usedMaterialId, companyId: session.companyId },
        select: { id: true },
      });
      if (!material) throw new Error("material-topilmadi");
    } else {
      const created = await tx.material.create({
        data: {
          companyId: session.companyId,
          name: newName,
          unit: isUnit(newUnit) ? newUnit : "dona",
        },
      });
      usedMaterialId = created.id;
    }

    await tx.purchase.create({
      data: {
        companyId: session.companyId,
        partyId: party.id,
        materialId: usedMaterialId,
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
  revalidatePath("/");
  return done();
}
