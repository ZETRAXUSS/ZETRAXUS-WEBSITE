"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, timeAgo, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import {
  acceptInvite,
  deleteProject,
  fetchComments,
  fetchCreations,
  fetchLiked,
  fetchMembers,
  fetchProject,
  incrementView,
  inviteMember,
  removeMember,
  setLike,
  setProjectStatus,
} from "@/lib/projects/client";
import type { CreationKind, CreationSummary, ProjectDetail, ProjectMember } from "@/lib/projects/types";
import { Markdown } from "@/components/forum/markdown";
import { ReportDialog } from "@/components/forum/report-dialog";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ArrowLeftIcon, CheckIcon, CloseIcon, EditIcon, FlagIcon, PlusIcon, ShareIcon, TrashIcon } from "@/components/ui/icons";
import { CreationCard } from "./cards";
import { CommentsSection } from "./comments";
import { Chip, ErrorBox, KIND_PLURAL, LikeButton, StatusBadge, iconButton, inputClass, pillButton, useTagLabel } from "./ui";

const KINDS: CreationKind[] = ["world", "lore", "character"];

export function ProjectView({ id }: { id: string }) {
  const router = useRouter();
  const { user, isStaff } = useAuth();
  const { t, lang } = useI18n();
  const tag = useTagLabel();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [creations, setCreations] = useState<CreationSummary[]>([]);
  const [contentTab, setContentTab] = useState<CreationKind>("world");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteError, setInviteError] = useState<TranslationKey | null>(null);
  const [inviteDone, setInviteDone] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [suggestionStats, setSuggestionStats] = useState<{ total: number; added: number } | null>(null);

  const loadMembers = useCallback(async () => setMembers(await fetchMembers(id)), [id]);

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return setStatus("missing");
    (async () => {
      const data = await fetchProject(id);
      if (!data) return setStatus("missing");
      setProject(data);
      setStatus("ready");
      const [, list] = await Promise.all([
        loadMembers(),
        fetchCreations({ projectId: id, sort: "new", page: 0, pageSize: 60, withFields: true }),
      ]);
      setCreations(list.items);
      const firstKind = KINDS.find((kind) => list.items.some((item) => item.kind === kind));
      if (firstKind) setContentTab(firstKind);
    })();
    void incrementView("project", id);
  }, [id, loadMembers]);

  useEffect(() => {
    if (!user || status !== "ready") return;
    fetchLiked(user.id, "project", [id]).then((set) => setLiked(set.has(id)));
  }, [user, id, status]);

  // Suggestion summary for the sidebar
  useEffect(() => {
    if (status !== "ready") return;
    fetchComments("project", id).then((list) => {
      const suggestions = list.filter((item) => item.kind === "suggestion");
      setSuggestionStats({ total: suggestions.length, added: suggestions.filter((item) => item.suggestion_state === "added").length });
    });
  }, [status, id, project?.comment_count]);

  const accepted = useMemo(() => members.filter((member) => member.status === "accepted"), [members]);
  const pending = useMemo(() => members.filter((member) => member.status === "pending"), [members]);
  const isOwner = !!user && project?.owner_id === user.id;
  const isMember = isOwner || (!!user && accepted.some((member) => member.user_id === user.id));
  const myInvite = !!user && pending.some((member) => member.user_id === user.id);
  const canEdit = isMember || isStaff;
  const teamIds = useMemo(() => (project ? [project.owner_id, ...accepted.map((member) => member.user_id)] : []), [project, accepted]);

  const requireUser = () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/projects/${id}`)}`);
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!requireUser() || !project || !user) return;
    const next = !liked;
    setLiked(next);
    setProject({ ...project, like_count: Math.max(0, project.like_count + (next ? 1 : -1)) });
    const result = await setLike("project", project.id, user.id, next);
    if (!result.ok) {
      setLiked(!next);
      setProject((current) => (current ? { ...current, like_count: current.like_count + (next ? -1 : 1) } : current));
    }
  };

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: project?.title, url });
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

  const toggleStatus = async () => {
    if (!project) return;
    const next = project.status === "completed" ? "in_progress" : "completed";
    const result = await setProjectStatus(project.id, next);
    if (result.ok) {
      setProject({ ...project, status: next, completed_at: next === "completed" ? new Date().toISOString() : null });
      playSound(next === "completed" ? "success" : "toggle");
    } else {
      playSound("error");
    }
  };

  const invite = async () => {
    if (!project || !user) return;
    setInviteError(null);
    setInviteDone(false);
    setInviting(true);
    const result = await inviteMember(project.id, user.id, inviteName);
    setInviting(false);
    if (!result.ok) {
      setInviteError(result.error);
      playSound("error");
      return;
    }
    setInviteName("");
    setInviteDone(true);
    playSound("success");
    await loadMembers();
  };

  if (status === "loading") return <ViewSkeleton />;
  if (status === "missing" || !project) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[4px] text-white/30">404</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">{t("project.notFound")}</h1>
        <p className="mt-3 text-sm text-white/40">{t("project.notFoundDesc")}</p>
        <Link href="/projects" className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-white hover:bg-white hover:text-black">
          <ArrowLeftIcon size={12} /> {t("project.back")}
        </Link>
      </div>
    );
  }

  const byKind = (kind: CreationKind) => creations.filter((item) => item.kind === kind);
  const tabItems = byKind(contentTab);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-10 md:px-6 md:pt-14">
        <div className="zx-rise-in flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[2.5px] text-white/30">
          <Link href="/projects" className="group flex items-center gap-2 hover:text-white">
            <ArrowLeftIcon size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
            {t("nav.projects")}
          </Link>
          <span className="text-white/15">/</span>
          <span className="truncate text-white/50">{project.title}</span>
        </div>

        {/* HERO */}
        <section className="zx-rise-in group relative mt-8 overflow-hidden rounded-[32px] border border-white/[0.1] bg-[#050505]" style={{ animationDelay: "60ms" }}>
          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            {project.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-[1.03]" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_50%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                {project.genre && <Chip strong>{tag("genre", project.genre)}</Chip>}
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-7xl">{project.title}</h1>
              {project.tagline && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-lg">{project.tagline}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-white/45">
                <Link href={project.owner ? `/u/${project.owner.username}` : "#"} className="flex items-center gap-2.5 hover:text-white">
                  <Avatar name={project.owner?.display_name ?? "?"} src={project.owner?.avatar_url} size={30} ring />
                  <span className="text-white/75">{project.owner?.display_name ?? t("common.deletedUser")}</span>
                </Link>
                <span>{t("project.startedAgo", { time: timeAgo(lang, project.created_at) })}</span>
                {project.status === "completed" && project.completed_at && (
                  <span className="flex items-center gap-1.5 text-white/70">
                    <CheckIcon size={11} /> {t("project.completedAgo", { time: timeAgo(lang, project.completed_at) })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Invite banner */}
        {myInvite && user && (
          <div className="zx-panel-in mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-white/30 bg-white/[0.04] px-6 py-5">
            <p className="text-sm text-white/80">{t("team.invitedBanner", { owner: project.owner?.display_name ?? "" })}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  await removeMember(project.id, user.id);
                  await loadMembers();
                  playSound("close");
                }}
                className="h-10 rounded-full border border-white/20 px-5 text-[10px] font-semibold uppercase tracking-[2px] text-white/60 hover:border-white/50 hover:text-white"
              >
                {t("team.decline")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const result = await acceptInvite(project.id, user.id);
                  if (result.ok) {
                    playSound("success");
                    await loadMembers();
                  }
                }}
                data-sound="off"
                className="h-10 rounded-full bg-white px-6 text-[10px] font-semibold uppercase tracking-[2px] text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
              >
                {t("team.accept")}
              </button>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="zx-rise-in mt-6 flex flex-wrap items-center gap-2" style={{ animationDelay: "120ms" }}>
          <LikeButton liked={liked} count={project.like_count} onToggle={() => void toggleLike()} />
          <a href="#comments" className={pillButton}>
            {t("comments.jump")} · {formatNumber(lang, project.comment_count)}
          </a>
          <button type="button" onClick={share} data-sound="off" className={pillButton}>
            {copied ? <CheckIcon size={14} /> : <ShareIcon size={14} />}
            {copied ? t("thread.copied") : t("thread.share")}
          </button>
          <span className="flex-1" />
          {canEdit && (
            <button
              type="button"
              onClick={() => void toggleStatus()}
              data-sound="off"
              className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-semibold transition-all duration-300 ${
                project.status === "completed"
                  ? "border-white/[0.12] text-white/60 hover:border-white/40 hover:text-white"
                  : "border-white/50 text-white hover:bg-white hover:text-black"
              }`}
            >
              <CheckIcon size={13} />
              {t(project.status === "completed" ? "project.reopen" : "project.markCompleted")}
            </button>
          )}
          {user && !isMember && (
            <button type="button" onClick={() => setReporting(true)} className={iconButton} title={t("report.title")} aria-label={t("report.title")}>
              <FlagIcon size={14} />
            </button>
          )}
          {canEdit && (
            <Link href={`/create/project?edit=${project.id}`} className={iconButton} title={t("common.edit")} aria-label={t("common.edit")}>
              <EditIcon size={14} />
            </Link>
          )}
          {(isOwner || isStaff) && (
            <ConfirmButton
              onConfirm={async () => {
                const result = await deleteProject(project.id);
                if (result.ok) {
                  playSound("close");
                  router.push("/projects");
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

        <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-14">
            {/* Description */}
            <article className="zx-rise-in relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#060606] p-6 md:p-10" style={{ animationDelay: "160ms" }}>
              <div className="pointer-events-none absolute -top-40 left-1/3 h-80 w-[600px] rounded-full bg-white/[0.03] blur-[100px]" />
              <p className="relative text-[10px] uppercase tracking-[4px] text-white/25">{t("project.about")}</p>
              <div className="relative mt-6">
                <Markdown source={project.description} noLinks className="md:text-[16px]" />
              </div>
              {project.edited_at && <p className="relative mt-8 text-[11px] text-white/25">{t("project.editedAgo", { time: timeAgo(lang, project.edited_at) })}</p>}
            </article>

            {/* Contents */}
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[5px] text-white/25">{t("project.contentsEyebrow")}</p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] md:text-3xl">{t("project.contents")}</h2>
                </div>
                <div className="flex gap-1 rounded-full border border-white/[0.1] p-1">
                  {KINDS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      data-sound="toggle"
                      onClick={() => setContentTab(kind)}
                      className={`flex h-9 items-center gap-2 rounded-full px-4 text-[10px] font-semibold uppercase tracking-[1.5px] transition-all duration-300 ${
                        contentTab === kind ? "bg-white text-black" : "text-white/45 hover:text-white"
                      }`}
                    >
                      {t(KIND_PLURAL[kind])}
                      <span className="opacity-60">{byKind(kind).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`mt-8 grid gap-x-6 gap-y-12 ${contentTab === "character" ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
                {tabItems.map((item) => (
                  <div key={item.id} className="zx-rise-in">
                    <CreationCard item={item} showProject={false} />
                  </div>
                ))}
                {canEdit && (
                  <Link
                    href={`/create/${contentTab}?project=${project.id}`}
                    className={`group flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/[0.14] text-white/40 transition-all duration-500 hover:border-white/40 hover:bg-white/[0.02] hover:text-white ${
                      contentTab === "character" ? "aspect-[3/4]" : "aspect-[4/3]"
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition-all duration-500 group-hover:rotate-90 group-hover:border-white/50">
                      <PlusIcon size={16} />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[2px]">{t(`project.add.${contentTab}` as TranslationKey)}</span>
                  </Link>
                )}
              </div>
              {tabItems.length === 0 && !canEdit && (
                <p className="rounded-[20px] border border-dashed border-white/[0.1] px-6 py-12 text-center text-sm text-white/35">{t("project.contentsEmpty")}</p>
              )}
            </section>

            <CommentsSection
              target="project"
              targetId={project.id}
              teamIds={teamIds}
              canManage={canEdit}
              canDeleteAll={isOwner}
              ownerName={project.owner?.display_name}
              onCountChange={(delta) =>
                setProject((current) => (current ? { ...current, comment_count: Math.max(0, current.comment_count + delta) } : current))
              }
            />
          </div>

          {/* ASIDE */}
          <aside>
            <div className="space-y-4 xl:sticky xl:top-8">
              <div className="zx-rise-in rounded-[24px] border border-white/[0.1] bg-[#060606] p-6" style={{ animationDelay: "140ms" }}>
                <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("project.details")}</p>
                <dl className="mt-5 space-y-3 text-[12px]">
                  <InfoRow label={t("project.form.status")} value={t(project.status === "completed" ? "projects.status.completed" : "projects.status.inProgress")} />
                  {project.genre && <InfoRow label={t("project.form.genre")} value={tag("genre", project.genre)} />}
                  <InfoRow label={t("thread.started")} value={timeAgo(lang, project.created_at)} />
                  <InfoRow label={t("project.updated")} value={timeAgo(lang, project.updated_at)} />
                  <InfoRow label={t("forum.views")} value={formatNumber(lang, project.view_count)} />
                  <InfoRow label={t("forum.likes")} value={formatNumber(lang, project.like_count)} />
                  {KINDS.map((kind) => (
                    <InfoRow key={kind} label={t(KIND_PLURAL[kind])} value={String(byKind(kind).length)} />
                  ))}
                </dl>
              </div>

              {suggestionStats && suggestionStats.total > 0 && (
                <div className="zx-rise-in rounded-[24px] border border-white/[0.1] bg-[#060606] p-6">
                  <p className="text-[9px] uppercase tracking-[3px] text-white/25">{t("project.suggestionsBoard")}</p>
                  <p className="mt-4 text-3xl font-black tracking-[-0.02em]">
                    {suggestionStats.added}
                    <span className="text-base font-medium text-white/30"> / {suggestionStats.total}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">{t("project.suggestionsAdded")}</p>
                  <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(suggestionStats.added / suggestionStats.total) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Team */}
              <div className="zx-rise-in rounded-[24px] border border-white/[0.1] bg-[#060606] p-6" style={{ animationDelay: "200ms" }}>
                <p className="text-[9px] uppercase tracking-[3px] text-white/25">
                  {t("team.title")} · {accepted.length + 1}
                </p>
                <ul className="mt-5 space-y-3">
                  {project.owner && (
                    <MemberRow member={project.owner} role={t("team.owner")} />
                  )}
                  {accepted.map((member) =>
                    member.user ? (
                      <MemberRow
                        key={member.user_id}
                        member={member.user}
                        role={t("team.member")}
                        action={
                          isOwner || member.user_id === user?.id ? (
                            <ConfirmButton
                              onConfirm={async () => {
                                await removeMember(project.id, member.user_id);
                                await loadMembers();
                                playSound("close");
                              }}
                              confirmLabel={t(member.user_id === user?.id ? "team.leaveConfirm" : "team.removeConfirm")}
                              title={t(member.user_id === user?.id ? "team.leave" : "team.remove")}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 hover:bg-white/[0.06] hover:text-white"
                              confirmClassName="flex h-7 items-center rounded-full border border-red-400/50 bg-red-500/10 px-2.5 text-[9px] font-semibold uppercase tracking-[1px] text-red-300"
                            >
                              <CloseIcon size={11} />
                            </ConfirmButton>
                          ) : null
                        }
                      />
                    ) : null,
                  )}
                </ul>

                {isOwner && pending.length > 0 && (
                  <div className="mt-6 border-t border-white/[0.06] pt-5">
                    <p className="text-[9px] uppercase tracking-[2px] text-white/25">{t("team.pending")}</p>
                    <ul className="mt-3 space-y-3">
                      {pending.map((member) =>
                        member.user ? (
                          <MemberRow
                            key={member.user_id}
                            member={member.user}
                            role={t("team.invited")}
                            dim
                            action={
                              <button
                                type="button"
                                onClick={async () => {
                                  await removeMember(project.id, member.user_id);
                                  await loadMembers();
                                }}
                                aria-label={t("team.cancelInvite")}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 hover:bg-white/[0.06] hover:text-white"
                              >
                                <CloseIcon size={11} />
                              </button>
                            }
                          />
                        ) : null,
                      )}
                    </ul>
                  </div>
                )}

                {isOwner && (
                  <div className="mt-6 border-t border-white/[0.06] pt-5">
                    <p className="mb-3 text-[9px] uppercase tracking-[2px] text-white/25">{t("team.invite")}</p>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void invite();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={inviteName}
                        onChange={(event) => {
                          setInviteName(event.target.value.slice(0, 21));
                          setInviteDone(false);
                        }}
                        placeholder={t("team.invitePh")}
                        className={`${inputClass} h-10 text-[13px]`}
                      />
                      <button
                        type="submit"
                        disabled={inviting || inviteName.trim().length < 3}
                        data-sound="off"
                        className="h-10 shrink-0 rounded-full bg-white px-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-black disabled:opacity-40"
                      >
                        {t("team.send")}
                      </button>
                    </form>
                    {inviteError && (
                      <div className="mt-3">
                        <ErrorBox>{t(inviteError)}</ErrorBox>
                      </div>
                    )}
                    {inviteDone && <p className="zx-rise-in mt-3 text-[11px] text-white/60">{t("team.inviteSent")}</p>}
                    <p className="mt-3 text-[11px] leading-5 text-white/25">{t("team.inviteHint")}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
        <div className="h-24" />
      </div>

      {reporting && <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="project" targetId={project.id} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-white/30">{label}</dt>
      <dd className="truncate text-right text-white/70">{value}</dd>
    </div>
  );
}

function MemberRow({
  member,
  role,
  action,
  dim,
}: {
  member: { username: string; display_name: string; avatar_url: string | null };
  role: string;
  action?: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <li className={`flex items-center gap-3 ${dim ? "opacity-60" : ""}`}>
      <Link href={`/u/${member.username}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90">
        <Avatar name={member.display_name} src={member.avatar_url} size={34} ring />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-white/85">{member.display_name}</span>
          <span className="block truncate text-[10px] uppercase tracking-[1.5px] text-white/30">{role}</span>
        </span>
      </Link>
      {action}
    </li>
  );
}

export function ViewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-14 md:px-6">
      <span className="zx-skeleton block h-3 w-40 rounded" />
      <span className="zx-skeleton mt-8 block aspect-[21/9] w-full rounded-[32px]" />
      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <span className="zx-skeleton block h-72 rounded-[28px]" />
        <span className="zx-skeleton hidden h-72 rounded-[24px] xl:block" />
      </div>
    </div>
  );
}
