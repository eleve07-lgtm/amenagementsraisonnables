"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  POLE_SESSION_COOKIE,
  getPoleUser,
  normalizeCode,
  resolveCode,
  type PoleUser,
} from "@/lib/pole/session";
import { parseSheetContent, slugify, toDisorder, type Draft } from "@/lib/pole/sheet";
import { newId, updateStore, type AgentRole, type StoreData } from "@/lib/pole/store";

// Chaque action revérifie la session et les droits : une action serveur peut être
// appelée directement, sans passer par l'interface.

function now() {
  return new Date().toISOString();
}

async function requireUser(): Promise<PoleUser> {
  const user = await getPoleUser();
  if (!user) redirect("/pole/connexion");
  return user;
}

async function requireValidator(): Promise<PoleUser> {
  const user = await requireUser();
  if (user.role !== "validator") redirect("/pole");
  return user;
}

async function requireAdmin(): Promise<PoleUser> {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/pole");
  return user;
}

// --- Connexion --------------------------------------------------------------------

export type CodeState = { error: string | null };

export async function enterPoleCode(_prev: CodeState, formData: FormData): Promise<CodeState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (!(await resolveCode(code))) {
    return { error: "Ce code n'est pas reconnu. Vérifiez-le auprès de l'administrateur du portail." };
  }
  (await cookies()).set(POLE_SESSION_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/pole");
}

export async function signOutPole() {
  (await cookies()).delete(POLE_SESSION_COOKIE);
  redirect("/pole/connexion");
}

// --- Rédaction --------------------------------------------------------------------

export type SaveState = { error: string | null; savedAt: string | null };

function slugTakenError(data: StoreData, slug: string, name: string): string | null {
  if (!data.disorders[slug]) return null;
  return `La fiche « ${name} » existe déjà en ligne. Ouvrez-la depuis « Fiches en ligne » pour proposer une modification.`;
}

export async function saveDraft(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  const submit = formData.get("intent") === "submit";
  const draftId = String(formData.get("draftId") ?? "");
  const targetSlug = String(formData.get("targetSlug") ?? "") || null;

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("content") ?? ""));
  } catch {
    return { error: "Contenu illisible. Rechargez la page.", savedAt: null };
  }
  const parsed = parseSheetContent(raw, submit);
  if ("error" in parsed) return { error: parsed.error, savedAt: null };
  const { content } = parsed;

  const timestamp = now();
  const submission = submit ? { status: "submitted" as const, submittedAt: timestamp } : {};

  const result = await updateStore((data): { error: string } | { id: string; created: boolean } => {
    if (draftId) {
      const draft = data.drafts[draftId];
      if (!draft || draft.authorId !== user.id) return { error: "Fiche introuvable." };
      if (draft.status !== "draft" && draft.status !== "returned") {
        return { error: "Cette fiche est déjà envoyée en validation : elle ne peut plus être modifiée." };
      }
      const slug = draft.targetSlug ?? slugify(content.name);
      const taken = draft.targetSlug ? null : slugTakenError(data, slug, content.name);
      if (taken) return { error: taken };
      data.drafts[draftId] = { ...draft, content, slug, updatedAt: timestamp, ...submission };
      return { id: draftId, created: false };
    }

    // Premier enregistrement : la fiche n'existe dans le fichier qu'à partir de maintenant.
    if (targetSlug && !data.disorders[targetSlug]) return { error: "La fiche en ligne à modifier n'existe plus." };
    const slug = targetSlug ?? slugify(content.name);
    const taken = targetSlug ? null : slugTakenError(data, slug, content.name);
    if (taken) return { error: taken };
    const id = newId();
    const draft: Omit<Draft, "id"> = {
      targetSlug,
      slug,
      content,
      status: "draft",
      authorId: user.id,
      authorName: user.name,
      reviewComment: null,
      reviewerName: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      submittedAt: null,
      publishedAt: null,
      ...submission,
    };
    data.drafts[id] = draft;
    return { id, created: true };
  });

  if ("error" in result) return { error: result.error, savedAt: null };
  if (submit) redirect("/pole");
  if (result.created) redirect(`/pole/fiches/${result.id}`);
  return { error: null, savedAt: timestamp };
}

export async function deleteDraft(formData: FormData) {
  const user = await requireUser();
  const draftId = String(formData.get("draftId") ?? "");
  await updateStore((data) => {
    const draft = data.drafts[draftId];
    if (draft && draft.authorId === user.id && (draft.status === "draft" || draft.status === "returned")) {
      delete data.drafts[draftId];
    }
  });
  redirect("/pole");
}

// --- Validation -------------------------------------------------------------------

export type ReviewState = { error: string | null };

export async function reviewDraft(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const reviewer = await requireValidator();
  const draftId = String(formData.get("draftId") ?? "");
  const decision = formData.get("decision");
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 2000);

  if (decision === "return" && comment.length < 3) {
    return { error: "Expliquez à l'auteur ce qu'il faut corriger." };
  }

  const error = await updateStore((data) => {
    const draft = data.drafts[draftId];
    if (!draft) return "Fiche introuvable.";
    if (draft.status !== "submitted") return "Cette fiche n'est plus en attente de validation.";
    if (draft.authorId === reviewer.id) return "Vous ne pouvez pas valider votre propre fiche.";

    const timestamp = now();
    if (decision === "return") {
      data.drafts[draftId] = {
        ...draft,
        status: "returned",
        reviewComment: comment,
        reviewerName: reviewer.name,
        updatedAt: timestamp,
      };
      return null;
    }

    if (!draft.targetSlug && data.disorders[draft.slug]) {
      return "Une fiche portant ce nom a été publiée entre-temps. Renvoyez celle-ci à son auteur.";
    }
    data.disorders[draft.slug] = toDisorder(draft.slug, draft.content);
    data.drafts[draftId] = {
      ...draft,
      status: "published",
      reviewComment: comment || null,
      reviewerName: reviewer.name,
      publishedAt: timestamp,
      updatedAt: timestamp,
    };
    return null;
  });

  if (error) return { error };
  redirect("/pole/validation");
}

// --- Codes des agents (administrateur) --------------------------------------------

// Sans lettres ni chiffres ambigus (O/0, I/1) : un code se dicte au téléphone.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `POLE-${Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("")}`;
}

export type AgentFormState = { error: string | null; message: string | null };

export async function createAgent(_prev: AgentFormState, formData: FormData): Promise<AgentFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const role: AgentRole = formData.get("role") === "validator" ? "validator" : "agent";
  if (name.length < 2) return { error: "Indiquez le nom de l'agent.", message: null };

  const code = await updateStore((data) => {
    const used = new Set(Object.values(data.agents).map((a) => a.code));
    let candidate = generateCode();
    while (used.has(candidate)) candidate = generateCode();
    data.agents[newId()] = { name, code: candidate, role, active: true };
    return candidate;
  });
  revalidatePath("/pole/agents");
  return { error: null, message: `Code de ${name} : ${code}` };
}

export async function setAgentActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("agentId") ?? "");
  const active = formData.get("active") === "true";
  await updateStore((data) => {
    if (data.agents[id]) data.agents[id].active = active;
  });
  revalidatePath("/pole/agents");
}
