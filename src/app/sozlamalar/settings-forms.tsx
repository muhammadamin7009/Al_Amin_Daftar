"use client";

import { useActionState, useEffect, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { FieldShell, TextField } from "@/components/fields";
import { PinPad } from "@/components/pin-pad";
import { formatLocalWhileTyping } from "@/lib/phone";
import {
  addUserAction,
  renameCompanyAction,
} from "@/server/settings-actions";
import type { FormState } from "@/server/form-state";

export function RenameCompany({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    renameCompanyAction,
    {},
  );
  const [name, setName] = useState(current);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  const errors = state.errors ?? {};

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="row w-full text-left active:opacity-60"
      >
        <span>
          <span className="block text-lg">Korxona nomi</span>
          <span className="block text-sm text-faint">{current}</span>
        </span>
        <span className="shrink-0 text-2xl text-faint">›</span>
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Korxona nomi"
      >
        <form action={action} className="flex flex-col gap-5">
          {errors.form ? (
            <p className="rounded-2xl bg-debt-soft px-4 py-3 text-base text-debt">
              {errors.form}
            </p>
          ) : null}

          <FieldShell label="Yangi nom" htmlFor="company-name" error={errors.name}>
            <TextField
              id="company-name"
              name="name"
              value={name}
              onChange={setName}
              invalid={!!errors.name}
              autoFocus
            />
          </FieldShell>

          <SheetActions pending={pending} onCancel={() => setOpen(false)} />
        </form>
      </BottomSheet>
    </>
  );
}

export function AddUser() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    addUserAction,
    {},
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    setName("");
    setPhone("");
    setPin("");
  }, [state]);

  const errors = state.errors ?? {};

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-dark mt-4"
      >
        + Xodim qo'shish
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Yangi xodim"
      >
        <form action={action} className="flex flex-col gap-5">
          <input type="hidden" name="pin" value={pin} />

          {errors.form ? (
            <p className="rounded-2xl bg-debt-soft px-4 py-3 text-base text-debt">
              {errors.form}
            </p>
          ) : null}

          <FieldShell label="Ismi" htmlFor="user-name" error={errors.name}>
            <TextField
              id="user-name"
              name="name"
              value={name}
              onChange={setName}
              placeholder="Xodim ismi"
              invalid={!!errors.name}
              autoFocus
            />
          </FieldShell>

          <FieldShell
            label="Telefon raqami"
            htmlFor="user-phone"
            error={errors.phone}
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-lg text-muted">+998</span>
              <input
                id="user-phone"
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

          <FieldShell label="Maxfiy raqami" error={errors.pin}>
            <PinPad value={pin} onChange={setPin} disabled={pending} />
          </FieldShell>

          <SheetActions pending={pending} onCancel={() => setOpen(false)} />
        </form>
      </BottomSheet>
    </>
  );
}
