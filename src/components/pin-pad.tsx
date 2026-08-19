"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

type Props = {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
};

export function PinPad({ value, onChange, length = 4, disabled = false }: Props) {
  function press(digit: string) {
    if (disabled || value.length >= length) return;
    onChange(value + digit);
  }

  function erase() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  return (
    <div>
      <div className="mb-8 flex justify-center gap-4">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-5 w-5 rounded-full border-2 ${
              i < value.length ? "border-ink bg-ink" : "border-line bg-paper"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            disabled={disabled}
            className="h-20 rounded-xl border-2 border-line bg-paper text-3xl font-semibold active:bg-page disabled:opacity-40"
          >
            {key}
          </button>
        ))}

        <span />

        <button
          type="button"
          onClick={() => press("0")}
          disabled={disabled}
          className="h-20 rounded-xl border-2 border-line bg-paper text-3xl font-semibold active:bg-page disabled:opacity-40"
        >
          0
        </button>

        <button
          type="button"
          onClick={erase}
          disabled={disabled}
          aria-label="O'chirish"
          className="h-20 rounded-xl border-2 border-line bg-paper text-3xl active:bg-page disabled:opacity-40"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
