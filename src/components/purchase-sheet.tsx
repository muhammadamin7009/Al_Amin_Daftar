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
import { createPurchaseAction } from "@/server/purchase-actions";
import type { FormState } from "@/server/form-state";

type Props = {
  open: boolean;
  onClose: () => void;
  partyId: string;
  materials: PickerItem[];
  today: string;
};

export function PurchaseSheet({
  open,
  onClose,
  partyId,
  materials,
  today,
}: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createPurchaseAction,
    {},
  );

  const [material, setMaterial] = useState<PickerValue>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (!state.ok) return;
    setMaterial(null);
    setQty("");
    setPrice("");
    setDate(today);
    onClose();
  }, [state, today, onClose]);

  const errors = state.errors ?? {};
  const total = previewTotal(qty, price);
  const unit = pickerUnit(material);

  return (
    <BottomSheet open={open} onClose={onClose} title="Xarid qo'shish">
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="partyId" value={partyId} />

        {errors.form ? (
          <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
            {errors.form}
          </p>
        ) : null}

        <FieldShell label="Xom ashyo" error={errors.material}>
          <ItemPicker
            name="material"
            items={materials}
            value={material}
            onChange={setMaterial}
            placeholder="Xom ashyo nomi"
            invalid={!!errors.material}
          />
        </FieldShell>

        <FieldShell label="Miqdori" htmlFor="purchase-qty" error={errors.qty}>
          <QtyInput
            id="purchase-qty"
            name="qty"
            value={qty}
            onChange={setQty}
            unit={unit}
            invalid={!!errors.qty}
          />
        </FieldShell>

        <FieldShell
          label={`Narxi — bir ${unit ?? "dona"} uchun`}
          htmlFor="purchase-price"
          error={errors.unitPrice}
        >
          <MoneyInput
            id="purchase-price"
            name="unitPrice"
            value={price}
            onChange={setPrice}
            invalid={!!errors.unitPrice}
          />
        </FieldShell>

        <TotalLine total={total} />

        <FieldShell label="Sanasi" htmlFor="purchase-date" error={errors.date}>
          <DateField
            id="purchase-date"
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
