"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export type RecordType =
  | "purchase"
  | "sale"
  | "payment"
  | "production"
  | "work"
  | "expense";

const TYPES: RecordType[] = [
  "purchase",
  "sale",
  "payment",
  "production",
  "work",
  "expense",
];

/**
 * Yozuv bazadan yo'qolmaydi — deletedAt qo'yiladi va hisobdan chiqadi.
 * companyId filtri bor: begona korxonaning yozuvi o'chmaydi.
 */
export async function deleteRecordAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const type = String(formData.get("type") ?? "") as RecordType;
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "/");
  if (!TYPES.includes(type) || !id) return;

  const where = { id, companyId: session.companyId, deletedAt: null };
  const data = { deletedAt: new Date() };

  switch (type) {
    case "purchase":
      await db.purchase.updateMany({ where, data });
      break;
    case "sale":
      await db.sale.updateMany({ where, data });
      break;
    case "payment":
      await db.payment.updateMany({ where, data });
      break;
    case "production":
      await db.production.updateMany({ where, data });
      break;
    case "work":
      await db.workEntry.updateMany({ where, data });
      break;
    case "expense":
      await db.expense.updateMany({ where, data });
      break;
  }

  revalidatePath(path);
  revalidatePath("/");
}
