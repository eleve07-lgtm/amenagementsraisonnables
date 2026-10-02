"use client";

import { useActionState } from "react";
import { enterPoleCode, type CodeState } from "../actions";

export function PoleCodeForm() {
  const [state, formAction, pending] = useActionState<CodeState, FormData>(enterPoleCode, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label htmlFor="pole-code" className="text-sm font-medium text-ink">
        Code personnel
      </label>
      <input
        id="pole-code"
        name="code"
        required
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="Ex. : POLE-ABC123"
        className="rounded-lg border border-line px-4 py-3 font-mono tracking-wider uppercase outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-3 font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Vérification…" : "Entrer"}
      </button>
    </form>
  );
}
