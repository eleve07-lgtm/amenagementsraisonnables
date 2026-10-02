import Link from "next/link";
import { requirePoleUser } from "@/lib/pole/session";
import { listDisorders, listDraftsByAuthor } from "@/lib/pole/store";
import { StatusBadge } from "./status-badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PoleHomePage() {
  const user = await requirePoleUser();
  const [drafts, published] = await Promise.all([listDraftsByAuthor(user.id), listDisorders()]);
  const inProgress = drafts.filter((d) => d.status !== "published");
  // Une fiche en ligne déjà en cours de modification par cet agent : on renvoie vers ce brouillon.
  const draftByTarget = new Map(inProgress.filter((d) => d.targetSlug).map((d) => [d.targetSlug, d.id]));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">Mes fiches</h1>
          <Link href="/pole/fiches/nouvelle" className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-strong">
            + Nouvelle fiche
          </Link>
        </div>

        {inProgress.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface p-5 text-ink-soft">
            Aucune fiche en cours. Créez une nouvelle fiche, ou proposez une modification d&apos;une fiche en ligne.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {inProgress.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/pole/fiches/${d.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:border-accent"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {d.content.name}
                      {d.targetSlug && <span className="ml-2 text-sm font-normal text-ink-soft">(modification)</span>}
                    </p>
                    <p className="text-sm text-ink-soft">Modifiée le {formatDate(d.updatedAt)}</p>
                    {d.status === "returned" && d.reviewComment && (
                      <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-ink">
                        <strong>{d.reviewerName} :</strong> {d.reviewComment}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-ink">Fiches en ligne</h2>
        {published.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface p-5 text-ink-soft">
            Aucune fiche n&apos;est encore publiée.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {published.map((p) => {
              const existingDraft = draftByTarget.get(p.slug);
              return (
                <li key={p.slug} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
                  <span className="font-semibold text-ink">{p.name}</span>
                  <Link
                    href={existingDraft ? `/pole/fiches/${existingDraft}` : `/pole/fiches/nouvelle?depuis=${p.slug}`}
                    className="shrink-0 text-sm font-semibold text-accent-strong underline-offset-2 hover:underline"
                  >
                    {existingDraft ? "Reprendre ma modification" : "Proposer une modification"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
