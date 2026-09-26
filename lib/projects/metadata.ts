import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { CreationKind } from "@/lib/projects/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALLBACK: Record<CreationKind, string> = { world: "Worlds", lore: "Lore", character: "Characters" };

/** Shared generateMetadata for /worlds/[id], /lore/[id], /characters/[id]. */
export async function creationMetadata(id: string, kind: CreationKind): Promise<Metadata> {
  if (!UUID.test(id)) return { title: FALLBACK[kind] };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("creations")
      .select("title, subtitle, cover_url, planet_url, map_url, fields")
      .eq("id", id)
      .maybeSingle();
    if (!data) return { title: FALLBACK[kind] };
    const item = data as {
      title: string;
      subtitle: string | null;
      cover_url: string | null;
      planet_url: string | null;
      map_url: string | null;
      fields: Record<string, unknown>;
    };
    const lead = item.subtitle || String(item.fields?.summary ?? item.fields?.overview ?? item.fields?.personality ?? "");
    const description = lead.replace(/[#>*_`~\[\]()!]/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
    const image = item.cover_url ?? item.planet_url ?? item.map_url;
    return {
      title: item.title,
      description,
      openGraph: { title: item.title, description, type: "article", images: image ? [image] : undefined },
    };
  } catch {
    return { title: FALLBACK[kind] };
  }
}
