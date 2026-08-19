"use client";

import { useActionState, useEffect, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { TotalLine } from "@/components/bits";
import { DateField, FieldShell, MoneyInput, QtyInput } from "@/components/fields";
import {
  ItemPicker,
  pickerUnit,
  type PickerItem,
  type PickerValue,
} from "@/components/item-picker";
import { previewTotal } from "@/lib/qty";
import { createWorkAction } from "@/server/work-actions";
import type { FormState } from "@/server/form-state";

type Props = {
  open: boolean;
  onClose: () => void;
  partyId: string;
  payType: "ishbay" | "oylik";
  /** Ishchining sozlamasidagi narx — o'zi qo'yiladi, o'zgartirsa bo'ladi */
  rate: string;
  products: PickerItem[];
  today: string;
};

export function WorkSheet({
  open,
  onClose,
  partyId,
  payType,
  rate,
  products,
  today,
}: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createWorkAction,
    {},
  );

  const [work, setWork] = useState<PickerValue>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState(rate);
  const [amount, setAmount] = useState(rate);
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (!state.ok) return;
    setWork(null);
    setQty("");
    setPrice(rate);
    setAmount(rate);
    setDate(today);
    onClose();
  }, [state, today, rate, onClose]);

  const errors = state.errors ?? {};
  const total = previewTotal(qty, price);
  const unit = pickerUnit(work);

  // Oylik ishchi: summa va sana yetarli
  if (payType === "oylik") {
    return (
      <BottomSheet open={open} onClose={onClose} title="Ish qo'shish">
        <form action={action} className="flex flex-col gap-5">
          <input type="hidden" name="partyId" value={partyId} />

          {errors.form ? (
            <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
              {errors.form}
            </p>
          ) : null}

          <FieldShell label="Summa" htmlFor="work-amount" error={errors.amount}>
            <MoneyInput
              id="work-amount"
              name="amount"
              value={amount}
              onChange={setAmount}
              invalid={!!errors.amount}
              autoFocus
            />
          </FieldShell>

          <FieldShell label="Sanasi" htmlFor="work-date" error={errors.date}>
            <DateField
              id="work-date"
              name="date"
              value={date}
              onChange={setDate}
              max={today}
              invalid={!!errors.date}
            />
          </FieldShell>

          <SheetActions pending={pending} onCancel={onClose} tone="debt" />
        </form>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Ish qo'shish">
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="partyId" value={partyId} />

        {errors.form ? (
          <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
            {errors.form}
          </p>
        ) : null}

        <FieldShell label="Qanday ish" error={errors.work}>
          <ItemPicker
            name="work"
            items={products}
            value={work}
            onChange={setWork}
            placeholder="Mahsulot yoki: Tikuv"
            createAs="label"
            invalid={!!errors.work}
          />
        </FieldShell>

        <FieldShell label="Soni" htmlFor="work-qty" error={errors.qty}>
          <QtyInput
            id="work-qty"
            name="qty"
            value={qty}
            onChange={setQty}
            unit={unit ?? "dona"}
            invalid={!!errors.qty}
          />
        </FieldShell>

        <FieldShell
          label="Bir dona narxi"
          htmlFor="work-price"
          error={errors.unitPrice}
        >
          <MoneyInput
            id="work-price"
            name="unitPrice"
            value={price}
            onChange={setPrice}
            invalid={!!errors.unitPrice}
          />
        </FieldShell>

        <TotalLine total={total} />

        <FieldShell label="Sanasi" htmlFor="work-date" error={errors.date}>
          <DateField
            id="work-date"
            name="date"
            value={date}
            onChange={setDate}
            max={today}
            invalid={!!errors.date}
          />
        </FieldShell>

        <SheetActions pending={pending} onCancel={onClose} tone="debt" />
      </form>
    </BottomSheet>
  );
}
