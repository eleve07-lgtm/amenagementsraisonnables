"use client";

import { useActionState, useState } from "react";
import { DisorderSheet } from "@/components/disorder-sheet";
import type { Accommodation } from "@/lib/demo-data";
import { toDisorder, type SheetContent } from "@/lib/pole/sheet";
import type { Game } from "@/lib/tsa-games";
import { saveDraft, type SaveState } from "../../actions";

// Éditeur de fiche en pleine page. Le contenu est envoyé au serveur en un seul bloc
// (champ caché « content »), vérifié là-bas avant tout enregistrement.

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
      {children}
    </label>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="self-start text-sm text-danger underline-offset-2 hover:underline">
      {label}
    </button>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-lg border border-dashed border-accent px-3 py-2 text-sm font-semibold text-accent-strong hover:bg-accent-soft"
    >
      {label}
    </button>
  );
}

// Liste d'éléments « titre + explication » (difficultés, aménagements).
function PairList({
  title,
  items,
  onChange,
  addLabel,
}: {
  title: string;
  items: Accommodation[];
  onChange: (items: Accommodation[]) => void;
  addLabel: string;
}) {
  const update = (i: number, patch: Partial<Accommodation>) =>
    onChange(items.map((item, j) => (j === i ? { ...item, ...patch } : item)));

  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <legend className="px-1 text-lg font-semibold text-ink">{title}</legend>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl bg-background p-3">
          <input
            value={item.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="Titre"
            aria-label={`${title} — titre ${i + 1}`}
            className={`${inputClass} font-semibold`}
          />
          <textarea
            value={item.detail}
            onChange={(e) => update(i, { detail: e.target.value })}
            placeholder="Explication"
            aria-label={`${title} — explication ${i + 1}`}
            rows={2}
            className={inputClass}
          />
          <RemoveButton onClick={() => onChange(items.filter((_, j) => j !== i))} label="Retirer" />
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, { title: "", detail: "" }])} label={addLabel} />
    </fieldset>
  );
}

// Une ligne de texte = un élément de liste (matériel, étapes, conseils).
function LinesField({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <Field label={label} hint="Un élément par ligne">
      <textarea
        value={values.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        rows={Math.max(3, values.length + 1)}
        className={inputClass}
      />
    </Field>
  );
}

function GameList({ games, onChange }: { games: Game[]; onChange: (games: Game[]) => void }) {
  const update = (i: number, patch: Partial<Game>) =>
    onChange(games.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <legend className="px-1 text-lg font-semibold text-ink">Jeux sensori-moteurs (facultatif)</legend>
      {games.map((g, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border-2 border-play bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom du jeu">
              <input value={g.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Lieu (facultatif)">
              <input value={g.place ?? ""} onChange={(e) => update(i, { place: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <LinesField label="Matériel" values={g.materials} onChange={(materials) => update(i, { materials })} />
          <LinesField label="Réalisation" values={g.steps} onChange={(steps) => update(i, { steps })} />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={g.ordered ?? false} onChange={(e) => update(i, { ordered: e.target.checked })} />
            Étapes numérotées (recette, ordre à respecter)
          </label>
          <LinesField label="Conseils (facultatif)" values={g.tips ?? []} onChange={(tips) => update(i, { tips })} />
          <RemoveButton onClick={() => onChange(games.filter((_, j) => j !== i))} label="Retirer ce jeu" />
        </div>
      ))}
      <AddButton onClick={() => onChange([...games, { title: "", materials: [], steps: [] }])} label="+ Ajouter un jeu" />
    </fieldset>
  );
}

export function SheetEditor({
  draftId,
  targetSlug,
  initial,
  reviewNote,
}: {
  draftId: string | null;
  targetSlug: string | null;
  initial: SheetContent;
  reviewNote: string | null;
}) {
  const [content, setContent] = useState<SheetContent>(initial);
  const [preview, setPreview] = useState(false);
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveDraft, {
    error: null,
    savedAt: null,
  });

  const set = <K extends keyof SheetContent>(key: K, value: SheetContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="draftId" value={draftId ?? ""} />
      <input type="hidden" name="targetSlug" value={targetSlug ?? ""} />
      <input type="hidden" name="content" value={JSON.stringify(content)} />

      {reviewNote && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-ink">
          <strong>À corriger :</strong> {reviewNote}
        </p>
      )}

      <div className="flex gap-2">
        {[false, true].map((isPreview) => (
          <button
            key={String(isPreview)}
            type="button"
            onClick={() => setPreview(isPreview)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              preview === isPreview ? "bg-ink text-white" : "border border-line bg-surface text-ink-soft"
            }`}
          >
            {isPreview ? "Aperçu" : "Rédaction"}
          </button>
        ))}
      </div>

      {preview ? (
        <div className="rounded-2xl border border-line bg-background p-6">
          <p className="mb-4 text-sm text-ink-soft">
            Aperçu : les parents voient « À la maison », les institutrices « En classe ».
          </p>
          <DisorderSheet disorder={toDisorder(targetSlug ?? "apercu", content)} sections={["teacher", "parent"]} />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
            <Field label="Nom du trouble">
              <input value={content.name} onChange={(e) => set("name", e.target.value)} maxLength={80} className={`${inputClass} text-lg font-semibold`} />
            </Field>
            <Field label="Résumé" hint="Une ou deux phrases, affichées sous le nom du trouble">
              <textarea value={content.summary} onChange={(e) => set("summary", e.target.value)} rows={3} maxLength={500} className={inputClass} />
            </Field>
          </div>
          <PairList title="Difficultés rencontrées" items={content.difficulties} onChange={(v) => set("difficulties", v)} addLabel="+ Ajouter une difficulté" />
          <PairList title="En classe (institutrices)" items={content.teacher} onChange={(v) => set("teacher", v)} addLabel="+ Ajouter un aménagement" />
          <PairList title="À la maison (parents)" items={content.parent} onChange={(v) => set("parent", v)} addLabel="+ Ajouter un aménagement" />
          <GameList games={content.games} onChange={(v) => set("games", v)} />
        </>
      )}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-line bg-background/95 py-4">
        <button
          type="submit"
          name="intent"
          value="save"
          disabled={pending}
          className="rounded-lg border border-accent bg-surface px-4 py-2 font-semibold text-accent-strong hover:bg-accent-soft disabled:opacity-50"
        >
          Enregistrer le brouillon
        </button>
        <button
          type="submit"
          name="intent"
          value="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
        >
          Envoyer en validation
        </button>
        {pending && <span className="text-sm text-ink-soft">Enregistrement…</span>}
        {!pending && state.error && <span className="text-sm text-danger">{state.error}</span>}
        {!pending && !state.error && state.savedAt && (
          <span className="text-sm text-ink-soft">
            Enregistré à {new Date(state.savedAt).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </form>
  );
}
