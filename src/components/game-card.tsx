import type { Game } from "@/lib/tsa-games";

export function GameCard({ game }: { game: Game }) {
  const StepsList = game.ordered ? "ol" : "ul";

  return (
    <li className="flex flex-col gap-3 rounded-2xl border-2 border-play bg-surface p-5">
      <div>
        <h3 className="text-lg font-semibold text-ink">{game.title}</h3>
        {game.place && <p className="text-sm text-ink-soft">{game.place}</p>}
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-play-strong">Matériel</p>
        <ul className="list-disc pl-5 text-sm text-ink-soft">
          {game.materials.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-play-strong">Réalisation</p>
        <StepsList
          className={`flex flex-col gap-1 text-sm text-ink-soft ${game.ordered ? "list-decimal pl-5" : "list-none"}`}
        >
          {game.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </StepsList>
      </div>

      {game.tips && (
        <ul className="flex flex-col gap-1 rounded-lg bg-warn-soft px-3 py-2 text-sm text-ink-soft">
          {game.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </li>
  );
}
