"use client";

import { useActionState } from "react";
import { createAgent, type AgentFormState } from "../../actions";

const inputClass =
  "rounded-lg border border-line px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

// Crée un agent et lui attribue un code personnel, généré au hasard.
export function AgentForm() {
  const [state, formAction, pending] = useActionState<AgentFormState, FormData>(createAgent, {
    error: null,
    message: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <p className="font-semibold text-ink">Créer un code pour un agent</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input name="name" placeholder="Nom de l'agent" aria-label="Nom de l'agent" required className={inputClass} />
        <select name="role" aria-label="Rôle" className={inputClass}>
          <option value="agent">Agent</option>
          <option value="validator">Validateur</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.message && <p className="rounded-lg bg-accent-soft px-3 py-2 font-mono text-accent-strong">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Créer le code
      </button>
    </form>
  );
}
