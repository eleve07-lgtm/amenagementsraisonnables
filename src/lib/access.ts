import { cookies } from "next/headers";
import { findCode, findSchool, type Audience, type School } from "./demo-data";

// Le cookie contient le code saisi ; il est revalidé à chaque lecture.
// Version 0 : pas de signature — à durcir avant la mise en production.
export const ACCESS_COOKIE = "access_code";

export type Access = {
  audience: Audience;
  school: School;
};

export async function getAccess(): Promise<Access | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!raw) return null;
  const code = findCode(raw);
  if (!code) return null;
  const school = findSchool(code.schoolId);
  if (!school) return null;
  return { audience: code.audience, school };
}
