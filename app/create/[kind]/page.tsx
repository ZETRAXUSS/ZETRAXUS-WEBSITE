import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/projects/project-editor";
import { CreationEditor } from "@/components/projects/creation-editor";

const KINDS = ["project", "world", "lore", "character"] as const;
type Kind = (typeof KINDS)[number];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ kind: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const TITLES: Record<Kind, string> = {
  project: "New project",
  world: "New world",
  lore: "New lore",
  character: "New character",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kind } = await params;
  return { title: TITLES[kind as Kind] ?? "Create", robots: { index: false } };
}

function uuid(value: string | string[] | undefined) {
  return typeof value === "string" && UUID.test(value) ? value : undefined;
}

export default async function CreatePage({ params, searchParams }: PageProps) {
  const { kind } = await params;
  if (!KINDS.includes(kind as Kind)) notFound();
  const query = await searchParams;
  const editId = uuid(query.edit);

  if (kind === "project") return <ProjectEditor editId={editId} />;

  return (
    <CreationEditor
      key={kind}
      kind={kind as "world" | "lore" | "character"}
      editId={editId}
      presetProject={uuid(query.project) ?? null}
      presetWorld={uuid(query.world) ?? null}
    />
  );
}
