"use client";

import { useActionState, useState } from "react";
import { platformLoginAction } from "@/server/platform-actions";
import type { FormState } from "@/server/form-state";

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
        <p className="rounded-2xl bg-debt-soft px-4 py-3 text-base text-debt">
          {errors.form}
        </p>
      ) : null}

      <div>
        <label htmlFor="login" className="label">
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
          className={`field ${errors.login ? "field-error" : ""}`}
        />
        {errors.login ? <p className="error-text">{errors.login}</p> : null}
      </div>

      <div>
        <label htmlFor="password" className="label">
          Parol
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`field ${errors.password ? "field-error" : ""}`}
        />
        {errors.password ? <p className="error-text">{errors.password}</p> : null}
      </div>

      <button type="submit" disabled={pending} className="btn-dark">
        {pending ? "Tekshirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
