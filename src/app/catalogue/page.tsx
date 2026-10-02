import { listPublishedDisorders } from "@/lib/catalogue";
import { DisorderSearch } from "./disorder-search";

export default async function CataloguePage() {
  const items = (await listPublishedDisorders()).map(({ slug, name, summary }) => ({ slug, name, summary }));

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-ink">Rechercher un trouble</h1>
      <p className="mb-6 text-ink-soft">
        Choisissez un trouble pour voir les aménagements et outils recommandés.
      </p>
      <DisorderSearch items={items} />
    </div>
  );
}
