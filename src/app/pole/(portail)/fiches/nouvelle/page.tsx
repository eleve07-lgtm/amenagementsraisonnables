import Link from "next/link";
import { notFound } from "next/navigation";
import { EMPTY_CONTENT, type SheetContent } from "@/lib/pole/sheet";
import { getDisorder } from "@/lib/pole/store";
import { SheetEditor } from "../sheet-editor";

// Nouvelle fiche, ou modification d'une fiche en ligne (?depuis=slug).
// Rien n'est enregistré avant le premier clic sur « Enregistrer ».
export default async function NewSheetPage({ searchParams }: PageProps<"/pole/fiches/nouvelle">) {
  const { depuis } = await searchParams;
  const sourceSlug = typeof depuis === "string" ? depuis : null;

  let initial: SheetContent = EMPTY_CONTENT;
  if (sourceSlug) {
    const source = await getDisorder(sourceSlug);
    if (!source) notFound();
    initial = {
      name: source.name,
      summary: source.summary,
      difficulties: source.difficulties,
      teacher: source.teacher,
      parent: source.parent,
      games: source.games ?? [],
    };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/pole" className="text-sm text-ink-soft underline-offset-2 hover:underline">
        ← Mes fiches
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-ink">
        {sourceSlug ? `Modifier la fiche « ${initial.name} »` : "Nouvelle fiche"}
      </h1>
      {sourceSlug && (
        <p className="mb-6 rounded-xl bg-accent-soft px-4 py-3 text-sm text-ink">
          La fiche actuelle reste en ligne tant que votre modification n&apos;est pas validée.
        </p>
      )}
      <SheetEditor draftId={null} targetSlug={sourceSlug} initial={initial} reviewNote={null} />
    </div>
  );
}
