"use client";

import { useActionState, useState } from "react";
import {
  deleteCompanyAction,
  resetOwnerPinAction,
  type ResetPinState,
} from "@/server/platform-actions";
import type { FormState } from "@/server/form-state";

export function ResetPin({ companyId }: { companyId: string }) {
  const [state, action, pending] = useActionState<ResetPinState, FormData>(
    resetOwnerPinAction,
    {},
  );

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="companyId" value={companyId} />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full border-[1.5px] border-edge px-5 text-base disabled:opacity-40"
        >
          {pending ? "..." : "Kodni tiklash"}
        </button>
      </form>

      {state.pin ? (
        <p className="mt-2 rounded-2xl bg-paid-soft px-4 py-3 text-base text-paid">
          Yangi kod: <b className="num text-xl">{state.pin}</b> — egasiga
          ayting. Bu raqam boshqa ko'rinmaydi.
        </p>
      ) : null}

      {state.error ? (
        <p className="mt-2 text-base text-debt">{state.error}</p>
      ) : null}
    </div>
  );
}

export function DeleteCompany({
  companyId,
  name,
}: {
  companyId: string;
  name: string;
}) {
  const [asking, setAsking] = useState(false);
  const [typed, setTyped] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(
    deleteCompanyAction,
    {},
  );

  const errors = state.errors ?? {};

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="h-12 rounded-full px-5 text-base text-debt"
      >
        O'chirish
      </button>
    );
  }

  return (
    <form action={action} className="w-full rounded-2xl bg-debt-soft p-4">
      <input type="hidden" name="companyId" value={companyId} />

      <p className="text-base">
        Korxona va ichidagi hamma narsa — foydalanuvchilar, mijozlar, barcha
        yozuvlar — butunlay o'chadi. Qaytarib bo'lmaydi.
      </p>
      <p className="mt-2 text-base">
        Tasdiqlash uchun nomini yozing: <b>{name}</b>
      </p>

      <input
        name="confirmName"
        type="text"
        autoComplete="off"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className={`field mt-3 ${errors.confirmName ? "field-error" : ""}`}
      />
      {errors.confirmName ? (
        <p className="error-text">{errors.confirmName}</p>
      ) : null}
      {errors.form ? <p className="error-text">{errors.form}</p> : null}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending || typed.trim().length === 0}
          className="h-12 flex-1 rounded-full bg-debt px-5 text-base font-semibold text-white disabled:opacity-40"
        >
          {pending ? "O'chirilmoqda..." : "Butunlay o'chirish"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAsking(false);
            setTyped("");
          }}
          className="h-12 flex-1 rounded-full border-[1.5px] border-edge px-5 text-base"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
