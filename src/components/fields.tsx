"use client";

import { formatMoney, parseMoney } from "@/lib/money";
import { formatQtyWhileTyping, parseQty } from "@/lib/qty";

type FieldShellProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
};

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FieldShellProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error ? <p className="error-text">{error}</p> : null}
      {hint && !error ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

type MoneyProps = {
  id: string;
  name: string;
  value: string;
  onChange: (raw: string) => void;
  autoFocus?: boolean;
  invalid?: boolean;
};

/** Pul: terilayotganda 5 600 000 ko'rinishida ajraladi */
export function MoneyInput({
  id,
  name,
  value,
  onChange,
  autoFocus,
  invalid,
}: MoneyProps) {
  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={value} />
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="0"
        value={value ? formatMoney(value) : ""}
        onChange={(e) => onChange(parseMoney(e.target.value))}
        className={`field text-2xl font-semibold ${invalid ? "field-error" : ""}`}
      />
      <span className="shrink-0 text-lg text-muted">so'm</span>
    </div>
  );
}

type QtyProps = {
  id: string;
  name: string;
  value: string;
  onChange: (raw: string) => void;
  unit?: string;
  autoFocus?: boolean;
  invalid?: boolean;
};

/** Miqdor: kg va metr kasr bo'lishi mumkin */
export function QtyInput({
  id,
  name,
  value,
  onChange,
  unit,
  autoFocus,
  invalid,
}: QtyProps) {
  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={value} />
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="0"
        value={value ? formatQtyWhileTyping(value) : ""}
        onChange={(e) => onChange(parseQty(e.target.value))}
        className={`field text-2xl font-semibold ${invalid ? "field-error" : ""}`}
      />
      {unit ? (
        <span className="shrink-0 text-lg text-muted">{unit}</span>
      ) : null}
    </div>
  );
}

type DateProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  max: string;
  invalid?: boolean;
};

export function DateField({
  id,
  name,
  value,
  onChange,
  max,
  invalid,
}: DateProps) {
  return (
    <input
      id={id}
      name={name}
      type="date"
      value={value}
      max={max}
      min="2000-01-01"
      onChange={(e) => onChange(e.target.value)}
      className={`field ${invalid ? "field-error" : ""}`}
    />
  );
}

type TextProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  invalid?: boolean;
};

export function TextField({
  id,
  name,
  value,
  onChange,
  placeholder,
  maxLength = 60,
  autoFocus,
  invalid,
}: TextProps) {
  return (
    <input
      id={id}
      name={name}
      type="text"
      autoComplete="off"
      autoFocus={autoFocus}
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`field ${invalid ? "field-error" : ""}`}
    />
  );
}
