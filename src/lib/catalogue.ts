import type { Disorder } from "./demo-data";
import { getDisorder, listDisorders } from "./pole/store";

// Fiches visibles par le public : uniquement les fiches publiées (validées par le Pôle).

export async function listPublishedDisorders(): Promise<Disorder[]> {
  return listDisorders();
}

export async function getPublishedDisorder(slug: string): Promise<Disorder | undefined> {
  return getDisorder(slug);
}
