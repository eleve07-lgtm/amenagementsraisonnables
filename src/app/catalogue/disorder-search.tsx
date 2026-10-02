"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { slug: string; name: string; summary: string };

// Recherche insensible aux accents et à la casse.
function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function DisorderSearch({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const results = q
    ? items.filter((i) => normalize(`${i.name} ${i.summary}`).includes(q))
    : items;

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ex. : dyslexie, attention…"
        aria-label="Rechercher un trouble"
        className="rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {results.length === 0 ? (
        <p className="text-ink-soft">Aucun trouble ne correspond à « {query} ».</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/catalogue/${item.slug}`}
                className="block h-full rounded-xl border border-line bg-surface p-5 transition hover:border-accent hover:shadow-sm"
              >
                <span className="mb-1 block text-lg font-semibold text-ink">{item.name}</span>
                <span className="text-sm text-ink-soft">{item.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
