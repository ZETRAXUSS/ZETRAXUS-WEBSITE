// ZETRAXUS — moderated text writes.
//
// Every forum thread / reply, project, world / lore / character and project
// comment goes through here. The text is checked by OpenAI's moderation model
// (multilingual, incl. Turkish) before it is written. Browsers cannot insert
// or edit this text directly (RLS + triggers), so the check cannot be skipped.
//
// Projects area: links are banned completely (no ads / phishing).
//
// If the moderation API is unreachable the content is still published (so the
// site never goes down) but an automatic report is filed for moderators.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

class Fail extends Error {
  constructor(public code: string, public status = 400) {
    super(code);
  }
}

type Verdict = { ok: true; checked: boolean } | { ok: false; categories: string[] };

// Stricter than the API defaults for a community site.
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

// Fiction legitimately contains battles and war — creative content gets a
// little more room for plain (non-graphic) violence.
const CREATIVE_LIMITS: Record<string, number> = { ...LIMITS, violence: 0.9, harassment: 0.7 };

async function moderateText(text: string, limits = LIMITS): Promise<Verdict> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return { ok: true, checked: false };

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text.slice(0, 30000) }),
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
      .filter(([category, score]) => score >= (limits[category] ?? 0.8))
      .map(([category]) => category);
    // Hard categories are always rejected when the API flags them.
    const hard = ["sexual/minors", "hate/threatening", "harassment/threatening", "self-harm/instructions", "self-harm/intent"];
    const flagged = Object.entries(result.categories ?? {})
      .filter(([category, value]) => value === true && (limits === LIMITS || hard.includes(category)))
      .map(([category]) => category);
    const categories = [...new Set([...flagged, ...hits])];

    return categories.length ? { ok: false, categories } : { ok: true, checked: true };
  } catch (error) {
    console.error("moderation failed", error);
    return { ok: true, checked: false };
  }
}

// ---------------------------------------------------------------------------
// Link ban (projects area)
// ---------------------------------------------------------------------------

const TLDS =
  "com|net|org|io|gg|tv|me|co|xyz|app|dev|ly|link|site|online|store|shop|info|biz|ru|tr|de|uk|us|fr|es|it|nl|pl|cc|to|sh|ai|gl|be|club|live|fun|top|pro|page|blog|click|space|website|tk|ml|ga|cf|gq|am|fm|eu|in|br|jp|cn|kr";
const LINK_PATTERNS = [
  /\b(?:https?|ftp):\/\//i,
  /\bwww\s*\./i,
  // "site.com", "site . com" is too common in prose ("end. In the…"), so only
  // a tight dot or the bracket obfuscations count.
  new RegExp(`\\b[a-z0-9][a-z0-9-]{0,62}(?:\\.|\\s*\\[\\s*\\.\\s*\\]\\s*|\\s*\\(\\s*\\.\\s*\\)\\s*|\\s*\\[dot\\]\\s*|\\s*\\(dot\\)\\s*)(?:${TLDS})(?![a-z0-9-])`, "i"),
  /\bdiscord(?:app)?\s*\.\s*(?:gg|com)\b/i,
  /\bt\.me\//i,
  /\bbit\.ly\b/i,
  /\[[^\]]*\]\([^)]*\)/, // markdown links [text](url)
];

function stripOwnImages(text: string) {
  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const own = new RegExp(`!\\[[^\\]]*\\]\\(${base}/storage/v1/object/public/media/[^)\\s]+\\)`, "g");
  return text.replace(own, " ");
}

function containsLink(text: string) {
  const clean = stripOwnImages(text);
  return LINK_PATTERNS.some((pattern) => pattern.test(clean));
}

// Any image in lore / project text must be one of ours (no external hotlinks).
function hasForeignImage(text: string) {
  const clean = stripOwnImages(text);
  return /!\[[^\]]*\]\(/.test(clean);
}

// ---------------------------------------------------------------------------
// Field schemas
// ---------------------------------------------------------------------------

type FieldSpec = { max: number; list?: { max: number; keys: Record<string, number> } };

const WORLD_FIELDS: Record<string, FieldSpec> = {
  overview: { max: 8000 },
  scale: { max: 40 },
  era: { max: 120 },
  geography: { max: 8000 },
  climate: { max: 4000 },
  cities: { max: 0, list: { max: 40, keys: { name: 80, kind: 40, description: 2000 } } },
  kingdoms: { max: 0, list: { max: 30, keys: { name: 80, ruler: 80, government: 60, description: 3000 } } },
  races: { max: 6000 },
  systems: { max: 8000 },
  religions: { max: 6000 },
  economy: { max: 4000 },
  history: { max: 12000 },
  conflicts: { max: 6000 },
};

const LORE_FIELDS: Record<string, FieldSpec> = {
  summary: { max: 500 },
  era: { max: 120 },
  body: { max: 20000 },
};

const CHARACTER_FIELDS: Record<string, FieldSpec> = {
  quote: { max: 300 },
  age: { max: 40 },
  species: { max: 60 },
  gender: { max: 40 },
  height: { max: 40 },
  affiliation: { max: 120 },
  mbti: { max: 6 },
  appearance: { max: 6000 },
  personality: { max: 6000 },
  strengths: { max: 2000 },
  weaknesses: { max: 2000 },
  backstory: { max: 12000 },
  abilities: { max: 6000 },
  relationships: { max: 4000 },
};

const SCHEMAS: Record<string, Record<string, FieldSpec>> = {
  world: WORLD_FIELDS,
  lore: LORE_FIELDS,
  character: CHARACTER_FIELDS,
};

const REQUIRED: Record<string, string[]> = {
  world: ["overview"],
  lore: ["body"],
  character: ["appearance", "personality"],
};

function str(value: unknown, max: number, field = "FIELD") {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Fail(`BAD_${field.toUpperCase()}`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Fail("TOO_LONG");
  return trimmed;
}

function cleanFields(kind: string, raw: unknown) {
  const schema = SCHEMAS[kind];
  if (!schema) throw new Fail("BAD_KIND");
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};

  for (const [key, spec] of Object.entries(schema)) {
    const value = input[key];
    if (spec.list) {
      if (value === undefined || value === null) continue;
      if (!Array.isArray(value)) throw new Fail("BAD_FIELDS");
      if (value.length > spec.list.max) throw new Fail("TOO_MANY_ITEMS");
      const items = value
        .map((item) => {
          const obj = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          const clean: Record<string, string> = {};
          for (const [k, max] of Object.entries(spec.list!.keys)) {
            const v = str(obj[k], max);
            if (v) clean[k] = v;
          }
          return clean;
        })
        .filter((item) => item.name);
      if (items.length) out[key] = items;
    } else {
      const v = str(value, spec.max);
      if (v) out[key] = v;
    }
  }

  if (kind === "character" && out.mbti) {
    const mbti = String(out.mbti).toUpperCase();
    if (!/^[EI][NS][TF][JP](-[AT])?$/.test(mbti)) throw new Fail("BAD_MBTI");
    out.mbti = mbti;
  }

  for (const key of REQUIRED[kind] ?? []) {
    if (!out[key]) throw new Fail("MISSING_FIELDS");
  }
  return out;
}

function fieldsText(fields: Record<string, unknown>) {
  const parts: string[] = [];
  for (const value of Object.values(fields)) {
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value)) for (const item of value) parts.push(Object.values(item as Record<string, string>).join("\n"));
  }
  return parts.join("\n\n");
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

type Ctx = {
  admin: SupabaseClient;
  userId: string;
  isStaff: boolean;
  payload: Record<string, unknown>;
};

type Prepared = {
  text: string;
  creative: boolean;
  noLinks: boolean;
  targetType: string;
  write: () => Promise<{ id: string }>;
};

async function rpcBool(admin: SupabaseClient, fn: string, args: Record<string, unknown>) {
  const { data, error } = await admin.rpc(fn, args);
  if (error) throw new Fail(error.message, 500);
  return data === true;
}

function dbFail(error: { message: string } | null) {
  if (error) {
    const known = error.message.match(/[A-Z][A-Z_]{3,}/);
    throw new Fail(known ? known[0] : error.message);
  }
}

// --- forum ------------------------------------------------------------------

async function prepareForum(ctx: Ctx, action: string): Promise<Prepared> {
  const { admin, userId, isStaff, payload } = ctx;
  const title = str(payload.title, 200);
  const body = str(payload.body, 20000);
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!body || (action.endsWith("thread") && !title)) throw new Fail("EMPTY");

  if (action === "create_thread") {
    const categoryId = String(payload.category_id ?? "");
    const { data: category } = await admin.from("forum_categories").select("id").eq("id", categoryId).maybeSingle();
    if (!category) throw new Fail("BAD_CATEGORY");
  } else if (action === "create_reply") {
    const { data: thread } = await admin.from("forum_threads").select("id, is_locked").eq("id", id).maybeSingle();
    if (!thread) throw new Fail("NOT_FOUND", 404);
    if (thread.is_locked && !isStaff) throw new Fail("LOCKED", 403);
  } else {
    const table = action === "edit_thread" ? "forum_threads" : "forum_replies";
    const { data: row } = await admin.from(table).select("author_id").eq("id", id).maybeSingle();
    if (!row) throw new Fail("NOT_FOUND", 404);
    if (row.author_id !== userId && !isStaff) throw new Fail("FORBIDDEN", 403);
  }

  const now = new Date().toISOString();
  return {
    text: `${title}\n\n${body}`,
    creative: false,
    noLinks: false,
    targetType: action.endsWith("thread") ? "thread" : "reply",
    write: async () => {
      if (action === "create_thread") {
        const { data, error } = await admin
          .from("forum_threads")
          .insert({ author_id: userId, category_id: payload.category_id, title, body })
          .select("id")
          .single();
        dbFail(error);
        return data!;
      }
      if (action === "create_reply") {
        const { data, error } = await admin
          .from("forum_replies")
          .insert({ author_id: userId, thread_id: id, body })
          .select("id")
          .single();
        dbFail(error);
        return data!;
      }
      if (action === "edit_thread") {
        const { error } = await admin.from("forum_threads").update({ title, body, edited_at: now, updated_at: now }).eq("id", id);
        dbFail(error);
        return { id };
      }
      const { error } = await admin.from("forum_replies").update({ body, edited_at: now, updated_at: now }).eq("id", id);
      dbFail(error);
      return { id };
    },
  };
}

// --- projects ---------------------------------------------------------------

async function prepareProject(ctx: Ctx, action: string): Promise<Prepared> {
  const { admin, userId, isStaff, payload } = ctx;
  const title = str(payload.title, 120);
  const tagline = str(payload.tagline, 200);
  const description = str(payload.description, 20000);
  const genre = str(payload.genre, 40);
  const status = payload.status === "completed" ? "completed" : "in_progress";
  const id = typeof payload.id === "string" ? payload.id : "";

  if (title.length < 3) throw new Fail("TITLE_TOO_SHORT");
  if (!description) throw new Fail("EMPTY");

  if (action === "edit_project") {
    const { data: row } = await admin.from("projects").select("id").eq("id", id).maybeSingle();
    if (!row) throw new Fail("NOT_FOUND", 404);
    if (!isStaff && !(await rpcBool(admin, "is_project_member", { p: id, uid: userId }))) throw new Fail("FORBIDDEN", 403);
  }

  const now = new Date().toISOString();
  return {
    text: [title, tagline, genre, description].join("\n\n"),
    creative: true,
    noLinks: true,
    targetType: "project",
    write: async () => {
      const values = { title, tagline: tagline || null, description, genre: genre || null, status };
      if (action === "create_project") {
        const { data, error } = await admin
          .from("projects")
          .insert({ ...values, owner_id: userId })
          .select("id")
          .single();
        dbFail(error);
        return data!;
      }
      const { error } = await admin.from("projects").update({ ...values, edited_at: now, updated_at: now }).eq("id", id);
      dbFail(error);
      return { id };
    },
  };
}

async function prepareCreation(ctx: Ctx, action: string): Promise<Prepared> {
  const { admin, userId, isStaff, payload } = ctx;
  const id = typeof payload.id === "string" ? payload.id : "";

  let kind = String(payload.kind ?? "");
  let current: { author_id: string; project_id: string | null; world_id: string | null } | null = null;

  if (action === "edit_creation") {
    const { data: row } = await admin.from("creations").select("kind, author_id, project_id, world_id").eq("id", id).maybeSingle();
    if (!row) throw new Fail("NOT_FOUND", 404);
    if (!isStaff && !(await rpcBool(admin, "can_edit_creation", { c: id, uid: userId }))) throw new Fail("FORBIDDEN", 403);
    kind = row.kind;
    current = row;
  }
  if (!SCHEMAS[kind]) throw new Fail("BAD_KIND");

  const title = str(payload.title, 120);
  const subtitle = str(payload.subtitle, 160);
  const typeTag = str(payload.type_tag, 40);
  if (title.length < 2) throw new Fail("TITLE_TOO_SHORT");
  const fields = cleanFields(kind, payload.fields);

  // Optional links to a project / a world.
  const projectId = typeof payload.project_id === "string" && payload.project_id ? payload.project_id : null;
  const worldId = kind !== "world" && typeof payload.world_id === "string" && payload.world_id ? payload.world_id : null;

  if (projectId && projectId !== current?.project_id) {
    const { data: project } = await admin.from("projects").select("id").eq("id", projectId).maybeSingle();
    if (!project) throw new Fail("BAD_PROJECT");
    if (!(await rpcBool(admin, "is_project_member", { p: projectId, uid: userId }))) throw new Fail("NOT_YOUR_PROJECT", 403);
  }
  if (worldId && worldId !== current?.world_id) {
    const { data: world } = await admin.from("creations").select("id, kind").eq("id", worldId).maybeSingle();
    if (!world || world.kind !== "world") throw new Fail("BAD_WORLD");
    if (!(await rpcBool(admin, "can_edit_creation", { c: worldId, uid: userId }))) throw new Fail("NOT_YOUR_WORLD", 403);
  }

  if (kind === "lore" && hasForeignImage(String(fields.body ?? ""))) throw new Fail("FOREIGN_IMAGE");

  const now = new Date().toISOString();
  return {
    text: [title, subtitle, typeTag, fieldsText(fields)].join("\n\n"),
    creative: true,
    noLinks: true,
    targetType: "creation",
    write: async () => {
      const values = {
        title,
        subtitle: subtitle || null,
        type_tag: typeTag || null,
        fields,
        project_id: projectId,
        world_id: worldId,
      };
      if (action === "create_creation") {
        const { data, error } = await admin
          .from("creations")
          .insert({ ...values, kind, author_id: userId })
          .select("id")
          .single();
        dbFail(error);
        return data!;
      }
      const { error } = await admin.from("creations").update({ ...values, edited_at: now, updated_at: now }).eq("id", id);
      dbFail(error);
      return { id };
    },
  };
}

async function prepareComment(ctx: Ctx, action: string): Promise<Prepared> {
  const { admin, userId, isStaff, payload } = ctx;
  const body = str(payload.body, 5000);
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!body) throw new Fail("EMPTY");

  const kind = payload.kind === "suggestion" ? "suggestion" : "comment";
  const target = payload.target === "creation" ? "creation" : "project";

  if (action === "create_comment") {
    const table = target === "project" ? "projects" : "creations";
    const { data: row } = await admin.from(table).select("id").eq("id", id).maybeSingle();
    if (!row) throw new Fail("NOT_FOUND", 404);
  } else {
    const { data: row } = await admin.from("comments").select("author_id").eq("id", id).maybeSingle();
    if (!row) throw new Fail("NOT_FOUND", 404);
    if (row.author_id !== userId && !isStaff) throw new Fail("FORBIDDEN", 403);
  }

  return {
    text: body,
    creative: false,
    noLinks: true,
    targetType: "comment",
    write: async () => {
      if (action === "create_comment") {
        const { data, error } = await admin
          .from("comments")
          .insert({
            author_id: userId,
            kind,
            body,
            project_id: target === "project" ? id : null,
            creation_id: target === "creation" ? id : null,
          })
          .select("id")
          .single();
        dbFail(error);
        return data!;
      }
      const { error } = await admin.from("comments").update({ body, edited_at: new Date().toISOString() }).eq("id", id);
      dbFail(error);
      return { id };
    },
  };
}

// ---------------------------------------------------------------------------

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
  const ctx: Ctx = { admin, userId: user.id, isStaff, payload };

  try {
    let prepared: Prepared;
    if (["create_thread", "create_reply", "edit_thread", "edit_reply"].includes(action)) {
      prepared = await prepareForum(ctx, action);
    } else if (action === "create_project" || action === "edit_project") {
      prepared = await prepareProject(ctx, action);
    } else if (action === "create_creation" || action === "edit_creation") {
      prepared = await prepareCreation(ctx, action);
    } else if (action === "create_comment" || action === "edit_comment") {
      prepared = await prepareComment(ctx, action);
    } else {
      return json({ error: "BAD_ACTION" }, 400);
    }

    // Links are not allowed anywhere in the projects area — staff included,
    // so nobody can be tricked by a "trusted" link either.
    if (prepared.noLinks && containsLink(prepared.text)) return json({ error: "LINKS_NOT_ALLOWED" }, 422);

    const verdict = isStaff
      ? ({ ok: true, checked: true } as Verdict)
      : await moderateText(prepared.text, prepared.creative ? CREATIVE_LIMITS : LIMITS);
    if (!verdict.ok) return json({ error: "TEXT_REJECTED", categories: verdict.categories }, 422);

    const result = await prepared.write();

    // Could not verify with AI → let moderators look at it.
    if (!verdict.checked) {
      const { error: reportError } = await admin.from("reports").upsert(
        {
          reporter_id: user.id,
          target_type: prepared.targetType,
          target_id: result.id,
          reason: "other",
          is_auto: true,
          status: "open",
          details: "AI_CHECK_UNAVAILABLE",
        },
        { onConflict: "reporter_id,target_type,target_id" },
      );
      if (reportError) console.error("auto report failed", reportError);
    }

    return json({ id: result.id });
  } catch (error) {
    if (error instanceof Fail) return json({ error: error.code }, error.status);
    console.error("post-content failed", error);
    return json({ error: "WRITE_FAILED" }, 500);
  }
});
