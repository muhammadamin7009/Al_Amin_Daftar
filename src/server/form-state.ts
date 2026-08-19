export type FormState = {
  /** Maydon nomi -> xato matni. Maydon ostida qizil yozuvda chiqadi. */
  errors?: Record<string, string>;
  /** Saqlangach modal yopilishi uchun */
  ok?: boolean;
  /** Har bir javob yangi bo'lsin — bir xil xato ikki marta chiqsa ham sezilsin */
  at?: number;
};

export function fail(errors: Record<string, string>): FormState {
  return { errors, at: Date.now() };
}

export function done(): FormState {
  return { ok: true, at: Date.now() };
}
