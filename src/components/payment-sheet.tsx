"use client";

import { useActionState, useEffect, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { DateField, FieldShell, MoneyInput, TextField } from "@/components/fields";
import { formatSom } from "@/lib/money";
import { createPaymentAction } from "@/server/payment-actions";
import type { FormState } from "@/server/form-state";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  partyId: string;
  /** "2400000" — hozirgi qarz, "Hammasi" tugmasi shuni qo'yadi */
  currentBalance: string;
  currentLabel: string;
  today: string;
  /** Ishchida avans/oylik so'raladi */
  askKind?: boolean;
  tone: "debt" | "paid";
};

export function PaymentSheet({
  open,
  onClose,
  title,
  partyId,
  currentBalance,
  currentLabel,
  today,
  askKind = false,
  tone,
}: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createPaymentAction,
    {},
  );

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"avans" | "oylik" | "">("");

  useEffect(() => {
    if (!state.ok) return;
    setAmount("");
    setNote("");
    setKind("");
    setDate(today);
    onClose();
  }, [state, today, onClose]);

  const errors = state.errors ?? {};
  const positive = !currentBalance.startsWith("-") && !/^0*$/.test(currentBalance);

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="partyId" value={partyId} />

        {errors.form ? (
          <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
            {errors.form}
          </p>
        ) : null}

        <FieldShell
          label="Summa"
          htmlFor="payment-amount"
          error={errors.amount}
          hint={
            <span className="flex items-center justify-between gap-3">
              <span>
                {currentLabel}: {formatSom(currentBalance)}
              </span>
              {positive ? (
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance)}
                  className="shrink-0 rounded-xl border-2 border-line px-4 py-2 text-base text-ink"
                >
                  Hammasi
                </button>
              ) : null}
            </span>
          }
        >
          <MoneyInput
            id="payment-amount"
            name="amount"
            value={amount}
            onChange={setAmount}
            invalid={!!errors.amount}
            autoFocus
          />
        </FieldShell>

        <FieldShell label="Sana" htmlFor="payment-date" error={errors.date}>
          <DateField
            id="payment-date"
            name="date"
            value={date}
            onChange={setDate}
            max={today}
            invalid={!!errors.date}
          />
        </FieldShell>

        {askKind ? (
          <FieldShell label="Turi" error={errors.kind}>
            <input type="hidden" name="kind" value={kind} />
            <div className="grid grid-cols-2 gap-2">
              {(["avans", "oylik"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  className={`btn border-2 ${
                    kind === value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-paper"
                  }`}
                >
                  {value === "avans" ? "Avans" : "Oylik"}
                </button>
              ))}
            </div>
          </FieldShell>
        ) : null}

        <FieldShell label="Izoh — shart emas" htmlFor="payment-note">
          <TextField
            id="payment-note"
            name="note"
            value={note}
            onChange={setNote}
            maxLength={100}
            placeholder="Masalan: naqd"
          />
        </FieldShell>

        <SheetActions pending={pending} onCancel={onClose} tone={tone} />
      </form>
    </BottomSheet>
  );
}
