// ZETRAXUS — moderated image upload.
//
// Every image (forum attachment or avatar) goes through here. The browser
// can never write to the `media` bucket directly, so nothing reaches the
// site without passing this check.
//
//  - OPENAI_API_KEY set   → image is scanned by OpenAI's moderation model.
//                           Clean images are published immediately, flagged
//                           ones are rejected and never stored.
//  - OPENAI_API_KEY unset → image is stored as "pending" and only becomes
//                           visible after a moderator approves it in /admin.

import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const MAX_BYTES = 5 * 1024 * 1024;
const HOURLY_LIMIT = 20;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function hasValidSignature(bytes: Uint8Array, type: string) {
  if (type === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/webp") {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return riff === "RIFF" && webp === "WEBP";
  }
  return false;
}

type ModerationResult = {
  flagged: boolean;
  categories: string[];
  scores: Record<string, number>;
};

async function moderate(bytes: Uint8Array, type: string, apiKey: string): Promise<ModerationResult | null> {
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: [{ type: "image_url", image_url: { url: `data:${type};base64,${encodeBase64(bytes)}` } }],
    }),
  });

  if (!response.ok) {
    console.error("moderation api error", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const result = data?.results?.[0];
  if (!result) return null;

  const scores: Record<string, number> = result.category_scores ?? {};
  const categories = Object.entries(result.categories ?? {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  // Slightly stricter than the API defaults for a community forum.
  const flagged =
    result.flagged === true ||
    (scores["sexual"] ?? 0) > 0.35 ||
    (scores["sexual/minors"] ?? 0) > 0.01 ||
    (scores["violence/graphic"] ?? 0) > 0.45 ||
    (scores["self-harm"] ?? 0) > 0.45 ||
    (scores["self-harm/instructions"] ?? 0) > 0.2;

  return { flagged, categories, scores };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // --- who is uploading -------------------------------------------------
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (authError || !user) return json({ error: "UNAUTHORIZED" }, 401);

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile) return json({ error: "NO_PROFILE" }, 403);
  if (profile.is_banned) return json({ error: "BANNED" }, 403);

  const isStaff = profile.role === "moderator" || profile.role === "admin";

  if (!isStaff) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("media_uploads")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= HOURLY_LIMIT) return json({ error: "RATE_LIMIT_UPLOADS" }, 429);
  }

  // --- validate file ----------------------------------------------------
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "BAD_REQUEST" }, 400);
  }

  const file = form.get("file");
  const kind = form.get("kind") === "avatar" ? "avatar" : "forum";
  const width = Number(form.get("width")) || null;
  const height = Number(form.get("height")) || null;

  if (!(file instanceof File)) return json({ error: "NO_FILE" }, 400);

  const ext = TYPES[file.type];
  if (!ext) return json({ error: "BAD_TYPE" }, 415);
  if (file.size > MAX_BYTES) return json({ error: "TOO_LARGE" }, 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) return json({ error: "BAD_TYPE" }, 415);

  // --- AI moderation ----------------------------------------------------
  let status: "approved" | "pending" = "pending";
  let moderation: Record<string, unknown> | null = null;

  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (openaiKey) {
    try {
      const result = await moderate(bytes, file.type, openaiKey);
      if (result) {
        moderation = { provider: "openai", ...result };
        if (result.flagged) {
          return json({ error: "REJECTED", categories: result.categories }, 422);
        }
        status = "approved";
      } else {
        moderation = { provider: "openai", error: "unavailable" };
      }
    } catch (error) {
      console.error("moderation failed", error);
      moderation = { provider: "openai", error: "exception" };
    }
  } else {
    moderation = { provider: "manual" };
  }

  // --- store ------------------------------------------------------------
  const id = crypto.randomUUID();
  const path = `${kind}/${user.id}/${id}.${ext}`;

  const upload = await admin.storage.from("media").upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upload.error) {
    console.error("storage upload failed", upload.error);
    return json({ error: "UPLOAD_FAILED" }, 500);
  }

  const url = admin.storage.from("media").getPublicUrl(path).data.publicUrl;

  const { error: insertError } = await admin.from("media_uploads").insert({
    id,
    owner_id: user.id,
    kind,
    path,
    url,
    width,
    height,
    status,
    moderation,
  });

  if (insertError) {
    console.error("media row insert failed", insertError);
    await admin.storage.from("media").remove([path]);
    return json({ error: "UPLOAD_FAILED" }, 500);
  }

  if (kind === "avatar" && status === "approved") {
    await admin.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  }

  return json({ id, url, status, width, height });
});
