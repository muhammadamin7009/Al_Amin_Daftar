"use client";

import { useRef, useState } from "react";
import { deleteRecordAction, type RecordType } from "@/server/record-actions";

export type HistoryRow = {
  id: string;
  type: RecordType;
  /** "Charm · 120 dis" yoki "Pul berildi" */
  title: string;
  /** sana, ostida izoh */
  subtitle: string;
  /** "+4 800 000" yoki "−3 000 000" */
  amountText: string;
  tone: "debt" | "paid";
};

const LONG_PRESS_MS = 500;
const SWIPE_PX = 60;

/** Uzoq bosilganda yoki o'ngdan chapga surilganda "O'chirish" chiqadi */
function Row({ row, path }: { row: HistoryRow; path: string }) {
  const [revealed, setRevealed] = useState(false);
  const [asking, setAsking] = useState(false);
  const timer = useRef<number | null>(null);
  const startX = useRef(0);

  function clearTimer() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    clearTimer();
    timer.current = window.setTimeout(() => setRevealed(true), LONG_PRESS_MS);
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = startX.current - e.clientX;
    if (Math.abs(dx) > 10) clearTimer();
    if (dx > SWIPE_PX) setRevealed(true);
  }

  function close() {
    setAsking(false);
    setRevealed(false);
  }

  return (
    <li className="border-b border-line last:border-0">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clearTimer}
        onPointerCancel={clearTimer}
        onContextMenu={(e) => e.preventDefault()}
        className="flex touch-pan-y select-none items-center gap-3 px-4 py-3"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg">{row.title}</span>
          <span className="block truncate text-base text-muted">
            {row.subtitle}
          </span>
        </span>
        <span
          className={`shrink-0 text-lg font-semibold ${
            row.tone === "debt" ? "text-debt" : "text-paid"
          }`}
        >
          {row.amountText}
        </span>
      </div>

      {revealed ? (
        <div className="flex items-center justify-end gap-2 bg-page px-4 py-2">
          {asking ? (
            <>
              <span className="mr-auto text-base text-muted">O'chirilsinmi?</span>
              <form action={deleteRecordAction}>
                <input type="hidden" name="type" value={row.type} />
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="path" value={path} />
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-debt px-5 text-base font-semibold text-white"
                >
                  Ha
                </button>
              </form>
              <button
                type="button"
                onClick={close}
                className="h-12 rounded-xl border-2 border-line px-5 text-base"
              >
                Yo'q
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="h-12 rounded-xl bg-debt px-5 text-base font-semibold text-white"
              >
                O'chirish
              </button>
              <button
                type="button"
                onClick={close}
                className="h-12 rounded-xl border-2 border-line px-5 text-base"
              >
                Yopish
              </button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function HistoryList({
  rows,
  path,
  emptyText = "Hali yozuv yo'q.",
}: {
  rows: HistoryRow[];
  path: string;
  emptyText?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-muted">{emptyText}</p>;
  }

  return (
    <ul className="card overflow-hidden">
      {rows.map((row) => (
        <Row key={`${row.type}-${row.id}`} row={row} path={path} />
      ))}
    </ul>
  );
}
