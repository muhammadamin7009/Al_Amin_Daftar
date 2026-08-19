"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PinPad } from "@/components/pin-pad";
import { formatLocalWhileTyping } from "@/lib/phone";
import { loginAction, type AuthState } from "@/server/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    {},
  );
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const phoneReady = phone.replace(/\D/g, "").length === 9;

  // 4 ta raqam terilishi bilan o'zi yuboriladi — ortiqcha tugma bosish yo'q
  useEffect(() => {
    if (step === "pin" && pin.length === 4 && !pending) {
      formRef.current?.requestSubmit();
    }
  }, [pin, step, pending]);

  // Xato bo'lsa maxfiy raqam tozalanadi
  useEffect(() => {
    if (state.error) setPin("");
  }, [state]);

  function goToPin() {
    if (phoneReady) setStep("pin");
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        // Telefon maydonida Enter bosilsa forma yarim yo'lda yuborilmasin
        if (step !== "pin" || pin.length !== 4) e.preventDefault();
      }}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="pin" value={pin} />

      {state.error ? (
        <p className="rounded-xl bg-debt-soft px-4 py-3 text-base text-debt">
          {state.error}
        </p>
      ) : null}

      {step === "phone" ? (
        <>
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
                autoFocus
                placeholder="90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(formatLocalWhileTyping(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToPin();
                  }
                }}
                className="field"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!phoneReady}
            onClick={goToPin}
            className="btn bg-ink text-white disabled:opacity-40"
          >
            Davom etish
          </button>

          <Link href="/signup" className="text-center text-base text-muted underline">
            Korxonam ro'yxatda yo'q
          </Link>
        </>
      ) : (
        <>
          <p className="text-center text-lg">
            <span className="text-muted">+998 </span>
            {phone}
          </p>
          <p className="text-center text-lg font-medium">
            {pending ? "Tekshirilmoqda..." : "Maxfiy raqamni tering"}
          </p>

          <PinPad value={pin} onChange={setPin} disabled={pending} />

          <button
            type="button"
            onClick={() => {
              setPin("");
              setStep("phone");
            }}
            className="text-center text-base text-muted underline"
          >
            Raqamni o'zgartirish
          </button>
        </>
      )}
    </form>
  );
}
