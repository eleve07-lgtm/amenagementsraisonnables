"use client";

import { useActionState } from "react";
import { enterCode, type EnterCodeState } from "./actions";

const initialState: EnterCodeState = { error: null };

export function CodeForm() {
  const [state, formAction, pending] = useActionState(enterCode, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="code" className="text-sm font-medium text-ink-soft">
        Code d&apos;accès
      </label>
      <input
        id="code"
        name="code"
        required
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="Ex. : SOLEIL-INST"
        className="rounded-lg border border-line bg-surface px-4 py-3 text-lg tracking-wide uppercase outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Vérification…" : "Entrer"}
      </button>
    </form>
  );
}
