"use client";

import { useActionState } from "react";
import { reviewDraft, type ReviewState } from "../../../actions";

export function ReviewForm({ draftId }: { draftId: string }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(reviewDraft, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <input type="hidden" name="draftId" value={draftId} />
      <label className="flex flex-col gap-1">
        <span className="font-semibold text-ink">Commentaire pour l&apos;auteur</span>
        <span className="text-xs text-ink-soft">Obligatoire pour renvoyer la fiche, facultatif pour la publier.</span>
        <textarea
          name="comment"
          rows={3}
          maxLength={2000}
          className="rounded-lg border border-line px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </label>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="publish"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
        >
          Valider et publier
        </button>
        <button
          type="submit"
          name="decision"
          value="return"
          disabled={pending}
          className="rounded-lg border border-danger px-4 py-2 font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          Renvoyer pour correction
        </button>
      </div>
    </form>
  );
}
