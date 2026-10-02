import Link from "next/link";
import { notFound } from "next/navigation";
import { DisorderSheet } from "@/components/disorder-sheet";
import { requirePoleUser } from "@/lib/pole/session";
import { toDisorder } from "@/lib/pole/sheet";
import { getDraft } from "@/lib/pole/store";
import { deleteDraft } from "../../../actions";
import { StatusBadge } from "../../status-badge";
import { SheetEditor } from "../sheet-editor";

export default async function DraftPage({ params }: PageProps<"/pole/fiches/[id]">) {
  const { id } = await params;
  const user = await requirePoleUser();
  const draft = await getDraft(id);
  // Un agent ne voit que ses fiches ; un validateur peut consulter toutes les fiches.
  if (!draft || (draft.authorId !== user.id && user.role !== "validator")) notFound();

  const editable = draft.authorId === user.id && (draft.status === "draft" || draft.status === "returned");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/pole" className="text-sm text-ink-soft underline-offset-2 hover:underline">
        ← Mes fiches
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">
          {draft.targetSlug ? "Modification de la fiche" : "Nouvelle fiche"} « {draft.content.name} »
        </h1>
        <StatusBadge status={draft.status} />
      </div>

      {editable ? (
        <>
          <SheetEditor
            draftId={draft.id}
            targetSlug={draft.targetSlug}
            initial={draft.content}
            reviewNote={draft.status === "returned" ? `${draft.reviewerName} : ${draft.reviewComment}` : null}
          />
          <form action={deleteDraft} className="mt-6 border-t border-line pt-6">
            <input type="hidden" name="draftId" value={draft.id} />
            <button type="submit" className="text-sm text-danger underline-offset-2 hover:underline">
              Supprimer ce brouillon
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mb-6 rounded-xl bg-warn-soft px-4 py-3 text-sm text-ink">
            {draft.status === "submitted"
              ? "Cette fiche attend la décision d'un validateur. Elle ne peut plus être modifiée."
              : draft.status === "published"
                ? `Fiche publiée par ${draft.reviewerName}.`
                : "Cette fiche ne peut être modifiée que par son auteur."}
          </p>
          <div className="rounded-2xl border border-line bg-background p-6">
            <DisorderSheet disorder={toDisorder(draft.slug, draft.content)} sections={["teacher", "parent"]} />
          </div>
        </>
      )}
    </div>
  );
}
