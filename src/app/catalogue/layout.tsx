import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/access";
import { leave } from "../actions";

export default async function CatalogueLayout({ children }: LayoutProps<"/catalogue">) {
  const access = await getAccess();
  if (!access) redirect("/");

  const audienceLabel = access.audience === "teacher" ? "Espace institutrices" : "Espace parents";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/catalogue" className="font-bold text-ink">
            Aménagements raisonnables
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-accent-soft px-3 py-1 font-medium text-accent-strong">
              {audienceLabel} · {access.school.name}
            </span>
            <form action={leave}>
              <button type="submit" className="text-ink-soft underline-offset-2 hover:underline">
                Changer de code
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
