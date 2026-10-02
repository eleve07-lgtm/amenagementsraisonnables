import { STATUS_LABELS, type DraftStatus } from "@/lib/pole/sheet";

const STYLES: Record<DraftStatus, string> = {
  draft: "bg-background text-ink-soft border-line",
  submitted: "bg-warn-soft text-ink border-warn-soft",
  returned: "bg-danger/10 text-danger border-danger/30",
  published: "bg-accent-soft text-accent-strong border-accent-soft",
};

export function StatusBadge({ status }: { status: DraftStatus }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
