import { redirect } from "next/navigation";
import { getAccess } from "@/lib/access";
import { CodeForm } from "./code-form";

export default async function Home() {
  if (await getAccess()) redirect("/catalogue");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
          Aménagements raisonnables
        </p>
        <h1 className="mb-3 text-3xl font-bold text-ink">
          Des outils concrets pour chaque besoin
        </h1>
        <p className="mb-8 text-ink-soft">
          Entrez le code reçu de votre école pour accéder au catalogue.
        </p>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <CodeForm />
        </div>
      </div>
    </main>
  );
}
