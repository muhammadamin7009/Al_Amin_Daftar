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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={text.addTitle}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-4xl text-white shadow-lg active:translate-y-px"
      >
        +
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={text.addTitle}>
        <form action={action} className="flex flex-col gap-5">
          <input type="hidden" name="kind" value={kind} />

          {errors.form ? (
            <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
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
              <span className="shrink-0 text-xl text-muted">+998</span>
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
                      className={`btn border-2 ${
                        payType === value
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-paper"
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
          ) : (
            <FieldShell
              label="Boshlang'ich qarz — shart emas"
              htmlFor="party-opening"
              error={errors.openingBalance}
              hint={text.currentLabel + "ni bilmasangiz bo'sh qoldiring."}
            >
              <MoneyInput
                id="party-opening"
                name="openingBalance"
                value={opening}
                onChange={setOpening}
                invalid={!!errors.openingBalance}
              />
            </FieldShell>
          )}

          {kind === "ishchi" ? (
            <FieldShell
              label="Boshlang'ich qoldiq — shart emas"
              htmlFor="party-opening"
              error={errors.openingBalance}
            >
              <MoneyInput
                id="party-opening"
                name="openingBalance"
                value={opening}
                onChange={setOpening}
                invalid={!!errors.openingBalance}
              />
            </FieldShell>
          ) : null}

          <SheetActions pending={pending} onCancel={() => setOpen(false)} />
        </form>
      </BottomSheet>
    </>
  );
}
