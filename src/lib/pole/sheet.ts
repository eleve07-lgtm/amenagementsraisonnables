import type { Accommodation, Disorder } from "@/lib/demo-data";
import type { Game } from "@/lib/tsa-games";

// Fiche proposée par un agent du Pôle : son contenu, son état, et sa vérification.
// Fichier partagé navigateur / serveur : aucun accès au stockage ici.

export type SheetContent = Omit<Disorder, "slug" | "games"> & { games: Game[] };

export type DraftStatus = "draft" | "submitted" | "returned" | "published";

export type Draft = {
  id: string;
  // Fiche en ligne que ce brouillon modifie ; null pour une nouvelle fiche.
  targetSlug: string | null;
  slug: string;
  content: SheetContent;
  status: DraftStatus;
  authorId: string;
  authorName: string;
  reviewComment: string | null;
  reviewerName: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
};

export const STATUS_LABELS: Record<DraftStatus, string> = {
  draft: "Brouillon",
  submitted: "En attente de validation",
  returned: "Renvoyée pour correction",
  published: "Publiée",
};

export const EMPTY_CONTENT: SheetContent = {
  name: "",
  summary: "",
  difficulties: [],
  teacher: [],
  parent: [],
  games: [],
};

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// --- Vérification du contenu envoyé par le navigateur -----------------------------

const LIMITS = { name: 80, summary: 500, title: 150, detail: 1500, line: 400 };

class SheetError extends Error {}

function text(value: unknown, max: number, label: string): string {
  const t = typeof value === "string" ? value.trim() : "";
  if (t.length > max) throw new SheetError(`${label} : ${max} caractères maximum.`);
  return t;
}

function lines(value: unknown, label: string, maxItems = 30): string[] {
  const items = (Array.isArray(value) ? value : [])
    .map((v) => text(v, LIMITS.line, label))
    .filter(Boolean);
  if (items.length > maxItems) throw new SheetError(`${label} : ${maxItems} lignes maximum.`);
  return items;
}

function pairs(value: unknown, label: string, maxItems = 30): Accommodation[] {
  const items = (Array.isArray(value) ? value : [])
    .map((v) => {
      const o = (v ?? {}) as Record<string, unknown>;
      return { title: text(o.title, LIMITS.title, label), detail: text(o.detail, LIMITS.detail, label) };
    })
    .filter((p) => p.title || p.detail);
  if (items.some((p) => !p.title)) throw new SheetError(`${label} : chaque élément doit avoir un titre.`);
  if (items.length > maxItems) throw new SheetError(`${label} : ${maxItems} éléments maximum.`);
  return items;
}

function games(value: unknown): Game[] {
  const items = (Array.isArray(value) ? value : []).map((v) => {
    const o = (v ?? {}) as Record<string, unknown>;
    const game: Game = {
      title: text(o.title, LIMITS.title, "Jeux"),
      materials: lines(o.materials, "Matériel"),
      steps: lines(o.steps, "Réalisation"),
    };
    // Champs facultatifs : absents plutôt que vides (Firestore refuse « undefined »).
    const place = text(o.place, LIMITS.title, "Lieu");
    if (place) game.place = place;
    if (o.ordered === true) game.ordered = true;
    const tips = lines(o.tips, "Conseils", 10);
    if (tips.length > 0) game.tips = tips;
    return game;
  });
  const kept = items.filter((g) => g.title || g.materials.length > 0 || g.steps.length > 0);
  if (kept.some((g) => !g.title)) throw new SheetError("Jeux : chaque jeu doit avoir un titre.");
  if (kept.length > 40) throw new SheetError("Jeux : 40 maximum.");
  return kept;
}

// `forSubmission` : plus exigeant quand la fiche part en validation.
export function parseSheetContent(
  raw: unknown,
  forSubmission: boolean,
): { content: SheetContent } | { error: string } {
  try {
    const o = (raw ?? {}) as Record<string, unknown>;
    const content: SheetContent = {
      name: text(o.name, LIMITS.name, "Nom du trouble"),
      summary: text(o.summary, LIMITS.summary, "Résumé"),
      difficulties: pairs(o.difficulties, "Difficultés"),
      teacher: pairs(o.teacher, "En classe"),
      parent: pairs(o.parent, "À la maison"),
      games: games(o.games),
    };
    if (content.name.length < 2) throw new SheetError("Indiquez le nom du trouble.");
    if (!slugify(content.name)) throw new SheetError("Le nom du trouble doit contenir des lettres.");
    if (forSubmission && content.summary.length < 10) {
      throw new SheetError("Avant l'envoi en validation, rédigez un résumé (10 caractères minimum).");
    }
    return { content };
  } catch (err) {
    if (err instanceof SheetError) return { error: err.message };
    throw err;
  }
}

// Une fiche publiée a la même forme qu'une fiche du catalogue.
export function toDisorder(slug: string, content: SheetContent): Disorder {
  return { slug, ...content };
}
