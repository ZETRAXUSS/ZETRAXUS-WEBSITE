import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProjectView } from "@/components/projects/project-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return { title: "Projects" };
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("title, tagline, description, cover_url").eq("id", id).maybeSingle();
    if (!data) return { title: "Projects" };
    const project = data as { title: string; tagline: string | null; description: string; cover_url: string | null };
    const description = (project.tagline || project.description).replace(/[#>*_`~\[\]()!]/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
    return {
      title: project.title,
      description,
      openGraph: { title: project.title, description, type: "article", images: project.cover_url ? [project.cover_url] : undefined },
    };
  } catch {
    return { title: "Projects" };
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectView id={id} />;
}
