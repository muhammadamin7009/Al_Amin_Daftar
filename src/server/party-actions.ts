"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { SECTION, isKind } from "@/lib/sections";
import { normalizePhone } from "@/lib/phone";
import { parseMoney } from "@/lib/money";
import { done, fail, type FormState } from "@/server/form-state";

export async function createPartyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const kind = String(formData.get("kind") ?? "");
  if (!isKind(kind)) return fail({ form: "Bo'lim topilmadi." });

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return fail({ name: "Nomini kiriting" });
  if (name.length > 60) return fail({ name: "Nomi juda uzun" });

  const phoneRaw = String(formData.get("phone") ?? "").trim();
  let phone: string | null = null;
  if (phoneRaw) {
    phone = normalizePhone(phoneRaw);
    if (!phone) return fail({ phone: "Raqam to'liq emas" });
  }

  const opening = parseMoney(String(formData.get("openingBalance") ?? ""));
  if (opening && !/^\d{1,15}$/.test(opening)) {
    return fail({ openingBalance: "Summa noto'g'ri" });
  }

  // Faqat ishchida: to'lov turi va narxi
  let payType: "ishbay" | "oylik" | null = null;
  let rate: Prisma.Decimal | null = null;

  if (kind === "ishchi") {
    const raw = String(formData.get("payType") ?? "");
    if (raw !== "ishbay" && raw !== "oylik") {
      return fail({ payType: "To'lov turini tanlang" });
    }
    payType = raw;

    const rateRaw = parseMoney(String(formData.get("rate") ?? ""));
    if (rateRaw && !/^\d{1,15}$/.test(rateRaw)) {
      return fail({ rate: "Summa noto'g'ri" });
    }
    rate = rateRaw ? new Prisma.Decimal(rateRaw) : null;
  }

  await db.party.create({
    data: {
      companyId: session.companyId,
      kind,
      name,
      phone,
      openingBalance: new Prisma.Decimal(opening || 0),
      payType,
      rate,
    },
  });

  revalidatePath(SECTION[kind].path);
  revalidatePath("/");
  return done();
}
