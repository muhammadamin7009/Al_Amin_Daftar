"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PinPad } from "@/components/pin-pad";
import { formatLocalWhileTyping } from "@/lib/phone";
import {
  isPhoneTakenAction,
  signupAction,
  type AuthState,
} from "@/server/auth-actions";

type Step = "info" | "pin" | "repeat";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signupAction,
    {},
  );
  const [step, setStep] = useState<Step>("info");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [repeat, setRepeat] = useState("");
  const [localError, setLocalError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [checking, setChecking] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const infoReady =
    companyName.trim().length >= 2 && phone.replace(/\D/g, "").length === 9;

  useEffect(() => {
    if (step === "pin" && pin.length === 4) {
      setStep("repeat");
    }
  }, [pin, step]);

  useEffect(() => {
    if (step !== "repeat" || repeat.length !== 4 || pending) return;

    if (repeat !== pin) {
      setLocalError("Ikkala maxfiy raqam bir xil emas. Qaytadan tering.");
      setPin("");
      setRepeat("");
      setStep("pin");
      return;
    }

    formRef.current?.requestSubmit();
  }, [repeat, pin, step, pending]);

  useEffect(() => {
    if (state.error) {
      setPin("");
      setRepeat("");
      setStep("info");
    }
  }, [state]);

  const error = state.error || localError;

  // Maxfiy raqam so'rashdan oldin telefonni tekshiramiz —
  // ikki marta PIN terib bo'lgach "bu raqam band" deyish noto'g'ri
  async function goToPin() {
    if (!infoReady || checking) return;

    setLocalError("");
    setPhoneError("");
    setChecking(true);
    try {
      const taken = await isPhoneTakenAction(phone);
      if (taken) {
        setPhoneError("Bu raqam ro'yxatdan o'tgan. Pastdagi havola bilan kiring.");
        return;
      }
      setStep("pin");
    } catch {
      setPhoneError("Tekshirib bo'lmadi. Yana bir marta bosing.");
    } finally {
      setChecking(false);
    }
  }

  function onInfoKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    void goToPin();
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        // Maydonda Enter bosilsa forma yarim yo'lda yuborilmasin
        if (step !== "repeat" || repeat.length !== 4 || repeat !== pin) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="companyName" value={companyName} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="pin" value={pin} />

      {error ? (
        <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
          {error}
        </p>
      ) : null}

      {step === "info" ? (
        <>
          <div>
            <label htmlFor="company-input" className="label">
              Korxona nomi
            </label>
            <input
              id="company-input"
              type="text"
              autoFocus
              placeholder="Masalan: Baraka charm"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={onInfoKeyDown}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="phone-input" className="label">
              Telefon raqamingiz
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl text-muted">+998</span>
              <input
                id="phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="90 123 45 67"
                value={phone}
                onChange={(e) => {
                  setPhone(formatLocalWhileTyping(e.target.value));
                  setPhoneError("");
                }}
                onKeyDown={onInfoKeyDown}
                className={`field ${phoneError ? "field-error" : ""}`}
              />
            </div>
            {phoneError ? <p className="error-text">{phoneError}</p> : null}
          </div>

          <button
            type="button"
            disabled={!infoReady || checking}
            onClick={() => void goToPin()}
            className="btn bg-ink text-white disabled:opacity-40"
          >
            {checking ? "Tekshirilmoqda..." : "Davom etish"}
          </button>

          <Link href="/login" className="text-center text-base text-muted underline">
            Ro'yxatdan o'tganman, kiraman
          </Link>
        </>
      ) : (
        <>
          <p className="text-center text-lg font-medium">
            {pending
              ? "Saqlanmoqda..."
              : step === "pin"
                ? "4 xonali maxfiy raqam o'ylang"
                : "Yana bir marta tering"}
          </p>
          <p className="text-center text-base text-muted">
            Har safar kirganda shu raqamni terasiz. Eslab qoling.
          </p>

          <PinPad
            value={step === "pin" ? pin : repeat}
            onChange={step === "pin" ? setPin : setRepeat}
            disabled={pending}
          />

          <button
            type="button"
            onClick={() => {
              setPin("");
              setRepeat("");
              setLocalError("");
              setStep("info");
            }}
            className="text-center text-base text-muted underline"
          >
            Orqaga
          </button>
        </>
      )}
    </form>
  );
}
