import { getAccess } from "@/lib/access";
import { buildSystemPrompt } from "@/lib/assistant-prompt";
import { getPublishedDisorder } from "@/lib/catalogue";

// Assistant IA des fiches : reçoit la conversation, appelle Claude (appel HTTP direct,
// sans SDK) et renvoie la réponse en texte brut, au fil de l'eau.
// La clé ANTHROPIC_API_KEY reste sur le serveur (fichier .env.local).

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-5-5";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

// Limite simple par adresse IP, gardée en mémoire : remise à zéro à chaque redémarrage
// du serveur. Suffisant en version 0 pour éviter qu'une facture s'emballe.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const recentRequests = new Map<string, number[]>();

const REFUSAL_NOTE = "\n\nJe ne peux pas répondre à cette question. Essayez de la reformuler.";
const TRUNCATED_NOTE = "\n\n(Réponse coupée car trop longue.)";
const INTERRUPTED_NOTE = "\n\n(La réponse a été interrompue. Réessayez.)";

type ChatMessage = { role: "user" | "assistant"; content: string };

type StreamEvent = {
  type?: string;
  delta?: { type?: string; text?: string; stop_reason?: string };
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (recentRequests.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT;
  if (!limited) recent.push(now);
  recentRequests.set(key, recent);
  return limited;
}

// La conversation doit alterner question / réponse, commencer et finir par une question.
function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const messages: ChatMessage[] = [];
  for (const [i, m] of raw.entries()) {
    const expectedRole = i % 2 === 0 ? "user" : "assistant";
    if (typeof m !== "object" || m === null) return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== expectedRole || typeof content !== "string") return null;
    const text = content.trim();
    if (text.length === 0 || text.length > MAX_MESSAGE_LENGTH) return null;
    messages.push({ role: expectedRole, content: text });
  }
  return messages[messages.length - 1].role === "user" ? messages : null;
}

// Extrait le texte utile d'un évènement du flux renvoyé par l'API (format SSE).
function textFromEvent(event: string): string {
  const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
  if (!dataLine) return "";
  let data: StreamEvent;
  try {
    data = JSON.parse(dataLine.slice(5).trim());
  } catch {
    return "";
  }
  if (data.type === "content_block_delta" && data.delta?.type === "text_delta") {
    return data.delta.text ?? "";
  }
  if (data.type === "message_delta") {
    if (data.delta?.stop_reason === "refusal") return REFUSAL_NOTE;
    if (data.delta?.stop_reason === "max_tokens") return TRUNCATED_NOTE;
  }
  if (data.type === "error") return INTERRUPTED_NOTE;
  return "";
}

// Transforme le flux SSE de l'API en simple flux de texte pour le navigateur.
function toTextStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  async function pump(controller: ReadableStreamDefaultController<Uint8Array>) {
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const text = textFromEvent(event);
          if (text) controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    } catch (err) {
      console.error("[assistant] flux interrompu", err);
      try {
        controller.enqueue(encoder.encode(INTERRUPTED_NOTE));
        controller.close();
      } catch {
        // Le navigateur a déjà fermé la connexion.
      }
    }
  }

  return new ReadableStream({
    start(controller) {
      void pump(controller);
    },
    cancel() {
      void reader.cancel();
    },
  });
}

export async function POST(request: Request) {
  const access = await getAccess();
  if (!access) return jsonError("Votre code d'accès n'est plus valide. Rechargez la page.", 401);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError("L'assistant n'est pas encore configuré sur ce site.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Requête illisible.", 400);
  }
  const { slug, messages } = (body ?? {}) as { slug?: unknown; messages?: unknown };

  const disorder = typeof slug === "string" ? await getPublishedDisorder(slug) : undefined;
  if (!disorder) return jsonError("Fiche introuvable.", 404);

  const history = parseMessages(messages);
  if (!history) return jsonError("Question vide ou trop longue.", 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) {
    return jsonError("Beaucoup de questions en peu de temps : réessayez dans une heure.", 429);
  }

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // Si le modèle refuse une question par prudence, l'API la repasse à un autre modèle.
        "anthropic-beta": "server-side-fallback-2026-07-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        stream: true,
        fallbacks: "default",
        // Effort bas : réponses rapides et peu coûteuses, suffisant pour une discussion.
        output_config: { effort: "low" },
        system: buildSystemPrompt(disorder, access.audience),
        messages: history,
      }),
      signal: request.signal,
    });
  } catch (err) {
    console.error("[assistant] appel impossible", err);
    return jsonError("L'assistant est injoignable pour le moment.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    console.error("[assistant] erreur Anthropic", upstream.status, await upstream.text().catch(() => ""));
    const busy = upstream.status === 429 || upstream.status === 529;
    return jsonError(
      busy
        ? "L'assistant est très sollicité. Réessayez dans quelques minutes."
        : "L'assistant est indisponible pour le moment.",
      502,
    );
  }

  return new Response(toTextStream(upstream.body), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
