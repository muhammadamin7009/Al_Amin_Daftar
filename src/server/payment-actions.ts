"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { SECTION } from "@/lib/sections";
import { isValidAmount, parseMoney } from "@/lib/money";
import { isUsableDate, parseISODate } from "@/lib/day";
import { done, fail, type FormState } from "@/server/form-state";

/**
 * Pul harakati. Yo'nalish odam turiga qarab belgilanadi:
 * mijozdan pul olinadi (kirim), qolganlariga beriladi (chiqim).
 */
export async function createPaymentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const partyId = String(formData.get("partyId") ?? "");
  if (!partyId) return fail({ form: "Odam topilmadi." });

  const amount = parseMoney(String(formData.get("amount") ?? ""));
  if (!amount) return fail({ amount: "Summani kiriting" });
  if (!isValidAmount(amount)) return fail({ amount: "Summa noto'g'ri" });

  const dateRaw = String(formData.get("date") ?? "");
  if (!isUsableDate(dateRaw)) return fail({ date: "Sana noto'g'ri" });
  const date = parseISODate(dateRaw);
  if (!date) return fail({ date: "Sana noto'g'ri" });

  const note = String(formData.get("note") ?? "").trim().slice(0, 100) || null;

  const party = await db.party.findFirst({
    where: { id: partyId, companyId: session.companyId },
    select: { id: true, kind: true },
  });
  if (!party) return fail({ form: "Odam topilmadi." });

  // Faqat ishchiga to'lovda: avans yoki oylik
  let kind: "avans" | "oylik" | null = null;
  if (party.kind === "ishchi") {
    const raw = String(formData.get("kind") ?? "");
    if (raw !== "avans" && raw !== "oylik") {
      return fail({ kind: "Turini tanlang" });
    }
    kind = raw;
  }

  await db.payment.create({
    data: {
      companyId: session.companyId,
      partyId: party.id,
      direction: party.kind === "mijoz" ? "kirim" : "chiqim",
      amount: new Prisma.Decimal(amount),
      kind,
      date,
      note,
      createdBy: session.userId,
    },
  });

  const path = SECTION[party.kind].path;
  revalidatePath(`${path}/${party.id}`);
  revalidatePath(path);
  revalidatePath("/");
  return done();
}
