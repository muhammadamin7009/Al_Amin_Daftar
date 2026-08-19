"use client";

import { useActionState, useEffect, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { DateField, FieldShell, MoneyInput, QtyInput, TextField } from "@/components/fields";
import { PRODUCT_SECTION, UNITS, type UnitValue } from "@/lib/sections";
import {
  createProductAction,
  createProductionAction,
} from "@/server/product-actions";
import type { FormState } from "@/server/form-state";

/** Ro'yxatdagi doimiy + tugmasi va yangi model modali */
export function NewProductSheet() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    createProductAction,
    {},
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<UnitValue>("metr");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    setName("");
    setDescription("");
    setUnit("dona");
    setPrice("");
  }, [state]);

  const errors = state.errors ?? {};

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={PRODUCT_SECTION.addTitle}
        className="btn-dark mt-6"
      >
        + Yangi model
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={PRODUCT_SECTION.addTitle}
      >
        <form action={action} className="flex flex-col gap-5">
          {errors.form ? (
            <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
              {errors.form}
            </p>
          ) : null}

          <FieldShell label="Model nomi" htmlFor="product-name" error={errors.name}>
            <TextField
              id="product-name"
              name="name"
              value={name}
              onChange={setName}
              placeholder="Masalan: Tyul parda"
              invalid={!!errors.name}
              autoFocus
            />
          </FieldShell>

          <FieldShell label="Tavsifi — shart emas" htmlFor="product-desc">
            <textarea
              id="product-desc"
              name="description"
              rows={2}
              maxLength={200}
              placeholder="Masalan: Oq tyul, 3 metr eni"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field py-3"
            />
          </FieldShell>

          <FieldShell label="O'lchov birligi" error={errors.unit}>
            <input type="hidden" name="unit" value={unit} />
            <div className="grid grid-cols-4 gap-2">
              {UNITS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUnit(value)}
                  className={`min-h-14 rounded-xl border-2 text-lg font-semibold ${
                    unit === value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-paper"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </FieldShell>

          <FieldShell
            label="Sotuv narxi — shart emas"
            htmlFor="product-price"
            error={errors.price}
          >
            <MoneyInput
              id="product-price"
              name="price"
              value={price}
              onChange={setPrice}
              invalid={!!errors.price}
            />
          </FieldShell>

          <SheetActions pending={pending} onCancel={() => setOpen(false)} />
        </form>
      </BottomSheet>
    </>
  );
}

type ProductionProps = {
  productId: string;
  unit: string;
  workers: { id: string; name: string }[];
  today: string;
};

/** Kartochkadagi "+ Ishlab chiqarildi" tugmasi va modali */
export function ProductionSheet({
  productId,
  unit,
  workers,
  today,
}: ProductionProps) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    createProductionAction,
    {},
  );

  const [qty, setQty] = useState("");
  const [date, setDate] = useState(today);
  const [workerId, setWorkerId] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    setQty("");
    setWorkerId("");
    setDate(today);
  }, [state, today]);

  const errors = state.errors ?? {};

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn mb-8 bg-paid text-white"
      >
        + {PRODUCT_SECTION.upLabel}
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={PRODUCT_SECTION.upLabel}
      >
        <form action={action} className="flex flex-col gap-5">
          <input type="hidden" name="productId" value={productId} />

          {errors.form ? (
            <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
              {errors.form}
            </p>
          ) : null}

          <FieldShell label="Miqdori" htmlFor="production-qty" error={errors.qty}>
            <QtyInput
              id="production-qty"
              name="qty"
              value={qty}
              onChange={setQty}
              unit={unit}
              invalid={!!errors.qty}
              autoFocus
            />
          </FieldShell>

          <FieldShell label="Sanasi" htmlFor="production-date" error={errors.date}>
            <DateField
              id="production-date"
              name="date"
              value={date}
              onChange={setDate}
              max={today}
              invalid={!!errors.date}
            />
          </FieldShell>

          {workers.length > 0 ? (
            <FieldShell label="Ishchi — shart emas" error={errors.worker}>
              <input type="hidden" name="workerId" value={workerId} />
              <div className="flex flex-wrap gap-2">
                {workers.map((worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    onClick={() =>
                      setWorkerId((prev) => (prev === worker.id ? "" : worker.id))
                    }
                    className={`min-h-14 rounded-xl border-2 px-4 text-lg ${
                      workerId === worker.id
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-paper"
                    }`}
                  >
                    {worker.name}
                  </button>
                ))}
              </div>
            </FieldShell>
          ) : null}

          <SheetActions
            pending={pending}
            onCancel={() => setOpen(false)}
            tone="paid"
          />
        </form>
      </BottomSheet>
    </>
  );
}
