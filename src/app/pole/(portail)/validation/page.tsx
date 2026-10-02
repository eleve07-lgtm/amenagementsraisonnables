import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePoleUser } from "@/lib/pole/session";
import { listSubmittedDrafts } from "@/lib/pole/store";

export default async function ValidationQueuePage() {
  const user = await requirePoleUser();
  if (user.role !== "validator") redirect("/pole");
  const drafts = await listSubmittedDrafts();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-ink">Fiches à valider</h1>
      <p className="mb-6 text-ink-soft">
        Une fiche n&apos;apparaît sur le site qu&apos;après votre validation. Vous ne pouvez pas valider vos
        propres fiches : un deuxième regard est toujours nécessaire.
      </p>

      {drafts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface p-5 text-ink-soft">
          Aucune fiche en attente.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {drafts.map((d) => {
            const own = d.authorId === user.id;
            return (
              <li key={d.id}>
                <Link
                  href={own ? `/pole/fiches/${d.id}` : `/pole/validation/${d.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:border-accent"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {d.content.name}
                      <span className="ml-2 text-sm font-normal text-ink-soft">
                        {d.targetSlug ? "modification d'une fiche en ligne" : "nouvelle fiche"}
                      </span>
                    </p>
                    <p className="text-sm text-ink-soft">
                      Par {d.authorName}
                      {d.submittedAt && `, envoyée le ${new Date(d.submittedAt).toLocaleDateString("fr-BE")}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-accent-strong">
                    {own ? "Votre fiche" : "Relire →"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
