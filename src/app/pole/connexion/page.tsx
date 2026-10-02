import { redirect } from "next/navigation";
import { getPoleUser } from "@/lib/pole/session";
import { PoleCodeForm } from "./code-form";

export default async function PoleLoginPage() {
  if (await getPoleUser()) redirect("/pole");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="mb-2 text-sm font-semibold tracking-wide text-accent uppercase">
          Portail du Pôle
        </p>
        <h1 className="mb-3 text-3xl font-bold text-ink">Rédiger et valider les fiches</h1>
        <p className="mb-8 text-ink-soft">Entrez le code personnel reçu de l&apos;administrateur du portail.</p>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <PoleCodeForm />
        </div>
      </div>
    </main>
  );
}
