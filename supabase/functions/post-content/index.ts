// ZETRAXUS — moderated forum writes.
//
// Every new thread, reply and edit goes through here. The text is checked
// by OpenAI's moderation model (multilingual, incl. Turkish) before it is
// written. Browsers can no longer insert/edit forum text directly (RLS +
// triggers), so this check cannot be bypassed.
//
// If the moderation API is unreachable the post is still published (so the
// forum never goes down) but an automatic report is filed for moderators.

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

type Verdict = { ok: true; checked: boolean } | { ok: false; categories: string[] };

// Stricter than the API defaults for a community forum.
const LIMITS: Record<string, number> = {
  harassment: 0.6,
  "harassment/threatening": 0.35,
  hate: 0.45,
  "hate/threatening": 0.3,
  sexual: 0.5,
  "sexual/minors": 0.05,
  violence: 0.75,
  "violence/graphic": 0.5,
  "self-harm": 0.5,
  "self-harm/intent": 0.35,
  "self-harm/instructions": 0.25,
  illicit: 0.7,
  "illicit/violent": 0.4,
};

async function moderateText(text: string): Promise<Verdict> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return { ok: true, checked: false };

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text.slice(0, 20000) }),
    });
    if (!response.ok) {
      console.error("moderation api", response.status, await response.text());
      return { ok: true, checked: false };
    }
    const data = await response.json();
    const result = data?.results?.[0];
    if (!result) return { ok: true, checked: false };

    const scores: Record<string, number> = result.category_scores ?? {};
    const hits = Object.entries(scores)
      .filter(([category, score]) => score >= (LIMITS[category] ?? 0.8))
      .map(([category]) => category);
    const flagged = Object.entries(result.categories ?? {})
      .filter(([, value]) => value === true)
      .map(([category]) => category);
    const categories = [...new Set([...flagged, ...hits])];

    return categories.length ? { ok: false, categories } : { ok: true, checked: true };
  } catch (error) {
    console.error("moderation failed", error);
    return { ok: true, checked: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: "UNAUTHORIZED" }, 401);

  const { data: profile } = await admin.from("profiles").select("id, role, is_banned").eq("id", user.id).single();
  if (!profile) return json({ error: "NO_PROFILE" }, 403);
  if (profile.is_banned) return json({ error: "BANNED" }, 403);
  const isStaff = profile.role === "moderator" || profile.role === "admin";

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "BAD_REQUEST" }, 400);
  }

  const action = String(payload.action ?? "");
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const id = typeof payload.id === "string" ? payload.id : "";

  if (!body || (action.endsWith("thread") && !title)) return json({ error: "EMPTY" }, 400);

  // --- ownership / state checks -----------------------------------------
  if (action === "create_thread") {
    const categoryId = String(payload.category_id ?? "");
    const { data: category } = await admin.from("forum_categories").select("id").eq("id", categoryId).maybeSingle();
    if (!category) return json({ error: "BAD_CATEGORY" }, 400);
  } else if (action === "create_reply") {
    const { data: thread } = await admin.from("forum_threads").select("id, is_locked").eq("id", id).maybeSingle();
    if (!thread) return json({ error: "NOT_FOUND" }, 404);
    if (thread.is_locked && !isStaff) return json({ error: "LOCKED" }, 403);
  } else if (action === "edit_thread" || action === "edit_reply") {
    const table = action === "edit_thread" ? "forum_threads" : "forum_replies";
    const { data: row } = await admin.from(table).select("author_id").eq("id", id).maybeSingle();
    if (!row) return json({ error: "NOT_FOUND" }, 404);
    if (row.author_id !== user.id && !isStaff) return json({ error: "FORBIDDEN" }, 403);
  } else {
    return json({ error: "BAD_ACTION" }, 400);
  }

  // --- AI check ------------------------------------------------------------
  const verdict = isStaff ? ({ ok: true, checked: true } as Verdict) : await moderateText(`${title}\n\n${body}`);
  if (!verdict.ok) return json({ error: "TEXT_REJECTED", categories: verdict.categories }, 422);

  // --- write (service role → RLS bypassed, triggers + rate limits still run) --
  let result: { id: string } | null = null;
  let dbError: { message: string } | null = null;
  let targetType: "thread" | "reply" = "thread";

  if (action === "create_thread") {
    const { data, error } = await admin
      .from("forum_threads")
      .insert({ author_id: user.id, category_id: payload.category_id, title, body })
      .select("id")
      .single();
    result = data;
    dbError = error;
  } else if (action === "create_reply") {
    targetType = "reply";
    const { data, error } = await admin
      .from("forum_replies")
      .insert({ author_id: user.id, thread_id: id, body })
      .select("id")
      .single();
    result = data;
    dbError = error;
  } else if (action === "edit_thread") {
    const { error } = await admin
      .from("forum_threads")
      .update({ title, body, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);
    result = { id };
    dbError = error;
  } else {
    targetType = "reply";
    const { error } = await admin
      .from("forum_replies")
      .update({ body, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);
    result = { id };
    dbError = error;
  }

  if (dbError || !result) return json({ error: dbError?.message ?? "WRITE_FAILED" }, 400);

  // Could not verify with AI → let moderators look at it.
  if (!verdict.checked) {
    await admin.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: result.id,
      reason: "other",
      details: "Automatic: AI text check was unavailable when this was posted.",
    });
  }

  return json({ id: result.id });
});
