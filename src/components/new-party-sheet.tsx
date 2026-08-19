"use client";

import { useActionState, useEffect, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { FieldShell, MoneyInput, TextField } from "@/components/fields";
import { formatLocalWhileTyping } from "@/lib/phone";
import { SECTION, type Kind } from "@/lib/sections";
import { createPartyAction } from "@/server/party-actions";
import type { FormState } from "@/server/form-state";

export function NewPartySheet({ kind }: { kind: Kind }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    createPartyAction,
    {},
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [opening, setOpening] = useState("");
  const [payType, setPayType] = useState<"ishbay" | "oylik" | "">("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    setName("");
    setPhone("");
    setOpening("");
    setPayType("");
    setRate("");
  }, [state]);

  const errors = state.errors ?? {};
  const text = SECTION[kind];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-dark mt-6">
        + Yangi qo'shish
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={text.addTitle}>
        <form action={action} className="flex flex-col gap-5">
          <input type="hidden" name="kind" value={kind} />

          {errors.form ? (
            <p className="rounded-2xl bg-debt-soft px-4 py-3 text-base text-debt">
              {errors.form}
            </p>
          ) : null}

          <FieldShell label="Nomi" htmlFor="party-name" error={errors.name}>
            <TextField
              id="party-name"
              name="name"
              value={name}
              onChange={setName}
              placeholder="Masalan: Akmal aka"
              invalid={!!errors.name}
              autoFocus
            />
          </FieldShell>

          <FieldShell
            label="Telefon raqami — shart emas"
            htmlFor="party-phone"
            error={errors.phone}
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-lg text-muted">+998</span>
              <input
                id="party-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                placeholder="90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(formatLocalWhileTyping(e.target.value))}
                className={`field ${errors.phone ? "field-error" : ""}`}
              />
            </div>
          </FieldShell>

          {kind === "ishchi" ? (
            <>
              <FieldShell label="To'lov turi" error={errors.payType}>
                <input type="hidden" name="payType" value={payType} />
                <div className="grid grid-cols-2 gap-2">
                  {(["ishbay", "oylik"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPayType(value)}
                      className={`btn border-[1.5px] ${
                        payType === value
                          ? "border-ink bg-ink text-white"
                          : "border-edge bg-paper"
                      }`}
                    >
                      {value === "ishbay" ? "Ishbay" : "Oylik"}
                    </button>
                  ))}
                </div>
              </FieldShell>

              <FieldShell
                label={
                  payType === "oylik" ? "Oylik summasi" : "Bir dona uchun narxi"
                }
                htmlFor="party-rate"
                error={errors.rate}
              >
                <MoneyInput
                  id="party-rate"
                  name="rate"
                  value={rate}
                  onChange={setRate}
                  invalid={!!errors.rate}
                />
              </FieldShell>
            </>
          ) : null}

          <FieldShell
            label={
              kind === "ishchi"
                ? "Boshlang'ich qoldiq — shart emas"
                : "Boshlang'ich qarz — shart emas"
            }
            htmlFor="party-opening"
            error={errors.openingBalance}
            hint={
              kind === "ishchi"
                ? undefined
                : "Bilmasangiz bo'sh qoldiring, keyin to'g'rilasa bo'ladi."
            }
          >
            <MoneyInput
              id="party-opening"
              name="openingBalance"
              value={opening}
              onChange={setOpening}
              invalid={!!errors.openingBalance}
            />
          </FieldShell>

          <SheetActions pending={pending} onCancel={() => setOpen(false)} />
        </form>
      </BottomSheet>
    </>
  );
}
