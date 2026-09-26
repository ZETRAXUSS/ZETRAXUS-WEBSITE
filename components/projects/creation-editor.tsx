"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import { uploadImage, type UploadKind } from "@/lib/forum/client";
import {
  canEditCreation,
  clearCreationImage,
  creationHref,
  fetchCreation,
  fetchEditableProjects,
  fetchEditableWorlds,
  saveCreation,
} from "@/lib/projects/client";
import {
  CHARACTER_ROLES,
  CHARACTER_SHORT,
  CITY_KINDS,
  LORE_TYPES,
  SECTIONS,
  WORLD_SCALES,
  WORLD_TYPES,
  containsLink,
  isValidMbti,
  type TextSection,
} from "@/lib/projects/fields";
import type { CityEntry, CreationFields, CreationKind, KingdomEntry } from "@/lib/projects/types";
import { MarkdownEditor } from "@/components/forum/markdown-editor";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CloseIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { EditorSkeleton } from "./project-editor";
import { MbtiPicker } from "./mbti";
import { TagPicker } from "./tag-picker";
import {
  ErrorBox,
  FieldLabel,
  ImageSlot,
  KIND_LABEL,
  emptySlot,
  ghostButton,
  inputClass,
  panelClass,
  solidButton,
  textareaClass,
  type ImageSlotState,
} from "./ui";

type SlotKey = "cover" | "map" | "planet";
const SLOT_COLUMN: Record<SlotKey, "cover_url" | "map_url" | "planet_url"> = {
  cover: "cover_url",
  map: "map_url",
  planet: "planet_url",
};

function slotKind(kind: CreationKind, slot: SlotKey): UploadKind {
  if (slot === "map") return "world_map";
  if (slot === "planet") return "world_planet";
  return kind === "lore" ? "lore" : "character";
}

interface Draft {
  title: string;
  subtitle: string;
  typeTag: string;
  fields: Record<string, string>;
  cities: CityEntry[];
  kingdoms: KingdomEntry[];
}

export function CreationEditor({
  kind,
  editId,
  presetProject,
  presetWorld,
}: {
  kind: CreationKind;
  editId?: string;
  presetProject?: string | null;
  presetWorld?: string | null;
}) {
  const router = useRouter();
  const { user, isStaff, loading: authLoading } = useAuth();
  const { t } = useI18n();

  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "missing">(editId ? "loading" : "ready");
  const [id, setId] = useState<string | undefined>(editId);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [typeTag, setTypeTag] = useState("");
  const [projectId, setProjectId] = useState<string | null>(presetProject ?? null);
  const [worldId, setWorldId] = useState<string | null>(kind === "world" ? null : presetWorld ?? null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [kingdoms, setKingdoms] = useState<KingdomEntry[]>([]);
  const [slots, setSlots] = useState<Record<SlotKey, ImageSlotState>>({
    cover: emptySlot(),
    map: emptySlot(),
    planet: emptySlot(),
  });
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [worlds, setWorlds] = useState<{ id: string; title: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [activeSection, setActiveSection] = useState("basics");
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const draftKey = `zx-draft-${kind}`;
  const sections = SECTIONS[kind];

  const setField = useCallback((key: string, value: string) => setFields((current) => ({ ...current, [key]: value })), []);

  // Auth / load ----------------------------------------------------------
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const next = editId ? `/create/${kind}?edit=${editId}` : `/create/${kind}`;
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    fetchEditableProjects(user.id).then(setProjects);
    if (kind !== "world") fetchEditableWorlds(user.id).then(setWorlds);

    if (!editId) {
      try {
        const raw = window.localStorage.getItem(draftKey);
        if (raw) {
          const draft = JSON.parse(raw) as Draft;
          setTitle(draft.title ?? "");
          setSubtitle(draft.subtitle ?? "");
          setTypeTag(draft.typeTag ?? "");
          setFields(draft.fields ?? {});
          setCities(draft.cities ?? []);
          setKingdoms(draft.kingdoms ?? []);
          if (draft.title || Object.keys(draft.fields ?? {}).length) setDraftRestored(true);
        }
      } catch {
        /* ignore */
      }
      return;
    }

    (async () => {
      const item = await fetchCreation(editId);
      if (!item || item.kind !== kind) return setStatus("missing");
      const allowed = isStaff || item.author_id === user.id || (await canEditCreation(editId));
      if (!allowed) return setStatus("forbidden");

      setTitle(item.title);
      setSubtitle(item.subtitle ?? "");
      setTypeTag(item.type_tag ?? "");
      setProjectId(item.project_id);
      setWorldId(item.world_id);
      const text: Record<string, string> = {};
      Object.entries(item.fields ?? {}).forEach(([key, value]) => {
        if (typeof value === "string") text[key] = value;
      });
      setFields(text);
      setCities(Array.isArray(item.fields?.cities) ? (item.fields.cities as CityEntry[]) : []);
      setKingdoms(Array.isArray(item.fields?.kingdoms) ? (item.fields.kingdoms as KingdomEntry[]) : []);
      setSlots({ cover: emptySlot(item.cover_url), map: emptySlot(item.map_url), planet: emptySlot(item.planet_url) });
      setStatus("ready");
    })();
  }, [authLoading, user, editId, kind, isStaff, router, draftKey]);

  // Draft autosave (new items only) ----------------------------------------
  useEffect(() => {
    if (id || status !== "ready") return;
    const timer = window.setTimeout(() => {
      try {
        const draft: Draft = { title, subtitle, typeTag, fields, cities, kingdoms };
        window.localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        /* ignore */
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [id, status, title, subtitle, typeTag, fields, cities, kingdoms, draftKey]);

  const discardDraft = () => {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
    setTitle("");
    setSubtitle("");
    setTypeTag("");
    setFields({});
    setCities([]);
    setKingdoms([]);
    setDraftRestored(false);
    playSound("close");
  };

  // Images --------------------------------------------------------------
  const uploadSlot = async (slot: SlotKey, file: File, creationId: string) => {
    setSlots((current) => ({ ...current, [slot]: { ...current[slot], file, status: "uploading", error: undefined } }));
    const result = await uploadImage(file, slotKind(kind, slot), { creationId, slot: "cover" });
    if (!result.ok) {
      setSlots((current) => ({ ...current, [slot]: { ...current[slot], status: "error", error: result.error } }));
      playSound("error");
      return false;
    }
    const approved = result.data.status === "approved";
    setSlots((current) => ({
      ...current,
      [slot]: {
        url: approved ? result.data.url : current[slot].url,
        file: null,
        preview: approved ? null : URL.createObjectURL(file),
        status: approved ? "idle" : "pending",
      },
    }));
    return true;
  };

  const pickSlot = (slot: SlotKey) => (file: File) => {
    if (id) void uploadSlot(slot, file, id);
    else
      setSlots((current) => ({
        ...current,
        [slot]: { ...current[slot], file, preview: URL.createObjectURL(file), status: "idle", error: undefined },
      }));
  };

  const clearSlot = (slot: SlotKey) => async () => {
    if (id && slots[slot].url) await clearCreationImage(id, SLOT_COLUMN[slot]);
    setSlots((current) => ({ ...current, [slot]: emptySlot() }));
  };

  // Completion ------------------------------------------------------------
  const filled = useMemo(() => {
    const done = new Set<string>();
    if (title.trim().length >= 2) done.add("basics");
    sections.forEach((section) => {
      if ((fields[section.key] ?? "").trim()) done.add(section.key);
    });
    if (cities.some((city) => city.name?.trim())) done.add("cities");
    if (kingdoms.some((kingdom) => kingdom.name?.trim())) done.add("kingdoms");
    if (slots.map.url || slots.map.file) done.add("images");
    if (slots.planet.url || slots.planet.file) done.add("images");
    if (slots.cover.url || slots.cover.file) done.add("images");
    if (kind === "character" && (fields.mbti || CHARACTER_SHORT.some((f) => (fields[f.key] ?? "").trim()))) done.add("profile");
    return done;
  }, [title, sections, fields, cities, kingdoms, slots, kind]);

  const nav = useMemo(() => {
    const items: { id: string; label: TranslationKey }[] = [
      { id: "basics", label: "creation.nav.basics" },
      { id: "images", label: kind === "world" ? "creation.nav.maps" : kind === "character" ? "creation.nav.portrait" : "creation.nav.cover" },
    ];
    if (kind === "character") items.push({ id: "profile", label: "creation.nav.profile" });
    sections.forEach((section) => {
      items.push({ id: section.key, label: section.label });
      if (kind === "world" && section.key === "geography") {
        items.push({ id: "cities", label: "world.cities" }, { id: "kingdoms", label: "world.kingdoms" });
      }
    });
    return items;
  }, [kind, sections]);

  const progress = Math.round((nav.filter((item) => filled.has(item.id)).length / nav.length) * 100);

  // Scroll spy
  useEffect(() => {
    if (status !== "ready") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(visible.target.id.replace("sec-", ""));
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    nav.forEach((item) => {
      const node = document.getElementById(`sec-${item.id}`);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [nav, status]);

  // Submit ----------------------------------------------------------------
  const submit = async () => {
    setError(null);
    if (title.trim().length < 2) return setError("error.titleLength");
    for (const section of sections) {
      if (section.required && !(fields[section.key] ?? "").trim()) return setError("error.missingFields");
    }
    if (kind === "character" && fields.mbti && !isValidMbti(fields.mbti)) return setError("error.badMbti");

    const payloadFields: CreationFields = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (value.trim()) payloadFields[key] = value.trim();
    });
    if (kind === "world") {
      const cleanCities = cities.filter((city) => city.name?.trim());
      const cleanKingdoms = kingdoms.filter((kingdom) => kingdom.name?.trim());
      if (cleanCities.length) payloadFields.cities = cleanCities;
      if (cleanKingdoms.length) payloadFields.kingdoms = cleanKingdoms;
    }

    const allText = [title, subtitle, typeTag, ...Object.values(fields), ...cities.flatMap(Object.values), ...kingdoms.flatMap(Object.values)]
      .filter((value): value is string => typeof value === "string")
      .join("\n");
    if (containsLink(allText)) return setError("error.linksNotAllowed");

    setSaving(true);
    const result = await saveCreation({ kind, title, subtitle, typeTag, projectId, worldId, fields: payloadFields }, id);
    if (!result.ok) {
      setSaving(false);
      setError(result.error);
      playSound("error");
      return;
    }

    const creationId = result.data.id;
    if (!id) {
      setId(creationId);
      window.history.replaceState(null, "", `/create/${kind}?edit=${creationId}`);
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
    }

    let imagesOk = true;
    for (const slot of ["cover", "map", "planet"] as SlotKey[]) {
      const file = slotsRef.current[slot].file;
      if (file) imagesOk = (await uploadSlot(slot, file, creationId)) && imagesOk;
    }

    if (!imagesOk) {
      setSaving(false);
      setError("creation.savedButImage");
      document.getElementById("sec-images")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    playSound("success");
    router.push(creationHref({ id: creationId, kind }));
  };

  if (status === "loading" || authLoading) return <EditorSkeleton />;
  if (status === "missing" || status === "forbidden") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-[4px] text-white/30">{status === "missing" ? "404" : "403"}</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">
          {t(status === "missing" ? "creation.notFound" : "error.forbidden")}
        </h1>
        <Link href="/projects" className={`${ghostButton} mt-8`}>
          <ArrowLeftIcon size={12} /> {t("project.back")}
        </Link>
      </div>
    );
  }

  const typePresets = kind === "world" ? WORLD_TYPES : kind === "lore" ? LORE_TYPES : CHARACTER_ROLES;
  const backHref = id ? creationHref({ id, kind }) : projectId ? `/projects/${projectId}` : `/projects?tab=${kind === "world" ? "worlds" : kind === "lore" ? "lore" : "characters"}`;

  return (
    <div className="min-h-screen bg-black pb-36 text-white">
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-10 md:px-6 md:pt-14">
        <Link href={backHref} className="zx-rise-in group inline-flex items-center gap-2 text-[10px] uppercase tracking-[2.5px] text-white/30 hover:text-white">
          <ArrowLeftIcon size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
          {t("common.back")}
        </Link>

        <header className="zx-rise-in mt-8" style={{ animationDelay: "60ms" }}>
          <p className="text-[10px] uppercase tracking-[5px] text-white/30">{t(KIND_LABEL[kind])}</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">
            {t(editId || id ? `creation.editTitle.${kind}` as TranslationKey : `creation.newTitle.${kind}` as TranslationKey)}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">{t(`creation.intro.${kind}` as TranslationKey)}</p>
        </header>

        {draftRestored && !id && (
          <div className="zx-rise-in mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/[0.12] bg-white/[0.03] px-5 py-4 text-[12px] text-white/60">
            {t("creation.draftRestored")}
            <button type="button" onClick={discardDraft} className="text-[10px] font-semibold uppercase tracking-[2px] text-white/50 hover:text-white">
              {t("creation.discardDraft")}
            </button>
          </div>
        )}

        <div className="mt-12 grid gap-10 xl:grid-cols-[220px_minmax(0,1fr)]">
          {/* Section nav */}
          <aside className="hidden xl:block">
            <div className="sticky top-8">
              <div className="mb-5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[2px] text-white/30">
                  <span>{t("creation.completion")}</span>
                  <span className="tabular-nums text-white/60">{progress}%</span>
                </div>
                <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-white/70 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <nav className="space-y-0.5">
                {nav.map((item) => {
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-sound-hover="off"
                      onClick={() => document.getElementById(`sec-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left text-[12px] transition-all duration-300 ${
                        active ? "bg-white/[0.07] text-white" : "text-white/40 hover:text-white/80"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                          filled.has(item.id) ? "border-white bg-white text-black" : "border-white/20"
                        }`}
                      >
                        {filled.has(item.id) && <CheckIcon size={9} />}
                      </span>
                      <span className="truncate">{t(item.label)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 space-y-8">
            {/* Basics */}
            <section id="sec-basics" className={`${panelClass} zx-rise-in scroll-mt-8 p-6 md:p-9`}>
              <SectionTitle index={1} title={t("creation.nav.basics")} />
              <div className="grid gap-6">
                <div>
                  <FieldLabel label={t(`creation.name.${kind}` as TranslationKey)} required counter={`${title.length}/120`} />
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value.slice(0, 120))}
                    placeholder={t(`creation.namePh.${kind}` as TranslationKey)}
                    className={`${inputClass} h-14 text-lg font-semibold`}
                  />
                </div>
                <div>
                  <FieldLabel label={t(`creation.subtitle.${kind}` as TranslationKey)} counter={`${subtitle.length}/160`} />
                  <input
                    value={subtitle}
                    onChange={(event) => setSubtitle(event.target.value.slice(0, 160))}
                    placeholder={t(`creation.subtitlePh.${kind}` as TranslationKey)}
                    className={inputClass}
                  />
                </div>

                <TagPicker
                  label={t(`creation.type.${kind}` as TranslationKey)}
                  hint={t(`creation.typeHint.${kind}` as TranslationKey)}
                  group={kind}
                  presets={typePresets}
                  value={typeTag}
                  onChange={setTypeTag}
                />

                {kind === "world" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel label={t("world.scale")} hint={t("world.scaleHint")} />
                      <div className="flex flex-wrap gap-2">
                        {WORLD_SCALES.map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            data-sound="toggle"
                            onClick={() => setField("scale", fields.scale === scale ? "" : scale)}
                            className={`rounded-full border px-3.5 py-1.5 text-[11px] transition-all duration-300 ${
                              fields.scale === scale
                                ? "border-white bg-white text-black"
                                : "border-white/[0.12] text-white/50 hover:border-white/40 hover:text-white"
                            }`}
                          >
                            {t(`tag.scale.${scale}` as TranslationKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ShortInput label={t("world.era")} placeholder={t("world.eraPh")} value={fields.era ?? ""} max={120} onChange={(v) => setField("era", v)} />
                  </div>
                )}
                {kind === "lore" && (
                  <ShortInput label={t("lore.era")} placeholder={t("lore.eraPh")} value={fields.era ?? ""} max={120} onChange={(v) => setField("era", v)} />
                )}

                {/* Links: project + world */}
                <div className="grid gap-6 border-t border-white/[0.06] pt-6 md:grid-cols-2">
                  <LinkSelect
                    label={t("creation.project")}
                    hint={t("creation.projectHint")}
                    emptyLabel={t("creation.standalone")}
                    options={projects}
                    value={projectId}
                    onChange={setProjectId}
                  />
                  {kind !== "world" && (
                    <LinkSelect
                      label={t("creation.world")}
                      hint={t("creation.worldHint")}
                      emptyLabel={t("creation.noWorld")}
                      options={worlds}
                      value={worldId}
                      onChange={setWorldId}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Images */}
            <section id="sec-images" className={`${panelClass} zx-rise-in scroll-mt-8 p-6 md:p-9`}>
              <SectionTitle
                index={2}
                title={t(kind === "world" ? "creation.nav.maps" : kind === "character" ? "creation.nav.portrait" : "creation.nav.cover")}
              />
              {kind === "world" ? (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                  <ImageSlot
                    label={t("world.map")}
                    hint={t("world.mapHint")}
                    state={slots.map}
                    onPick={pickSlot("map")}
                    onClear={clearSlot("map")}
                    aspect="aspect-[16/10]"
                    aiBadge={t("world.aiCheckMap")}
                  />
                  <ImageSlot
                    label={t("world.planet")}
                    hint={t("world.planetHint")}
                    state={slots.planet}
                    onPick={pickSlot("planet")}
                    onClear={clearSlot("planet")}
                    aspect="aspect-square"
                    round
                    aiBadge={t("world.aiCheckPlanet")}
                  />
                </div>
              ) : (
                <div className={kind === "character" ? "max-w-sm" : ""}>
                  <ImageSlot
                    label={t(kind === "character" ? "character.portrait" : "lore.cover")}
                    hint={t(kind === "character" ? "character.portraitHint" : "lore.coverHint")}
                    state={slots.cover}
                    onPick={pickSlot("cover")}
                    onClear={clearSlot("cover")}
                    aspect={kind === "character" ? "aspect-[3/4]" : "aspect-[21/9]"}
                  />
                </div>
              )}
            </section>

            {/* Character profile */}
            {kind === "character" && (
              <section id="sec-profile" className={`${panelClass} zx-rise-in scroll-mt-8 p-6 md:p-9`}>
                <SectionTitle index={3} title={t("creation.nav.profile")} />
                <div className="grid gap-6">
                  <ShortInput
                    label={t("character.quote")}
                    placeholder={t("character.quotePh")}
                    value={fields.quote ?? ""}
                    max={300}
                    onChange={(v) => setField("quote", v)}
                  />
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {CHARACTER_SHORT.map((field) => (
                      <ShortInput
                        key={field.key}
                        label={t(field.label)}
                        placeholder={field.placeholder ? t(field.placeholder) : undefined}
                        value={fields[field.key] ?? ""}
                        max={field.max}
                        onChange={(v) => setField(field.key, v)}
                      />
                    ))}
                  </div>
                  <MbtiPicker value={fields.mbti ?? ""} onChange={(v) => setField("mbti", v)} />
                </div>
              </section>
            )}

            {/* Text sections */}
            {sections.map((section, index) => (
              <div key={section.key} className="space-y-8">
                <section id={`sec-${section.key}`} className={`${panelClass} scroll-mt-8 p-6 md:p-9`}>
                  <SectionTitle index={index + (kind === "character" ? 4 : 3)} title={t(section.label)} required={section.required} />
                  <TextSectionField
                    section={section}
                    value={fields[section.key] ?? ""}
                    onChange={(v) => setField(section.key, v)}
                    inlineImages={kind === "lore" && section.key === "body"}
                    onSubmit={() => void submit()}
                  />
                </section>

                {kind === "world" && section.key === "geography" && (
                  <>
                    <section id="sec-cities" className={`${panelClass} scroll-mt-8 p-6 md:p-9`}>
                      <SectionTitle title={t("world.cities")} hint={t("world.citiesHint")} />
                      <ListEditor
                        items={cities as unknown as ListItem[]}
                        onChange={(items) => setCities(items as unknown as CityEntry[])}
                        max={40}
                        addLabel={t("world.addCity")}
                        fields={[
                          { key: "name", label: t("world.cityName"), max: 80, required: true },
                          { key: "kind", label: t("world.cityKind"), max: 40, presets: CITY_KINDS, group: "city" },
                        ]}
                        descriptionLabel={t("world.cityDescription")}
                      />
                    </section>
                    <section id="sec-kingdoms" className={`${panelClass} scroll-mt-8 p-6 md:p-9`}>
                      <SectionTitle title={t("world.kingdoms")} hint={t("world.kingdomsHint")} />
                      <ListEditor
                        items={kingdoms as unknown as ListItem[]}
                        onChange={(items) => setKingdoms(items as unknown as KingdomEntry[])}
                        max={30}
                        addLabel={t("world.addKingdom")}
                        fields={[
                          { key: "name", label: t("world.kingdomName"), max: 80, required: true },
                          { key: "ruler", label: t("world.ruler"), max: 80 },
                          { key: "government", label: t("world.government"), max: 60 },
                        ]}
                        descriptionLabel={t("world.kingdomDescription")}
                        descriptionMax={3000}
                      />
                    </section>
                  </>
                )}
              </div>
            ))}

            <p className="text-center text-[11px] leading-6 text-white/30">{t("projects.noLinksNotice")}</p>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="h-full bg-white/60 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="mx-auto flex w-full max-w-[1320px] items-center gap-4 px-4 py-4 md:px-6">
          <div className="min-w-0 flex-1">
            {error ? (
              <ErrorBox>{t(error)}</ErrorBox>
            ) : (
              <p className="hidden text-[11px] text-white/30 sm:block">
                {t("creation.completion")} · <span className="tabular-nums text-white/60">{progress}%</span>
                {!id && <span className="ml-3 text-white/20">{t("creation.autosaved")}</span>}
              </p>
            )}
          </div>
          <Link href={backHref} className={ghostButton}>
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={() => void submit()} disabled={saving} data-sound="off" className={solidButton}>
            {saving ? t("common.saving") : t(id ? "common.save" : "project.form.publish")}
            {!saving && <ArrowRightIcon size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SectionTitle({ index, title, hint, required }: { index?: number; title: string; hint?: string; required?: boolean }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-4">
        {index !== undefined && <span className="font-mono text-[10px] tracking-[2px] text-white/25">{String(index).padStart(2, "0")}</span>}
        <h2 className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">
          {title}
          {required && <span className="ml-1 text-white/60">*</span>}
        </h2>
      </div>
      {hint && <p className="mt-2 text-[13px] leading-6 text-white/35">{hint}</p>}
    </div>
  );
}

function ShortInput({
  label,
  placeholder,
  value,
  max,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <input value={value} onChange={(event) => onChange(event.target.value.slice(0, max))} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

function TextSectionField({
  section,
  value,
  onChange,
  inlineImages,
  onSubmit,
}: {
  section: TextSection;
  value: string;
  onChange: (value: string) => void;
  inlineImages?: boolean;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <p className="-mt-4 mb-4 text-[13px] leading-6 text-white/35">{t(section.hint)}</p>
      {section.rich ? (
        <MarkdownEditor
          value={value}
          onChange={onChange}
          maxLength={section.max}
          rows={section.rows}
          noLinks
          inlineImages={inlineImages ? "lore" : undefined}
          maxAttachments={inlineImages ? 12 : 0}
          onSubmitShortcut={onSubmit}
        />
      ) : (
        <div className="relative">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value.slice(0, section.max))}
            rows={section.rows}
            className={textareaClass}
          />
          <span className="pointer-events-none absolute bottom-3 right-4 text-[10px] tabular-nums text-white/20">
            {value.length}/{section.max}
          </span>
        </div>
      )}
    </div>
  );
}

function LinkSelect({
  label,
  hint,
  emptyLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  emptyLabel: string;
  options: { id: string; title: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const known = !value || options.some((option) => option.id === value);
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value || null)}
          className={`${inputClass} appearance-none pr-10`}
        >
          <option value="" className="bg-black">
            {emptyLabel}
          </option>
          {!known && value && (
            <option value={value} className="bg-black">
              …
            </option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id} className="bg-black">
              {option.title}
            </option>
          ))}
        </select>
        <ArrowRightIcon size={12} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/30" />
      </div>
    </div>
  );
}

type ListItem = Record<string, string | undefined>;

function ListEditor({
  items,
  onChange,
  max,
  addLabel,
  fields,
  descriptionLabel,
  descriptionMax = 2000,
}: {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  max: number;
  addLabel: string;
  fields: { key: string; label: string; max: number; required?: boolean; presets?: readonly string[]; group?: string }[];
  descriptionLabel: string;
  descriptionMax?: number;
}) {
  const { t } = useI18n();
  const update = (index: number, key: string, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-[18px] border border-dashed border-white/[0.1] px-6 py-8 text-center text-[13px] text-white/30">
          {t("world.listEmpty")}
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="zx-rise-in rounded-[18px] border border-white/[0.1] bg-white/[0.015] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[2px] text-white/25">#{String(index + 1).padStart(2, "0")}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={t("world.moveUp")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
              >
                <ArrowRightIcon size={11} className="-rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={t("world.moveDown")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
              >
                <ArrowRightIcon size={11} className="rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={t("common.remove")}
                data-sound="close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:bg-red-500/10 hover:text-red-300"
              >
                <TrashIcon size={12} />
              </button>
            </div>
          </div>

          <div className={`grid gap-4 ${fields.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {fields.map((field) => (
              <div key={field.key}>
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[2px] text-white/45">
                  {field.label}
                  {field.required && " *"}
                </p>
                <input
                  value={item[field.key] ?? ""}
                  onChange={(event) => update(index, field.key, event.target.value.slice(0, field.max))}
                  className={`${inputClass} h-11`}
                />
                {field.presets && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {field.presets.map((preset) => {
                      const label = t(`tag.${field.group}.${preset}` as TranslationKey);
                      const active = item[field.key] === label;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => update(index, field.key, active ? "" : label)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] transition-all ${
                            active ? "border-white bg-white text-black" : "border-white/[0.1] text-white/40 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[2px] text-white/45">{descriptionLabel}</p>
            <textarea
              value={item.description ?? ""}
              onChange={(event) => update(index, "description", event.target.value.slice(0, descriptionMax))}
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      ))}

      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, { name: "" }])}
          data-sound="open"
          className="group flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-white/[0.14] py-5 text-[11px] font-semibold uppercase tracking-[2px] text-white/40 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.02] hover:text-white"
        >
          <PlusIcon size={13} className="transition-transform duration-500 group-hover:rotate-90" />
          {addLabel}
          <span className="text-white/20">
            {items.length}/{max}
          </span>
        </button>
      )}
      {items.length >= max && (
        <p className="flex items-center justify-center gap-2 text-[11px] text-white/30">
          <CloseIcon size={10} /> {t("error.tooManyItems")}
        </p>
      )}
    </div>
  );
}
