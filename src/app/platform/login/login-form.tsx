"use client";

import { useActionState, useState } from "react";
import { platformLoginAction } from "@/server/platform-actions";
import type { FormState } from "@/server/form-state";

const FIELD =
  "h-12 w-full rounded-xl border border-plat-line bg-plat-bg px-4 text-base text-plat-ink outline-none focus:border-plat-accent";
const LABEL =
  "mb-2 block text-[11px] uppercase tracking-[0.12em] text-plat-faint";

export function PlatformLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    platformLoginAction,
    {},
  );
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const errors = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      {errors.form ? (
        <p className="rounded-xl border border-plat-dead/40 bg-plat-dead/10 px-4 py-3 text-sm text-plat-dead">
          {errors.form}
        </p>
      ) : null}

      <div>
        <label htmlFor="login" className={LABEL}>
          Login
        </label>
        <input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          autoFocus
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className={`${FIELD} ${errors.login ? "border-plat-dead" : ""}`}
        />
        {errors.login ? (
          <p className="mt-2 text-sm text-plat-dead">{errors.login}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className={LABEL}>
          Parol
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${FIELD} ${errors.password ? "border-plat-dead" : ""}`}
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-plat-dead">{errors.password}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-12 rounded-full bg-plat-accent text-base font-semibold text-plat-bg hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "Tekshirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
