import Link from "next/link";
import { requirePoleUser } from "@/lib/pole/session";
import { ROLE_LABELS } from "@/lib/pole/store";
import { signOutPole } from "../actions";

export default async function PortalLayout({ children }: LayoutProps<"/pole">) {
  const user = await requirePoleUser();

  const links = [
    { href: "/pole", label: "Mes fiches", show: true },
    { href: "/pole/validation", label: "Validation", show: user.role === "validator" },
    { href: "/pole/agents", label: "Codes des agents", show: user.isAdmin },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/pole" className="font-bold text-ink">
              Portail du Pôle
            </Link>
            <nav className="flex gap-4 text-sm">
              {links
                .filter((l) => l.show)
                .map((l) => (
                  <Link key={l.href} href={l.href} className="text-ink-soft underline-offset-2 hover:text-ink hover:underline">
                    {l.label}
                  </Link>
                ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-accent-soft px-3 py-1 font-medium text-accent-strong">
              {user.name} · {ROLE_LABELS[user.role]}
            </span>
            <form action={signOutPole}>
              <button type="submit" className="text-ink-soft underline-offset-2 hover:underline">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
