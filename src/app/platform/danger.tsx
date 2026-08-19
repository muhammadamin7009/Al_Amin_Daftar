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
    <>
      <form action={action}>
        <input type="hidden" name="companyId" value={companyId} />
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full border border-plat-line px-5 text-sm text-plat-ink hover:border-plat-accent disabled:opacity-40"
        >
          {pending ? "Tiklanmoqda..." : "Kodni tiklash"}
        </button>
      </form>

      {state.pin ? (
        <p className="basis-full rounded-xl border border-plat-live/40 bg-plat-live/10 px-4 py-3 text-sm text-plat-live">
          Yangi kod: <b className="num text-lg tracking-widest">{state.pin}</b>
          {" — egasiga ayting. Bu raqam boshqa ko'rinmaydi."}
        </p>
      ) : null}

      {state.error ? (
        <p className="basis-full text-sm text-plat-dead">{state.error}</p>
      ) : null}
    </>
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
        className="text-sm text-plat-faint underline underline-offset-4 hover:text-plat-dead"
      >
        Korxonani o'chirish
      </button>
    );
  }

  return (
    <form
      action={action}
      className="rounded-xl border border-plat-dead/40 bg-plat-dead/10 p-4"
    >
      <input type="hidden" name="companyId" value={companyId} />

      <p className="text-sm text-plat-ink">
        Korxona va ichidagi hamma narsa — foydalanuvchilar, mijozlar, barcha
        yozuvlar — butunlay o'chadi. Qaytarib bo'lmaydi.
      </p>
      <p className="mt-2 text-sm text-plat-muted">
        Tasdiqlash uchun nomini yozing: <b className="text-plat-ink">{name}</b>
      </p>

      <input
        name="confirmName"
        type="text"
        autoComplete="off"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className={`mt-3 h-12 w-full rounded-xl border bg-plat-bg px-4 text-base text-plat-ink outline-none focus:border-plat-accent ${
          errors.confirmName ? "border-plat-dead" : "border-plat-line"
        }`}
      />
      {errors.confirmName ? (
        <p className="mt-2 text-sm text-plat-dead">{errors.confirmName}</p>
      ) : null}
      {errors.form ? (
        <p className="mt-2 text-sm text-plat-dead">{errors.form}</p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={pending || typed.trim().length === 0}
          className="h-11 rounded-full bg-plat-dead px-5 text-sm font-semibold text-plat-bg disabled:opacity-40"
        >
          {pending ? "O'chirilmoqda..." : "Butunlay o'chirish"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAsking(false);
            setTyped("");
          }}
          className="h-11 rounded-full border border-plat-line px-5 text-sm text-plat-muted"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
