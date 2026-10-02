import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAgentByCode, type AgentRole } from "./store";

// Session des agents du Pôle (prototype) : le cookie contient le code saisi,
// revérifié à chaque requête. Pas de signature — à durcir avant la mise en production.

export const POLE_SESSION_COOKIE = "pole_code";

export type PoleUser = {
  id: string;
  name: string;
  role: AgentRole;
  // Administrateur : code POLE_ADMIN_CODE de .env.local. Valide et gère les codes des agents.
  isAdmin: boolean;
};

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function resolveCode(code: string): Promise<PoleUser | null> {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const adminCode = process.env.POLE_ADMIN_CODE;
  if (adminCode && normalized === normalizeCode(adminCode)) {
    return { id: "admin", name: "Administrateur", role: "validator", isAdmin: true };
  }
  const agent = await findAgentByCode(normalized);
  return agent?.active ? { id: agent.id, name: agent.name, role: agent.role, isAdmin: false } : null;
}

export async function getPoleUser(): Promise<PoleUser | null> {
  const raw = (await cookies()).get(POLE_SESSION_COOKIE)?.value;
  return raw ? resolveCode(raw) : null;
}

export async function requirePoleUser(): Promise<PoleUser> {
  const user = await getPoleUser();
  if (!user) redirect("/pole/connexion");
  return user;
}
