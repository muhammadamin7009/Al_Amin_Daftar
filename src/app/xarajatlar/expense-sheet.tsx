"use client";

import { useActionState, useEffect, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { DateField, FieldShell, MoneyInput, TextField } from "@/components/fields";
import { COMMON_EXPENSES } from "@/lib/expenses";
import { createExpenseAction } from "@/server/expense-actions";
import type { FormState } from "@/server/form-state";

export function ExpenseSheet({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    createExpenseAction,
    {},
  );

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    setTitle("");
    setAmount("");
    setDate(today);
  }, [state, today]);

  const errors = state.errors ?? {};

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-dark mt-6">
        + Xarajat qo'shish
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Xarajat qo'shish"
      >
        <form action={action} className="flex flex-col gap-5">
          <FieldShell
            label="Nimaga sarflandi"
            htmlFor="expense-title"
            error={errors.title}
          >
            <TextField
              id="expense-title"
              name="title"
              value={title}
              onChange={setTitle}
              placeholder="Masalan: Elektr"
              invalid={!!errors.title}
              autoFocus
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {COMMON_EXPENSES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTitle(item)}
                  className={`min-h-12 rounded-full border-[1.5px] px-4 text-base ${
                    title === item
                      ? "border-ink bg-ink text-white"
                      : "border-edge bg-paper text-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </FieldShell>

          <FieldShell label="Summa" htmlFor="expense-amount" error={errors.amount}>
            <MoneyInput
              id="expense-amount"
              name="amount"
              value={amount}
              onChange={setAmount}
              invalid={!!errors.amount}
            />
          </FieldShell>

          <FieldShell label="Sana" htmlFor="expense-date" error={errors.date}>
            <DateField
              id="expense-date"
              name="date"
              value={date}
              onChange={setDate}
              max={today}
              invalid={!!errors.date}
            />
          </FieldShell>

          <SheetActions
            pending={pending}
            onCancel={() => setOpen(false)}
            tone="debt"
          />
        </form>
      </BottomSheet>
    </>
  );
}
