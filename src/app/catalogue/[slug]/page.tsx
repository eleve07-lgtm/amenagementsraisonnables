import Link from "next/link";
import { notFound } from "next/navigation";
import { DisorderSheet } from "@/components/disorder-sheet";
import { getAccess } from "@/lib/access";
import { getPublishedDisorder } from "@/lib/catalogue";
import { AssistantPanel } from "./assistant-panel";

export default async function DisorderPage({ params }: PageProps<"/catalogue/[slug]">) {
  const { slug } = await params;
  const disorder = await getPublishedDisorder(slug);
  if (!disorder) notFound();

  const access = await getAccess();
  const audience = access?.audience === "teacher" ? "teacher" : "parent";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <article className="min-w-0">
        <Link href="/catalogue" className="text-sm text-ink-soft underline-offset-2 hover:underline">
          ← Tous les troubles
        </Link>
        <DisorderSheet disorder={disorder} sections={[audience]} />
      </article>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <AssistantPanel slug={disorder.slug} audience={audience} />
      </aside>

      {/* Sur petit écran, l'assistant est en bas de la fiche : ce bouton y mène directement. */}
      <a
        href="#assistant"
        className="fixed right-4 bottom-4 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-accent-strong lg:hidden"
      >
        Une question ?
      </a>
    </div>
  );
}
