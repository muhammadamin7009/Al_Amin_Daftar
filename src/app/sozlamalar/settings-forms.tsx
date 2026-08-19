"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { BottomSheet, SheetActions } from "@/components/bottom-sheet";
import { FieldShell, TextField } from "@/components/fields";
import { PinPad } from "@/components/pin-pad";
import { formatLocalWhileTyping } from "@/lib/phone";
import {
  addUserAction,
  changePinAction,
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

type PinStep = "current" | "next" | "repeat";

export function ChangePin() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    changePinAction,
    {},
  );

  const [step, setStep] = useState<PinStep>("current");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [localError, setLocalError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function reset() {
    setStep("current");
    setCurrent("");
    setNext("");
    setRepeat("");
    setLocalError("");
  }

  useEffect(() => {
    if (step === "current" && current.length === 4) setStep("next");
  }, [current, step]);

  useEffect(() => {
    if (step === "next" && next.length === 4) setStep("repeat");
  }, [next, step]);

  useEffect(() => {
    if (step !== "repeat" || repeat.length !== 4 || pending) return;
    if (repeat !== next) {
      setLocalError("Ikkala yangi kod bir xil emas. Qaytadan tering.");
      setNext("");
      setRepeat("");
      setStep("next");
      return;
    }
    formRef.current?.requestSubmit();
  }, [repeat, next, step, pending]);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      reset();
    } else if (state.errors) {
      setNext("");
      setRepeat("");
      setCurrent("");
      setStep("current");
    }
  }, [state]);

  const errors = state.errors ?? {};
  const error = errors.current || errors.next || errors.form || localError;

  const title =
    step === "current"
      ? "Hozirgi maxfiy raqam"
      : step === "next"
        ? "Yangi maxfiy raqam"
        : "Yana bir marta tering";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="row w-full text-left active:opacity-60"
      >
        <span>
          <span className="block text-lg">Maxfiy raqamni almashtirish</span>
          <span className="block text-sm text-faint">
            Kodni birov bilib qolgan bo'lsa
          </span>
        </span>
        <span className="shrink-0 text-2xl text-faint">›</span>
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Maxfiy raqam"
      >
        <form
          ref={formRef}
          action={action}
          onSubmit={(e) => {
            if (step !== "repeat" || repeat !== next) e.preventDefault();
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="current" value={current} />
          <input type="hidden" name="next" value={next} />

          {error ? (
            <p className="rounded-2xl bg-debt-soft px-4 py-3 text-base text-debt">
              {error}
            </p>
          ) : null}

          <p className="text-center text-lg font-medium">
            {pending ? "Saqlanmoqda..." : title}
          </p>

          <PinPad
            value={step === "current" ? current : step === "next" ? next : repeat}
            onChange={
              step === "current" ? setCurrent : step === "next" ? setNext : setRepeat
            }
            disabled={pending}
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-center text-base text-muted underline"
          >
            Bekor qilish
          </button>
        </form>
      </BottomSheet>
    </>
  );
}
