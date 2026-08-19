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
import { formatQty, previewTotal } from "@/lib/qty";
import { createSaleAction } from "@/server/sale-actions";
import type { FormState } from "@/server/form-state";

type Props = {
  open: boolean;
  onClose: () => void;
  partyId: string;
  /** stock — omborda nechta bor, ogohlantirish uchun */
  products: (PickerItem & { stock: string })[];
  today: string;
};

export function SaleSheet({ open, onClose, partyId, products, today }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createSaleAction,
    {},
  );

  const [product, setProduct] = useState<PickerValue>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (!state.ok) return;
    setProduct(null);
    setQty("");
    setPrice("");
    setDate(today);
    onClose();
  }, [state, today, onClose]);

  const errors = state.errors ?? {};
  const total = previewTotal(qty, price);
  const unit = pickerUnit(product);

  const chosen =
    product?.mode === "existing"
      ? products.find((p) => p.id === product.id)
      : undefined;

  const overStock =
    chosen && qty && Number(qty) > Number(chosen.stock) ? chosen : null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Sotuv qo'shish">
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="partyId" value={partyId} />

        {errors.form ? (
          <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
            {errors.form}
          </p>
        ) : null}

        <FieldShell label="Tayyor mahsulot" error={errors.product}>
          <ItemPicker
            name="product"
            items={products}
            value={product}
            onChange={(next) => {
              setProduct(next);
              // Sotuv narxi sozlamada bo'lsa o'zi qo'yiladi
              if (next?.mode === "existing" && next.price) setPrice(next.price);
            }}
            placeholder="Masalan: Zer Oring"
            invalid={!!errors.product}
          />
        </FieldShell>

        <FieldShell label="Miqdori" htmlFor="sale-qty" error={errors.qty}>
          <QtyInput
            id="sale-qty"
            name="qty"
            value={qty}
            onChange={setQty}
            unit={unit}
            invalid={!!errors.qty}
          />
        </FieldShell>

        {overStock ? (
          <p className="rounded-xl bg-warn-soft px-4 py-3 text-base text-warn">
            Omborda faqat {formatQty(overStock.stock)} {overStock.unit} bor
          </p>
        ) : null}

        <FieldShell
          label={`Narxi — bir ${unit ?? "dona"} uchun`}
          htmlFor="sale-price"
          error={errors.unitPrice}
        >
          <MoneyInput
            id="sale-price"
            name="unitPrice"
            value={price}
            onChange={setPrice}
            invalid={!!errors.unitPrice}
          />
        </FieldShell>

        <TotalLine total={total} />

        <FieldShell label="Sanasi" htmlFor="sale-date" error={errors.date}>
          <DateField
            id="sale-date"
            name="date"
            value={date}
            onChange={setDate}
            max={today}
            invalid={!!errors.date}
          />
        </FieldShell>

        <SheetActions pending={pending} onCancel={onClose} tone="paid" />
      </form>
    </BottomSheet>
  );
}
