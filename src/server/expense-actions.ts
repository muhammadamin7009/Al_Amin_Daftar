"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { isValidAmount, parseMoney } from "@/lib/money";
import { isUsableDate, parseISODate } from "@/lib/day";
import { done, fail, type FormState } from "@/server/form-state";
import { EXPENSE_PATH } from "@/lib/expenses";


export async function createExpenseAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return fail({ title: "Nimaga sarflandi — yozing" });
  if (title.length > 60) return fail({ title: "Nomi juda uzun" });

  const amount = parseMoney(String(formData.get("amount") ?? ""));
  if (!amount) return fail({ amount: "Summani kiriting" });
  if (!isValidAmount(amount)) return fail({ amount: "Summa noto'g'ri" });

  const dateRaw = String(formData.get("date") ?? "");
  if (!isUsableDate(dateRaw)) return fail({ date: "Sana noto'g'ri" });
  const date = parseISODate(dateRaw);
  if (!date) return fail({ date: "Sana noto'g'ri" });

  await db.expense.create({
    data: {
      companyId: session.companyId,
      title,
      amount: new Prisma.Decimal(amount),
      date,
      createdBy: session.userId,
    },
  });

  revalidatePath(EXPENSE_PATH);
  revalidatePath("/");
  return done();
}
