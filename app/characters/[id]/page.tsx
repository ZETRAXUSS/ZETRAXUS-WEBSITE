import type { Metadata } from "next";
import { CreationView } from "@/components/projects/creation-view";
import { creationMetadata } from "@/lib/projects/metadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return creationMetadata(id, "character");
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <CreationView id={id} kind="character" />;
}
