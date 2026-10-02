import type { Accommodation, Disorder } from "@/lib/demo-data";
import { GameCard } from "./game-card";

// Corps d'une fiche, tel que le public le voit. Utilisé par le catalogue
// et par l'aperçu du portail du Pôle (pour que l'aperçu soit fidèle).

type Section = "teacher" | "parent";

const SECTION_TITLES: Record<Section, string> = {
  teacher: "En classe",
  parent: "À la maison",
};

function AccommodationList({ title, items }: { title: string; items: Accommodation[] }) {
  return (
    <>
      <h2 className="mt-8 mb-4 text-lg font-semibold text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface p-5 text-ink-soft">
          Les aménagements de cette fiche sont en préparation.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((a, i) => (
            <li key={`${a.title}-${i}`} className="rounded-xl border border-line bg-surface p-5">
              <p className="mb-1 font-semibold text-ink">{a.title}</p>
              <p className="whitespace-pre-line text-ink-soft">{a.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

export function DisorderSheet({ disorder, sections }: { disorder: Disorder; sections: Section[] }) {
  return (
    <>
      <h1 className="mt-3 mb-2 text-3xl font-bold text-ink">{disorder.name || "Sans nom"}</h1>
      <p className="mb-6 whitespace-pre-line text-ink-soft">{disorder.summary}</p>

      <h2 className="mb-4 text-lg font-semibold text-ink">Difficultés rencontrées</h2>
      {disorder.difficulties.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface p-5 text-ink-soft">
          Les difficultés de cette fiche sont en préparation.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {disorder.difficulties.map((d, i) => (
            <li key={`${d.title}-${i}`} className="rounded-xl border-l-4 border-accent bg-accent-soft p-5">
              <p className="mb-1 font-semibold text-ink">{d.title}</p>
              <p className="whitespace-pre-line text-ink-soft">{d.detail}</p>
            </li>
          ))}
        </ul>
      )}

      {sections.map((s) => (
        <AccommodationList key={s} title={SECTION_TITLES[s]} items={disorder[s]} />
      ))}

      {disorder.games && disorder.games.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 text-lg font-semibold text-ink">Jeux sensori-moteurs d&apos;occupation</h2>
          <p className="mb-4 text-sm text-ink-soft">
            {disorder.games.length} jeux à proposer en classe comme à la maison.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {disorder.games.map((g, i) => (
              <GameCard key={`${g.title}-${i}`} game={g} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
