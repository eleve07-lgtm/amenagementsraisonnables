"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Audience } from "@/lib/demo-data";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Nombre de messages renvoyés à l'IA à chaque question (borne le coût).
const HISTORY_LIMIT = 12;

const SUGGESTIONS: Record<Audience, string[]> = {
  teacher: [
    "Comment repérer ces difficultés en classe ?",
    "Comment en parler avec les parents ?",
  ],
  parent: [
    "Comment expliquer ce trouble à mon enfant ?",
    "Que puis-je demander à l'école ?",
  ],
};

export function AssistantPanel({ slug, audience }: { slug: string; audience: Audience }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || pending) return;

    const conversation: ChatMessage[] = [...messages, { role: "user", content: text }];
    let history = conversation.slice(-HISTORY_LIMIT);
    while (history[0]?.role === "assistant") history = history.slice(1);

    setMessages([...conversation, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setPending(true);

    const appendToAnswer = (chunk: string) =>
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
      });

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "L'assistant est indisponible pour le moment.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let received = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        received += chunk;
        appendToAnswer(chunk);
      }
      if (!received.trim()) throw new Error("Pas de réponse. Réessayez.");
    } catch (err) {
      // On retire la question restée sans réponse et on la remet dans le champ.
      setMessages(conversation.slice(0, -1));
      setInput(text);
      setError(err instanceof Error ? err.message : "L'assistant est indisponible pour le moment.");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <section
      id="assistant"
      aria-label="Assistant"
      className="flex flex-col rounded-2xl border border-line bg-surface lg:max-h-[calc(100vh-3rem)]"
    >
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold text-ink">Une question ?</h2>
        <p className="text-sm text-ink-soft">L&apos;assistant répond à partir de cette fiche.</p>
      </div>

      <div ref={listRef} aria-live="polite" className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-2">
            {SUGGESTIONS[audience].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                disabled={pending}
                className="rounded-xl border border-accent bg-accent-soft px-3 py-2 text-left text-sm text-accent-strong hover:bg-accent hover:text-white disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="self-end rounded-xl bg-accent px-3 py-2 text-sm whitespace-pre-wrap text-white">
                {m.content}
              </p>
            ) : (
              <p key={i} className="rounded-xl bg-accent-soft px-3 py-2 text-sm whitespace-pre-wrap text-ink">
                {m.content || <span className="text-ink-soft">L&apos;assistant réfléchit…</span>}
              </p>
            ),
          )
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 border-t border-line px-5 py-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        <label htmlFor="assistant-question" className="sr-only">
          Votre question
        </label>
        <textarea
          id="assistant-question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void ask(input);
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder="Posez votre question…"
          className="resize-none rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
        >
          {pending ? "Réponse en cours…" : "Envoyer"}
        </button>
        <p className="text-xs text-ink-soft">
          Réponses générées par une IA : elles peuvent contenir des erreurs et ne remplacent pas
          l&apos;avis d&apos;un professionnel. N&apos;écrivez pas le nom de l&apos;enfant.
        </p>
      </form>
    </section>
  );
}
