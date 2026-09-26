"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, timeAgo, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import {
  canEditCreation,
  creationHref,
  deleteCreation,
  fetchCreation,
  fetchCreations,
  fetchLiked,
  incrementView,
  setLike,
} from "@/lib/projects/client";
import { CHARACTER_SHORT, SECTIONS } from "@/lib/projects/fields";
import type { CityEntry, CreationDetail, CreationKind, CreationSummary, KingdomEntry } from "@/lib/projects/types";
import { Markdown } from "@/components/forum/markdown";
import { ReportDialog } from "@/components/forum/report-dialog";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ArrowLeftIcon, CheckIcon, CloseIcon, EditIcon, EyeIcon, FlagIcon, PlusIcon, ShareIcon, TrashIcon } from "@/components/ui/icons";
import { CreationCard } from "./cards";
import { CommentsSection } from "./comments";
import { MbtiCard } from "./mbti";
import { ViewSkeleton } from "./project-view";
import { Chip, KIND_LABEL, KIND_PLURAL, LikeButton, StatusBadge, iconButton, pillButton, useTagLabel } from "./ui";

const LIST_PATH: Record<CreationKind, string> = {
  world: "/projects?tab=worlds",
  lore: "/projects?tab=lore",
  character: "/projects?tab=characters",
};

export function CreationView({ id, kind }: { id: string; kind: CreationKind }) {
  const router = useRouter();
  const { user, isStaff } = useAuth();
  const { t, lang } = useI18n();
  const tag = useTagLabel();

  const [item, setItem] = useState<CreationDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [liked, setLiked] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [related, setRelated] = useState<CreationSummary[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return setStatus("missing");
    (async () => {
      const data = await fetchCreation(id);
      if (!data) return setStatus("missing");
      if (data.kind !== kind) {
        router.replace(creationHref(data));
        return;
      }
      setItem(data);
      setStatus("ready");
      if (data.kind === "world") {
        const list = await fetchCreations({ worldId: data.id, sort: "new", page: 0, pageSize: 40, withFields: true });
        setRelated(list.items);
      }
    })();
    void incrementView("creation", id);
  }, [id, kind, router]);

  useEffect(() => {
    if (!user || status !== "ready" || !item) return;
    fetchLiked(user.id, "creation", [id]).then((set) => setLiked(set.has(id)));
    if (item.author_id === user.id || isStaff) setCanEdit(true);
    else canEditCreation(id).then(setCanEdit);
  }, [user, id, status, item, isStaff]);

  const teamIds = useMemo(() => (item ? [item.author_id, ...(item.project?.owner_id ? [item.project.owner_id] : [])] : []), [item]);

  if (status === "loading") return <ViewSkeleton />;
  if (status === "missing" || !item) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[4px] text-white/30">404</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">{t("creation.notFound")}</h1>
        <Link href={LIST_PATH[kind]} className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-white hover:bg-white hover:text-black">
          <ArrowLeftIcon size={12} /> {t("project.back")}
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === item.author_id;
  const canDelete = isAuthor || isStaff || (!!user && item.project?.owner_id === user.id);
  const fields = item.fields ?? {};
  const text = (key: string) => (typeof fields[key] === "string" ? (fields[key] as string) : "");
  const cities = Array.isArray(fields.cities) ? (fields.cities as CityEntry[]) : [];
  const kingdoms = Array.isArray(fields.kingdoms) ? (fields.kingdoms as KingdomEntry[]) : [];

  const toggleLike = async () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(creationHref(item))}`);
      return;
    }
    const next = !liked;
    setLiked(next);
    setItem({ ...item, like_count: Math.max(0, item.like_count + (next ? 1 : -1)) });
    const result = await setLike("creation", item.id, user.id, next);
    if (!result.ok) {
      setLiked(!next);
      setItem((current) => (current ? { ...current, like_count: current.like_count + (next ? -1 : 1) } : current));
    }
  };

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: item.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      playSound("success");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* cancelled */
    }
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <LikeButton liked={liked} count={item.like_count} onToggle={() => void toggleLike()} />
      <a href="#comments" className={pillButton}>
        {t("comments.jump")} · {formatNumber(lang, item.comment_count)}
      </a>
      <button type="button" onClick={share} data-sound="off" className={pillButton}>
        {copied ? <CheckIcon size={14} /> : <ShareIcon size={14} />}
        {copied ? t("thread.copied") : t("thread.share")}
      </button>
      <span className="flex-1" />
      {user && !isAuthor && (
        <button type="button" onClick={() => setReporting(true)} className={iconButton} title={t("report.title")} aria-label={t("report.title")}>
          <FlagIcon size={14} />
        </button>
      )}
      {canEdit && (
        <Link href={`/create/${item.kind}?edit=${item.id}`} className={iconButton} title={t("common.edit")} aria-label={t("common.edit")}>
          <EditIcon size={14} />
        </Link>
      )}
      {canDelete && (
        <ConfirmButton
          onConfirm={async () => {
            const result = await deleteCreation(item.id);
            if (result.ok) {
              playSound("close");
              router.push(item.project ? `/projects/${item.project.id}` : LIST_PATH[item.kind]);
            }
          }}
          confirmLabel={t("common.confirmDelete")}
          title={t("common.delete")}
          className={iconButton}
          confirmClassName="flex h-10 items-center rounded-full border border-red-400/50 bg-red-500/10 px-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-red-300"
        >
          <TrashIcon size={14} />
        </ConfirmButton>
      )}
    </div>
  );

  const byline = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-white/45">
      <Link href={item.author ? `/u/${item.author.username}` : "#"} className="flex items-center gap-2.5 hover:text-white">
        <Avatar name={item.author?.display_name ?? "?"} src={item.author?.avatar_url} size={30} ring />
        <span className="text-white/75">{item.author?.display_name ?? t("common.deletedUser")}</span>
      </Link>
      <span>{timeAgo(lang, item.created_at)}</span>
      {item.edited_at && <span>{t("thread.edited")}</span>}
      <span className="flex items-center gap-1.5">
        <EyeIcon size={12} /> {formatNumber(lang, item.view_count)}
      </span>
    </div>
  );

  const links = (item.project || item.world) && (
    <div className="flex flex-wrap gap-3">
      {item.project && (
        <Link
          href={`/projects/${item.project.id}`}
          className="group flex items-center gap-3 rounded-full border border-white/[0.12] bg-black/40 py-1.5 pl-4 pr-2 text-[11px] text-white/60 backdrop-blur transition-all hover:border-white/40 hover:text-white"
        >
          <span className="text-[9px] uppercase tracking-[2px] text-white/35">{t("creation.project")}</span>
          <span className="font-semibold">{item.project.title}</span>
          <StatusBadge status={item.project.status} size="sm" />
        </Link>
      )}
      {item.world && (
        <Link
          href={creationHref({ id: item.world.id, kind: "world" })}
          className="group flex items-center gap-3 rounded-full border border-white/[0.12] bg-black/40 py-1.5 pl-1.5 pr-4 text-[11px] text-white/60 backdrop-blur transition-all hover:border-white/40 hover:text-white"
        >
          {item.world.planet_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.world.planet_url} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="h-7 w-7 rounded-full border border-white/20 bg-white/[0.05]" />
          )}
          <span className="text-[9px] uppercase tracking-[2px] text-white/35">{t("creation.world")}</span>
          <span className="font-semibold">{item.world.title}</span>
        </Link>
      )}
    </div>
  );

  const sections = SECTIONS[item.kind].filter((section) => text(section.key));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-10 md:px-6 md:pt-14">
        <div className="zx-rise-in flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[2.5px] text-white/30">
          <Link href={LIST_PATH[item.kind]} className="group flex items-center gap-2 hover:text-white">
            <ArrowLeftIcon size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
            {t(KIND_PLURAL[item.kind])}
          </Link>
          {item.project && (
            <>
              <span className="text-white/15">/</span>
              <Link href={`/projects/${item.project.id}`} className="truncate hover:text-white">
                {item.project.title}
              </Link>
            </>
          )}
          <span className="text-white/15">/</span>
          <span className="truncate text-white/50">{item.title}</span>
        </div>

        {/* ---------------- WORLD ---------------- */}
        {item.kind === "world" && (
          <>
            <section className="zx-rise-in relative mt-8 overflow-hidden rounded-[32px] border border-white/[0.1] bg-[#030303]" style={{ animationDelay: "60ms" }}>
              {item.map_url && !item.planet_url && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.map_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                </>
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(255,255,255,0.07),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="relative grid min-h-[460px] items-center gap-10 p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:p-14">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip strong>{t(KIND_LABEL.world)}</Chip>
                    {item.type_tag && <Chip>{tag("world", item.type_tag)}</Chip>}
                    {text("scale") && <Chip>{tag("scale", text("scale"))}</Chip>}
                  </div>
                  <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-7xl">{item.title}</h1>
                  {item.subtitle && <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 md:text-lg">{item.subtitle}</p>}
                  <div className="mt-7">{byline}</div>
                  {links && <div className="mt-6">{links}</div>}
                </div>
                {item.planet_url && (
                  <div className="relative mx-auto aspect-square w-full max-w-[420px]">
                    <div className="zx-orbit absolute inset-[-6%] rounded-full border border-dashed border-white/[0.08]" />
                    <div className="absolute inset-[4%] rounded-full border border-white/[0.05]" />
                    <button
                      type="button"
                      onClick={() => setLightbox(item.planet_url)}
                      className="zx-float absolute inset-[12%] overflow-hidden rounded-full"
                      aria-label={t("world.planet")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.planet_url} alt={item.title} className="zx-planet-glow h-full w-full rounded-full object-cover transition-transform duration-[1600ms] hover:scale-105" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            <div className="zx-rise-in mt-6" style={{ animationDelay: "120ms" }}>
              {actions}
            </div>

            {/* Quick facts */}
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Fact label={t("world.type")} value={tag("world", item.type_tag) || "—"} />
              <Fact label={t("world.scale")} value={tag("scale", text("scale")) || "—"} />
              <Fact label={t("world.era")} value={text("era") || "—"} />
              <Fact label={`${t("world.cities")} / ${t("world.kingdoms")}`} value={`${cities.length} / ${kingdoms.length}`} />
            </div>

            {item.map_url && (
              <section className="mt-14">
                <SectionLabel eyebrow={t("world.cartography")} title={t("world.map")} />
                <button
                  type="button"
                  onClick={() => setLightbox(item.map_url)}
                  className="group relative mt-6 block w-full overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#050505]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.map_url} alt={t("world.map")} className="mx-auto max-h-[760px] w-full object-contain transition-transform duration-[1600ms] ease-out group-hover:scale-[1.02]" />
                  <span className="absolute bottom-4 right-4 rounded-full bg-black/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 backdrop-blur transition-colors group-hover:text-white">
                    {t("world.openMap")}
                  </span>
                </button>
              </section>
            )}
          </>
        )}

        {/* ---------------- LORE ---------------- */}
        {item.kind === "lore" && (
          <>
            <section className="zx-rise-in relative mt-8 overflow-hidden rounded-[32px] border border-white/[0.1] bg-[#050505]" style={{ animationDelay: "60ms" }}>
              <div className="relative min-h-[380px] w-full md:min-h-[460px]">
                {item.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl p-6 text-center md:p-12">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Chip strong>{t(KIND_LABEL.lore)}</Chip>
                    {item.type_tag && <Chip>{tag("lore", item.type_tag)}</Chip>}
                    {text("era") && <Chip>{text("era")}</Chip>}
                  </div>
                  <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.04em] md:text-6xl">{item.title}</h1>
                  {item.subtitle && <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-lg">{item.subtitle}</p>}
                  <div className="mt-7 flex justify-center">{byline}</div>
                </div>
              </div>
            </section>
            <div className="zx-rise-in mt-6" style={{ animationDelay: "120ms" }}>
              {actions}
            </div>
            {links && <div className="mt-6">{links}</div>}
          </>
        )}

        {/* ---------------- CHARACTER ---------------- */}
        {item.kind === "character" && (
          <>
            <section className="zx-rise-in mt-8 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]" style={{ animationDelay: "60ms" }}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => item.cover_url && setLightbox(item.cover_url)}
                  className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#060606]"
                  aria-label={t("character.portrait")}
                >
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black text-white/[0.06]">
                      {item.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {text("mbti") && (
                    <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/60 px-3 py-1.5 font-mono text-[12px] font-bold tracking-[3px] text-white backdrop-blur">
                      {text("mbti")}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip strong>{t(KIND_LABEL.character)}</Chip>
                  {item.type_tag && <Chip>{tag("character", item.type_tag)}</Chip>}
                </div>
                <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-7xl">{item.title}</h1>
                {item.subtitle && <p className="mt-3 text-sm uppercase tracking-[3px] text-white/45">{item.subtitle}</p>}
                {text("quote") && (
                  <blockquote className="mt-8 border-l-2 border-white/40 pl-5 text-lg italic leading-8 text-white/75 md:text-xl">
                    “{text("quote")}”
                  </blockquote>
                )}

                <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {CHARACTER_SHORT.filter((field) => text(field.key)).map((field) => (
                    <div key={field.key} className="rounded-[18px] border border-white/[0.08] bg-white/[0.015] px-4 py-3">
                      <dt className="text-[9px] uppercase tracking-[2px] text-white/30">{t(field.label)}</dt>
                      <dd className="mt-1.5 truncate text-[14px] font-semibold text-white/85">{text(field.key)}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8">{byline}</div>
                {links && <div className="mt-6">{links}</div>}
              </div>
            </section>
            <div className="zx-rise-in mt-8" style={{ animationDelay: "120ms" }}>
              {actions}
            </div>
          </>
        )}

        {/* ---------------- BODY ---------------- */}
        <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            {item.kind === "lore" && (
              <article className="zx-rise-in relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#060606] p-6 md:p-12">
                {text("summary") && <p className="mb-10 border-b border-white/[0.06] pb-10 text-lg leading-8 text-white/70 md:text-xl">{text("summary")}</p>}
                <Markdown source={text("body")} noLinks images className="mx-auto max-w-3xl md:text-[17px] md:leading-8" />
              </article>
            )}

            {item.kind === "character" && (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {(["appearance", "personality"] as const).map((key) =>
                    text(key) ? (
                      <Panel key={key} eyebrow={t(key === "appearance" ? "character.appearanceEyebrow" : "character.personalityEyebrow")} title={t(`character.${key}` as TranslationKey)}>
                        <Markdown source={text(key)} noLinks />
                      </Panel>
                    ) : null,
                  )}
                </div>
                {(text("strengths") || text("weaknesses")) && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {text("strengths") && (
                      <Panel eyebrow="+" title={t("character.strengths")}>
                        <p className="whitespace-pre-line text-[14px] leading-7 text-white/70">{text("strengths")}</p>
                      </Panel>
                    )}
                    {text("weaknesses") && (
                      <Panel eyebrow="−" title={t("character.weaknesses")}>
                        <p className="whitespace-pre-line text-[14px] leading-7 text-white/70">{text("weaknesses")}</p>
                      </Panel>
                    )}
                  </div>
                )}
                {(["backstory", "abilities", "relationships"] as const).map((key) =>
                  text(key) ? (
                    <Panel key={key} eyebrow={t("creation.section")} title={t(`character.${key}` as TranslationKey)}>
                      <Markdown source={text(key)} noLinks />
                    </Panel>
                  ) : null,
                )}
              </>
            )}

            {item.kind === "world" &&
              sections.map((section, index) => (
                <Panel key={section.key} id={`world-${section.key}`} eyebrow={String(index + 1).padStart(2, "0")} title={t(section.label)}>
                  {section.rich ? (
                    <Markdown source={text(section.key)} noLinks />
                  ) : (
                    <p className="whitespace-pre-line text-[15px] leading-8 text-white/75">{text(section.key)}</p>
                  )}
                </Panel>
              ))}

            {item.kind === "world" && cities.length > 0 && (
              <section className="pt-8">
                <SectionLabel eyebrow={t("world.settlements")} title={`${t("world.cities")} · ${cities.length}`} />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {cities.map((city, index) => (
                    <div key={`${city.name}-${index}`} data-spotlight className="zx-rise-in relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#060606] p-6 transition-colors hover:border-white/20">
                      <div className="relative z-[3]">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold tracking-[-0.01em] text-white">{city.name}</h3>
                          {city.kind && <Chip>{city.kind}</Chip>}
                        </div>
                        {city.description && <p className="mt-3 whitespace-pre-line text-[13px] leading-6 text-white/55">{city.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.kind === "world" && kingdoms.length > 0 && (
              <section className="pt-8">
                <SectionLabel eyebrow={t("world.realms")} title={`${t("world.kingdoms")} · ${kingdoms.length}`} />
                <div className="mt-6 grid gap-4">
                  {kingdoms.map((kingdom, index) => (
                    <div key={`${kingdom.name}-${index}`} data-spotlight className="zx-rise-in relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#060606] p-6 md:p-8 transition-colors hover:border-white/20">
                      <div className="relative z-[3] grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                        <div>
                          <span className="font-mono text-[10px] tracking-[2px] text-white/25">{String(index + 1).padStart(2, "0")}</span>
                          <h3 className="mt-2 text-xl font-black tracking-[-0.02em] text-white">{kingdom.name}</h3>
                          <dl className="mt-4 space-y-2 text-[12px]">
                            {kingdom.ruler && (
                              <div>
                                <dt className="text-[9px] uppercase tracking-[2px] text-white/30">{t("world.ruler")}</dt>
                                <dd className="text-white/75">{kingdom.ruler}</dd>
                              </div>
                            )}
                            {kingdom.government && (
                              <div>
                                <dt className="text-[9px] uppercase tracking-[2px] text-white/30">{t("world.government")}</dt>
                                <dd className="text-white/75">{kingdom.government}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                        {kingdom.description && <p className="whitespace-pre-line text-[14px] leading-7 text-white/60">{kingdom.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.kind === "world" && (
              <section className="pt-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <SectionLabel eyebrow={t("world.inhabitants")} title={t("world.relatedTitle")} />
                  {canEdit && (
                    <div className="flex gap-2">
                      <Link href={`/create/character?world=${item.id}${item.project_id ? `&project=${item.project_id}` : ""}`} className={pillButton}>
                        <PlusIcon size={12} /> {t("create.character")}
                      </Link>
                      <Link href={`/create/lore?world=${item.id}${item.project_id ? `&project=${item.project_id}` : ""}`} className={pillButton}>
                        <PlusIcon size={12} /> {t("create.lore")}
                      </Link>
                    </div>
                  )}
                </div>
                {related.length ? (
                  <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((entry) => (
                      <CreationCard key={entry.id} item={entry} showProject={false} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-[20px] border border-dashed border-white/[0.1] px-6 py-10 text-center text-sm text-white/35">{t("world.relatedEmpty")}</p>
                )}
              </section>
            )}

            <div className="pt-12">
              <CommentsSection
                target="creation"
                targetId={item.id}
                teamIds={teamIds}
                canManage={canEdit}
                canDeleteAll={isAuthor}
                ownerName={item.author?.display_name}
                onCountChange={(delta) => setItem((current) => (current ? { ...current, comment_count: Math.max(0, current.comment_count + delta) } : current))}
              />
            </div>
          </div>

          {/* ASIDE */}
          <aside>
            <div className="space-y-4 xl:sticky xl:top-8">
              {item.kind === "character" && text("mbti") && <MbtiCard value={text("mbti")} />}

              {item.kind === "world" && sections.length > 1 && (
                <div className="rounded-[24px] border border-white/[0.1] bg-[#060606] p-6">
                  <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("world.contents")}</p>
                  <ol className="mt-4 space-y-1">
                    {sections.map((section, index) => (
                      <li key={section.key}>
                        <a href={`#world-${section.key}`} className="flex items-center gap-3 rounded-[10px] px-2 py-1.5 text-[12px] text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white">
                          <span className="font-mono text-[10px] text-white/25">{String(index + 1).padStart(2, "0")}</span>
                          {t(section.label)}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="rounded-[24px] border border-white/[0.1] bg-[#060606] p-6">
                <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("project.details")}</p>
                <dl className="mt-5 space-y-3 text-[12px]">
                  <Row label={t("creation.kind")} value={t(KIND_LABEL[item.kind])} />
                  {item.type_tag && <Row label={t(`creation.type.${item.kind}` as TranslationKey)} value={tag(item.kind, item.type_tag)} />}
                  <Row label={t("thread.started")} value={timeAgo(lang, item.created_at)} />
                  <Row label={t("project.updated")} value={timeAgo(lang, item.updated_at)} />
                  <Row label={t("forum.views")} value={formatNumber(lang, item.view_count)} />
                  <Row label={t("forum.likes")} value={formatNumber(lang, item.like_count)} />
                </dl>
              </div>
            </div>
          </aside>
        </div>
        <div className="h-24" />
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {reporting && <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="creation" targetId={item.id} />}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="zx-rise-in rounded-[20px] border border-white/[0.08] bg-[#060606] px-5 py-4">
      <p className="text-[9px] uppercase tracking-[2px] text-white/30">{label}</p>
      <p className="mt-2 truncate text-[15px] font-semibold text-white/85">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-white/30">{label}</dt>
      <dd className="truncate text-right text-white/70">{value}</dd>
    </div>
  );
}

function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[5px] text-white/25">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{title}</h2>
    </div>
  );
}

function Panel({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} data-spotlight className="zx-rise-in relative scroll-mt-24 overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#060606] p-6 transition-colors duration-500 hover:border-white/[0.16] md:p-9">
      <div className="relative z-[3]">
        <div className="mb-6 flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[2px] text-white/25">{eyebrow}</span>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setMounted(true);
    playSound("open");
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md zx-backdrop-in" onClick={onClose}>
      <div className={`absolute inset-0 ${zoom ? "overflow-auto" : "flex items-center justify-center p-4 md:p-10"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          onClick={(event) => {
            event.stopPropagation();
            setZoom((value) => !value);
          }}
          className={`zx-panel-in ${zoom ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in rounded-[16px] object-contain"}`}
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        data-sound="close"
        className="fixed right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/70 transition-all hover:rotate-90 hover:text-white"
      >
        <CloseIcon size={15} />
      </button>
      <p className="pointer-events-none fixed bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[2px] text-white/40">
        {t(zoom ? "world.zoomOut" : "world.zoomIn")}
      </p>
    </div>,
    document.body,
  );
}
