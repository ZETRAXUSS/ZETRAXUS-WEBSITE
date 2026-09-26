"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { fetchCreations, fetchProjects } from "@/lib/projects/client";
import type { CreationKind, CreationSummary, ProjectSummary } from "@/lib/projects/types";
import { CardSkeleton, CreationCard, ProjectCard } from "./cards";

type Tab = "projects" | CreationKind;

const TABS: { id: Tab; label: TranslationKey }[] = [
  { id: "projects", label: "projects.tab.projects" },
  { id: "world", label: "projects.tab.worlds" },
  { id: "lore", label: "projects.tab.lore" },
  { id: "character", label: "projects.tab.characters" },
];

/** Projects (owned or joined) and creations on a public profile. */
export function ProfileWorks({ userId, onCount }: { userId: string; onCount?: (count: number) => void }) {
  const { t } = useI18n();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [creations, setCreations] = useState<CreationSummary[] | null>(null);
  const [tab, setTab] = useState<Tab>("projects");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchProjects({ sort: "updated", memberId: userId, page: 0, pageSize: 24 }),
      fetchCreations({ authorId: userId, sort: "new", page: 0, pageSize: 60, withFields: true }),
    ]).then(([projectList, creationList]) => {
      if (!active) return;
      setProjects(projectList.items);
      setCreations(creationList.items);
      onCount?.(projectList.items.length + creationList.items.length);
      if (!projectList.items.length) {
        const first = (["world", "lore", "character"] as CreationKind[]).find((kind) => creationList.items.some((item) => item.kind === kind));
        if (first) setTab(first);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loading = projects === null || creations === null;
  const count = (id: Tab) => (id === "projects" ? projects?.length ?? 0 : creations?.filter((item) => item.kind === id).length ?? 0);
  if (!loading && count("projects") + (creations?.length ?? 0) === 0) return null;

  const list = tab === "projects" ? null : creations?.filter((item) => item.kind === tab) ?? [];

  return (
    <section className="mx-auto w-full max-w-[1760px] px-6 pt-14 md:px-10 md:pt-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("profile.worksEyebrow")}</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t("profile.works")}</h3>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-full border border-white/[0.1] p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-sound="toggle"
              onClick={() => setTab(item.id)}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[10px] font-semibold uppercase tracking-[1.5px] transition-all duration-300 ${
                tab === item.id ? "bg-white text-black" : "text-white/45 hover:text-white"
              }`}
            >
              {t(item.label)}
              <span className="opacity-60">{loading ? "·" : count(item.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : tab === "projects" ? (
        projects!.length ? (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {projects!.map((project, index) => (
              <div key={project.id} className="zx-rise-in" style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}>
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <Empty />
        )
      ) : list!.length ? (
        <div className={`grid gap-x-6 gap-y-12 ${tab === "character" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {list!.map((item, index) => (
            <div key={item.id} className="zx-rise-in" style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}>
              <CreationCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </section>
  );
}

function Empty() {
  const { t } = useI18n();
  return <p className="rounded-[20px] border border-dashed border-white/[0.1] px-6 py-12 text-center text-sm text-white/35">{t("profile.worksEmpty")}</p>;
}
