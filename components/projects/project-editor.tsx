"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import { uploadImage } from "@/lib/forum/client";
import { clearProjectCover, fetchMembers, fetchProject, saveProject } from "@/lib/projects/client";
import { PROJECT_GENRES, containsLink } from "@/lib/projects/fields";
import type { ProjectStatus } from "@/lib/projects/types";
import { MarkdownEditor } from "@/components/forum/markdown-editor";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import {
  ErrorBox,
  FieldLabel,
  ImageSlot,
  emptySlot,
  ghostButton,
  inputClass,
  panelClass,
  solidButton,
  type ImageSlotState,
} from "./ui";
import { TagPicker } from "./tag-picker";

export function ProjectEditor({ editId }: { editId?: string }) {
  const router = useRouter();
  const { user, isStaff, loading: authLoading } = useAuth();
  const { t } = useI18n();

  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "missing">(editId ? "loading" : "ready");
  const [id, setId] = useState<string | undefined>(editId);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [genre, setGenre] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("in_progress");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<ImageSlotState>(emptySlot());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);

  useEffect(() => {
    if (!editId || authLoading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(`/create/project?edit=${editId}`)}`);
      return;
    }
    (async () => {
      const project = await fetchProject(editId);
      if (!project) return setStatus("missing");
      const members = await fetchMembers(editId);
      const allowed =
        isStaff || project.owner_id === user.id || members.some((m) => m.user_id === user.id && m.status === "accepted");
      if (!allowed) return setStatus("forbidden");
      setTitle(project.title);
      setTagline(project.tagline ?? "");
      setGenre(project.genre ?? "");
      setProjectStatus(project.status);
      setDescription(project.description);
      setCover(emptySlot(project.cover_url));
      setStatus("ready");
    })();
  }, [editId, user, isStaff, authLoading, router]);

  useEffect(() => {
    if (!editId && !authLoading && !user) router.replace(`/auth/login?next=${encodeURIComponent("/create/project")}`);
  }, [editId, authLoading, user, router]);

  const uploadCover = async (file: File, projectId: string) => {
    setCover((slot) => ({ ...slot, file, status: "uploading", error: undefined }));
    const result = await uploadImage(file, "project", { projectId });
    if (!result.ok) {
      setCover((slot) => ({ ...slot, status: "error", error: result.error }));
      playSound("error");
      return false;
    }
    setCover({
      url: result.data.status === "approved" ? result.data.url : cover.url,
      file: null,
      preview: result.data.status === "approved" ? null : URL.createObjectURL(file),
      status: result.data.status === "approved" ? "idle" : "pending",
    });
    return true;
  };

  const pickCover = (file: File) => {
    if (id) {
      void uploadCover(file, id);
    } else {
      setCover((slot) => ({ ...slot, file, preview: URL.createObjectURL(file), status: "idle", error: undefined }));
    }
  };

  const clearCover = async () => {
    if (id && cover.url) await clearProjectCover(id);
    setCover(emptySlot());
  };

  const submit = async () => {
    setError(null);
    if (title.trim().length < 3) return setError("error.titleLength");
    if (!description.trim()) return setError("project.form.descriptionRequired");
    if (containsLink(`${title}\n${tagline}\n${genre}\n${description}`)) return setError("error.linksNotAllowed");

    setSaving(true);
    const result = await saveProject({ title, tagline, genre, description, status: projectStatus }, id);
    if (!result.ok) {
      setSaving(false);
      setError(result.error);
      playSound("error");
      return;
    }
    const projectId = result.data.id;
    if (!id) {
      setId(projectId);
      window.history.replaceState(null, "", `/create/project?edit=${projectId}`);
    }

    if (cover.file) {
      const uploaded = await uploadCover(cover.file, projectId);
      if (!uploaded) {
        setSaving(false);
        setError("project.form.savedButImage");
        return;
      }
    }

    playSound("success");
    router.push(`/projects/${projectId}`);
  };

  if (status === "loading" || (authLoading && !editId)) return <EditorSkeleton />;
  if (status === "missing" || status === "forbidden") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[4px] text-white/30">{status === "missing" ? "404" : "403"}</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">
          {t(status === "missing" ? "project.notFound" : "error.forbidden")}
        </h1>
        <Link href="/projects" className={`${ghostButton} mt-8`}>
          <ArrowLeftIcon size={12} /> {t("project.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      <div className="mx-auto w-full max-w-[1100px] px-4 pt-10 md:px-6 md:pt-14">
        <Link
          href={id ? `/projects/${id}` : "/projects"}
          className="zx-rise-in group inline-flex items-center gap-2 text-[10px] uppercase tracking-[2.5px] text-white/30 hover:text-white"
        >
          <ArrowLeftIcon size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
          {t(id ? "project.backToProject" : "project.back")}
        </Link>

        <header className="zx-rise-in mt-8" style={{ animationDelay: "60ms" }}>
          <p className="text-[10px] uppercase tracking-[5px] text-white/30">{t("project.form.eyebrow")}</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">
            {t(editId ? "project.form.editTitle" : "project.form.newTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">{t("project.form.intro")}</p>
        </header>

        <div className="mt-12 space-y-8">
          <section className={`${panelClass} zx-rise-in p-6 md:p-9`} style={{ animationDelay: "120ms" }}>
            <ImageSlot
              label={t("project.form.cover")}
              hint={t("project.form.coverHint")}
              state={cover}
              onPick={pickCover}
              onClear={clearCover}
              aspect="aspect-[21/9]"
            />

            <div className="mt-8 grid gap-6">
              <div>
                <FieldLabel label={t("project.form.title")} required counter={`${title.length}/120`} />
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value.slice(0, 120))}
                  placeholder={t("project.form.titlePh")}
                  className={`${inputClass} h-14 text-lg font-semibold`}
                />
              </div>
              <div>
                <FieldLabel label={t("project.form.tagline")} hint={t("project.form.taglineHint")} counter={`${tagline.length}/200`} />
                <input
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value.slice(0, 200))}
                  placeholder={t("project.form.taglinePh")}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={`${panelClass} zx-rise-in p-6 md:p-9`} style={{ animationDelay: "160ms" }}>
            <TagPicker
              label={t("project.form.genre")}
              hint={t("project.form.genreHint")}
              group="genre"
              presets={PROJECT_GENRES}
              value={genre}
              onChange={setGenre}
            />

            <div className="mt-8">
              <FieldLabel label={t("project.form.status")} hint={t("project.form.statusHint")} />
              <div className="grid gap-3 sm:grid-cols-2">
                {(["in_progress", "completed"] as ProjectStatus[]).map((value) => {
                  const active = projectStatus === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      data-sound="toggle"
                      onClick={() => setProjectStatus(value)}
                      className={`flex items-center gap-4 rounded-[18px] border p-5 text-left transition-all duration-500 ${
                        active
                          ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                          : "border-white/[0.1] bg-white/[0.02] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                          active ? "border-black/20 bg-black text-white" : "border-white/15"
                        }`}
                      >
                        {value === "completed" ? <CheckIcon size={14} /> : <span className="h-2 w-2 animate-pulse rounded-full bg-current" />}
                      </span>
                      <span>
                        <span className="block text-[12px] font-bold uppercase tracking-[2px]">
                          {t(value === "completed" ? "projects.status.completed" : "projects.status.inProgress")}
                        </span>
                        <span className={`mt-1 block text-[12px] ${active ? "text-black/55" : "text-white/35"}`}>
                          {t(value === "completed" ? "project.form.completedDesc" : "project.form.inProgressDesc")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className={`${panelClass} zx-rise-in p-6 md:p-9`} style={{ animationDelay: "200ms" }}>
            <FieldLabel label={t("project.form.description")} hint={t("project.form.descriptionHint")} required />
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              maxLength={20000}
              rows={14}
              noLinks
              placeholder={t("project.form.descriptionPh")}
              onSubmitShortcut={() => void submit()}
            />
          </section>

          <p className="text-center text-[11px] leading-6 text-white/30">{t("projects.noLinksNotice")}</p>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1100px] items-center gap-4 px-4 py-4 md:px-6">
          <div className="min-w-0 flex-1">{error && <ErrorBox>{t(error)}</ErrorBox>}</div>
          <Link href={id ? `/projects/${id}` : "/projects"} className={ghostButton}>
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={() => void submit()} disabled={saving} data-sound="off" className={solidButton}>
            {saving ? t("common.saving") : t(editId ? "common.save" : "project.form.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-14 md:px-6">
      <span className="zx-skeleton block h-3 w-32 rounded" />
      <span className="zx-skeleton mt-10 block h-12 w-2/3 rounded-lg" />
      <span className="zx-skeleton mt-12 block h-64 w-full rounded-[24px]" />
      <span className="zx-skeleton mt-8 block h-40 w-full rounded-[24px]" />
    </div>
  );
}
