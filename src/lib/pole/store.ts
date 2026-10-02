import { promises as fs } from "node:fs";
import path from "node:path";
import { disorders as demoDisorders, type Disorder } from "@/lib/demo-data";
import type { Draft } from "./sheet";

// Stockage du prototype : un seul fichier JSON dans le dossier du site (data/pole.json).
//   disorders  fiches publiées, lues par le catalogue public et l'assistant IA
//   drafts     fiches proposées par les agents, en cours ou validées (historique)
//   agents     codes d'accès au portail du Pôle et rôle de chacun
// Limite : un seul serveur à la fois. À remplacer par une vraie base après le prototype.

export type AgentRole = "agent" | "validator";

export type Agent = {
  id: string;
  name: string;
  code: string;
  role: AgentRole;
  active: boolean;
};

export const ROLE_LABELS: Record<AgentRole, string> = {
  agent: "Agent",
  validator: "Validateur",
};

export type StoreData = {
  disorders: Record<string, Disorder>;
  drafts: Record<string, Omit<Draft, "id">>;
  agents: Record<string, Omit<Agent, "id">>;
};

const DATA_FILE = path.join(process.cwd(), "data", "pole.json");

// Premier lancement : le fichier est créé avec les fiches actuelles du site, déjà publiées.
function initialData(): StoreData {
  return {
    disorders: Object.fromEntries(demoDisorders.map((d) => [d.slug, { ...d, games: d.games ?? [] }])),
    drafts: {},
    agents: {},
  };
}

async function load(): Promise<StoreData> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as StoreData;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return initialData();
    throw err;
  }
}

// Écriture dans un fichier temporaire puis renommage : le fichier n'est jamais à moitié écrit.
async function save(data: StoreData) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

// Les modifications passent l'une après l'autre : deux enregistrements simultanés
// ne peuvent pas s'écraser.
let queue: Promise<unknown> = Promise.resolve();

export function updateStore<T>(change: (data: StoreData) => T): Promise<T> {
  const run = queue.then(async () => {
    const data = await load();
    const result = change(data);
    await save(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export function newId(): string {
  return crypto.randomUUID();
}

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, "fr");
}

function withId<T>(entries: Record<string, T>): (T & { id: string })[] {
  return Object.entries(entries).map(([id, value]) => ({ id, ...value }));
}

export async function listDisorders(): Promise<Disorder[]> {
  return Object.values((await load()).disorders).sort(byName);
}

export async function getDisorder(slug: string): Promise<Disorder | undefined> {
  return (await load()).disorders[slug];
}

export async function getDraft(id: string): Promise<Draft | null> {
  const draft = (await load()).drafts[id];
  return draft ? { id, ...draft } : null;
}

function newestFirst(a: Draft, b: Draft) {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export async function listDraftsByAuthor(authorId: string): Promise<Draft[]> {
  return withId((await load()).drafts)
    .filter((d) => d.authorId === authorId)
    .sort(newestFirst);
}

export async function listSubmittedDrafts(): Promise<Draft[]> {
  return withId((await load()).drafts)
    .filter((d) => d.status === "submitted")
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
}

export async function listAgents(): Promise<Agent[]> {
  return withId((await load()).agents).sort(byName);
}

export async function findAgentByCode(code: string): Promise<Agent | null> {
  return withId((await load()).agents).find((a) => a.code === code) ?? null;
}
