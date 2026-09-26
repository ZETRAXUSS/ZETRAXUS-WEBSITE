import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PublicProfile } from "@/components/profile/public-profile";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("display_name, bio")
      .eq("username", username.toLowerCase())
      .maybeSingle();
    if (!data) return { title: "Profile" };
    const profile = data as { display_name: string; bio: string | null };
    return {
      title: `${profile.display_name} (@${username.toLowerCase()})`,
      description: profile.bio ?? undefined,
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  return <PublicProfile username={decodeURIComponent(username).toLowerCase()} />;
}
