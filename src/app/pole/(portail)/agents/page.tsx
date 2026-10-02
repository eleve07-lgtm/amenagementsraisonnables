import { redirect } from "next/navigation";
import { requirePoleUser } from "@/lib/pole/session";
import { listAgents, ROLE_LABELS } from "@/lib/pole/store";
import { setAgentActive } from "../../actions";
import { AgentForm } from "./agent-form";

export default async function AgentsPage() {
  const user = await requirePoleUser();
  if (!user.isAdmin) redirect("/pole");
  const agents = await listAgents();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-ink">Codes des agents</h1>
      <p className="mb-6 text-ink-soft">
        Chaque agent reçoit un code personnel pour entrer dans le portail. Les validateurs peuvent
        publier les fiches des autres agents.
      </p>

      <AgentForm />

      <ul className="mt-6 flex flex-col gap-2">
        {agents.map((a) => (
          <li
            key={a.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 ${a.active ? "" : "opacity-60"}`}
          >
            <div>
              <p className="font-semibold text-ink">
                {a.name} <span className="text-sm font-normal text-ink-soft">· {ROLE_LABELS[a.role]}</span>
              </p>
              <p className="font-mono text-sm tracking-wider text-ink-soft">{a.code}</p>
            </div>
            <form action={setAgentActive}>
              <input type="hidden" name="agentId" value={a.id} />
              <input type="hidden" name="active" value={String(!a.active)} />
              <button type="submit" className="text-sm text-ink-soft underline-offset-2 hover:underline">
                {a.active ? "Désactiver le code" : "Réactiver le code"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
