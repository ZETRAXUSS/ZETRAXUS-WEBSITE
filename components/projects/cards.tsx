"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, timeAgo } from "@/lib/i18n/translate";
import { creationHref } from "@/lib/projects/client";
import type { CreationSummary, ProjectSummary } from "@/lib/projects/types";
import { Avatar } from "@/components/ui/avatar";
import { ChatIcon, EyeIcon, HeartIcon, UserIcon } from "@/components/ui/icons";
import { Chip, KIND_LABEL, StatusBadge, useTagLabel } from "./ui";

function Placeholder({ seed, label }: { seed: string; label: string }) {
  // Deterministic, monochrome "constellation" so empty covers still feel designed.
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const rand = (n: number) => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return (hash % 1000) / 1000 * n;
  };
  const dots = Array.from({ length: 14 }, () => ({ x: rand(100), y: rand(100), r: 0.6 + rand(1.4) }));

  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-60">
        {dots.slice(0, 7).map((dot, index) => {
          const next = dots[index + 1];
          return <line key={index} x1={dot.x} y1={dot.y} x2={next.x} y2={next.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" />;
        })}
        {dots.map((dot, index) => (
          <circle key={index} cx={dot.x} cy={dot.y} r={dot.r * 0.35} fill="rgba(255,255,255,0.35)" />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-[55px] transition-all duration-700 group-hover/media:scale-150 group-hover/media:bg-white/[0.06]" />
      <span className="absolute inset-0 flex items-center justify-center text-[64px] font-black tracking-[-0.04em] text-white/[0.06] transition-all duration-700 group-hover/media:scale-110 group-hover/media:text-white/[0.1]">
        {label.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function Frame({ children, aspect = "aspect-[4/3]" }: { children: React.ReactNode; aspect?: string }) {
  return (
    <div
      data-spotlight
      className={`zx-sheen-host relative ${aspect} overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#080808] transition-all duration-700 group-hover/media:-translate-y-1 group-hover/media:border-white/[0.25] group-hover/media:shadow-[0_20px_70px_rgba(0,0,0,0.5)]`}
    >
      {children}
      <div className="pointer-events-none absolute inset-3 rounded-[18px] border border-white/[0.035] transition-all duration-700 group-hover/media:border-white/[0.08]" />
      <span className="pointer-events-none absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/10 transition-all duration-500 group-hover/media:h-6 group-hover/media:w-6 group-hover/media:border-white/30" />
      <div className="zx-sheen pointer-events-none absolute -left-[40%] top-0 h-full w-[40%] bg-white/[0.05]" />
    </div>
  );
}

function Cover({ src }: { src: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/media:scale-[1.06] group-hover/media:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
    </>
  );
}

export function ProjectCard({ project, index = 0 }: { project: ProjectSummary; index?: number }) {
  const { t, lang } = useI18n();
  const tag = useTagLabel();
  const creations = project.creations?.[0]?.count ?? 0;
  const members = (project.members?.[0]?.count ?? 0) + 1;

  return (
    <Link href={`/projects/${project.id}`} className="group/media block" data-sound-hover="hover">
      <Frame>
        {project.cover_url ? <Cover src={project.cover_url} /> : <Placeholder seed={project.id} label={project.title} />}
        <span className="absolute left-5 top-5 font-mono text-[10px] tracking-[3px] text-white/35">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute right-4 top-4">
          <StatusBadge status={project.status} size="sm" />
        </span>
        <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-center gap-2">
          {project.genre && <Chip>{tag("genre", project.genre)}</Chip>}
          {creations > 0 && <Chip>{t("projects.card.creations", { count: formatNumber(lang, creations) })}</Chip>}
        </div>
      </Frame>

      <div className="mt-5">
        <h3 className="line-clamp-1 text-[13px] font-semibold uppercase tracking-[2px] text-white/80 transition-colors duration-500 group-hover/media:text-white">
          {project.title}
        </h3>
        {project.tagline && <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-white/40">{project.tagline}</p>}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar name={project.owner?.display_name ?? "?"} src={project.owner?.avatar_url} size={26} />
            <span className="truncate text-[11px] text-white/35">
              {project.owner?.display_name ?? t("common.deletedUser")}
              {members > 1 && <span className="text-white/25"> +{members - 1}</span>}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><HeartIcon size={11} /> {formatNumber(lang, project.like_count)}</span>
            <span className="flex items-center gap-1"><ChatIcon size={11} /> {formatNumber(lang, project.comment_count)}</span>
            <span className="hidden items-center gap-1 sm:flex"><UserIcon size={11} /> {members}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CreationCard({ item, showProject = true }: { item: CreationSummary; showProject?: boolean }) {
  const { t, lang } = useI18n();
  const tag = useTagLabel();
  const image = item.kind === "world" ? item.planet_url ?? item.map_url ?? item.cover_url : item.cover_url;
  const isCharacter = item.kind === "character";
  const mbti = typeof item.fields?.mbti === "string" ? item.fields.mbti : null;

  return (
    <Link href={creationHref(item)} className="group/media block" data-sound-hover="hover">
      <Frame aspect={isCharacter ? "aspect-[3/4]" : "aspect-[4/3]"}>
        {image ? (
          item.kind === "world" && item.planet_url ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.06),transparent_60%)]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.planet_url}
                alt=""
                loading="lazy"
                className="zx-planet-glow absolute left-1/2 top-1/2 h-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/media:scale-110"
                style={{ aspectRatio: "1 / 1" }}
              />
            </>
          ) : (
            <Cover src={image} />
          )
        ) : (
          <Placeholder seed={item.id} label={item.title} />
        )}
        <span className="absolute left-4 top-4">
          <Chip strong>{t(KIND_LABEL[item.kind])}</Chip>
        </span>
        {mbti && (
          <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/60 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[2px] text-white/85 backdrop-blur">
            {mbti}
          </span>
        )}
        {item.type_tag && (
          <span className="absolute inset-x-4 bottom-4">
            <Chip>{tag(item.kind, item.type_tag)}</Chip>
          </span>
        )}
      </Frame>

      <div className="mt-5">
        <h3 className="line-clamp-1 text-[13px] font-semibold uppercase tracking-[2px] text-white/80 transition-colors duration-500 group-hover/media:text-white">
          {item.title}
        </h3>
        {item.subtitle && <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-white/40">{item.subtitle}</p>}
        {showProject && item.project && (
          <p className="mt-2 line-clamp-1 text-[10px] uppercase tracking-[1.5px] text-white/30">
            {t("projects.partOf")} <span className="text-white/55">{item.project.title}</span>
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar name={item.author?.display_name ?? "?"} src={item.author?.avatar_url} size={24} />
            <span className="truncate text-[11px] text-white/35">{item.author?.display_name ?? t("common.deletedUser")}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><HeartIcon size={11} /> {formatNumber(lang, item.like_count)}</span>
            <span className="flex items-center gap-1"><ChatIcon size={11} /> {formatNumber(lang, item.comment_count)}</span>
            <span className="hidden items-center gap-1 sm:flex" title={timeAgo(lang, item.created_at)}>
              <EyeIcon size={11} /> {formatNumber(lang, item.view_count)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CardSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div>
      <span className={`zx-skeleton block ${tall ? "aspect-[3/4]" : "aspect-[4/3]"} rounded-[24px]`} />
      <span className="zx-skeleton mt-5 block h-3 w-2/3 rounded" />
      <span className="zx-skeleton mt-3 block h-3 w-1/2 rounded" />
    </div>
  );
}
