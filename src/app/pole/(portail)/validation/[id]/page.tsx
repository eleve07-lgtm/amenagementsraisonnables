import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DisorderSheet } from "@/components/disorder-sheet";
import { requirePoleUser } from "@/lib/pole/session";
import { toDisorder } from "@/lib/pole/sheet";
import { getDisorder, getDraft } from "@/lib/pole/store";
import { ReviewForm } from "./review-form";

export default async function ReviewPage({ params }: PageProps<"/pole/validation/[id]">) {
  const { id } = await params;
  const user = await requirePoleUser();
  if (user.role !== "validator") redirect("/pole");
  const draft = await getDraft(id);
  if (!draft || draft.status !== "submitted") notFound();
  if (draft.authorId === user.id) redirect(`/pole/fiches/${draft.id}`);

  // Pour une modification, on montre aussi la version actuellement en ligne.
  const current = draft.targetSlug ? await getDisorder(draft.targetSlug) : undefined;

  return (
    <div>
      <Link href="/pole/validation" className="text-sm text-ink-soft underline-offset-2 hover:underline">
        ← Fiches à valider
      </Link>
      <p className="mt-3 mb-6 text-ink-soft">
        {draft.targetSlug ? "Modification" : "Nouvelle fiche"} proposée par <strong>{draft.authorName}</strong>.
      </p>

      <div className={`grid gap-6 ${current ? "lg:grid-cols-2" : "mx-auto max-w-3xl"}`}>
        <section className="min-w-0 rounded-2xl border-2 border-accent bg-background p-6">
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">Version proposée</p>
          <DisorderSheet disorder={toDisorder(draft.slug, draft.content)} sections={["teacher", "parent"]} />
        </section>
        {current && (
          <section className="min-w-0 rounded-2xl border border-line bg-background p-6 opacity-80">
            <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Version en ligne</p>
            <DisorderSheet disorder={current} sections={["teacher", "parent"]} />
          </section>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <ReviewForm draftId={draft.id} />
      </div>
    </div>
  );
}
