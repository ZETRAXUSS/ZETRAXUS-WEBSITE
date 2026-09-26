import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ThreadView } from "@/components/forum/thread-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return { title: "Forum" };

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("forum_threads").select("title, body").eq("id", id).maybeSingle();
    if (!data) return { title: "Forum" };
    const thread = data as { title: string; body: string };
    const description = thread.body.replace(/[#>*_`~\[\]()]/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
    return {
      title: thread.title,
      description,
      openGraph: { title: thread.title, description, type: "article" },
    };
  } catch {
    return { title: "Forum" };
  }
}

export default async function ThreadPage({ params }: PageProps) {
  const { id } = await params;
  return <ThreadView id={id} />;
}
