"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

/** Pastdan ko'tariladigan panel — telefonda barmoq yetadigan joyda */
export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-panel relative mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-paper p-5 pb-8"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl text-muted active:bg-page"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

type ActionsProps = {
  pending: boolean;
  onCancel: () => void;
  saveLabel?: string;
  tone?: "ink" | "debt" | "paid";
};

const TONE_BG = {
  ink: "bg-ink",
  debt: "bg-debt",
  paid: "bg-paid",
} as const;

/** Har bir modalning pastidagi ikkita tugma */
export function SheetActions({
  pending,
  onCancel,
  saveLabel = "Saqlash",
  tone = "ink",
}: ActionsProps) {
  return (
    <div className="mt-8 flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        className={`btn text-white ${TONE_BG[tone]}`}
      >
        {pending ? "Saqlanmoqda..." : saveLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="btn text-muted"
      >
        Bekor qilish
      </button>
    </div>
  );
}
