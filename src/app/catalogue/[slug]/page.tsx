import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccess } from "@/lib/access";
import { findDisorder } from "@/lib/demo-data";

export default async function DisorderPage({ params }: PageProps<"/catalogue/[slug]">) {
  const { slug } = await params;
  const disorder = findDisorder(slug);
  if (!disorder) notFound();

  const access = await getAccess();
  const isTeacher = access?.audience === "teacher";
  const accommodations = isTeacher ? disorder.teacher : disorder.parent;

  return (
    <article>
      <Link href="/catalogue" className="text-sm text-ink-soft underline-offset-2 hover:underline">
        ← Tous les troubles
      </Link>
      <h1 className="mt-3 mb-2 text-3xl font-bold text-ink">{disorder.name}</h1>
      <p className="mb-6 text-ink-soft">{disorder.summary}</p>

      <h2 className="mb-4 text-lg font-semibold text-ink">
        {isTeacher ? "En classe" : "À la maison"}
      </h2>
      <ol className="flex flex-col gap-3">
        {accommodations.map((a) => (
          <li key={a.title} className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-1 font-semibold text-ink">{a.title}</p>
            <p className="text-ink-soft">{a.detail}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 rounded-lg bg-warn-soft px-4 py-3 text-sm text-ink-soft">
        Contenu d&apos;exemple — à remplacer par le catalogue validé.
      </p>
    </article>
  );
}
