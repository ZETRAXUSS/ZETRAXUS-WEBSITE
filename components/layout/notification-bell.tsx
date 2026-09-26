"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, db } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/use-auth";
import { useI18n } from "@/lib/i18n/provider";
import { timeAgo, type TranslationKey } from "@/lib/i18n/translate";
import { playSound } from "@/lib/sound/engine";
import { Avatar } from "@/components/ui/avatar";
import { BellIcon, CheckIcon } from "@/components/ui/icons";

interface NotificationRow {
  id: string;
  type: "reply" | "thread_like" | "reply_like" | "follow" | "moderation";
  thread_id: string | null;
  reply_id: string | null;
  message: string | null;
  read_at: string | null;
  created_at: string;
  actor: { username: string; display_name: string; avatar_url: string | null } | null;
  thread: { id: string; title: string } | null;
}

const MESSAGE_KEYS: Record<string, TranslationKey> = {
  reply: "notif.reply",
  thread_like: "notif.threadLike",
  reply_like: "notif.replyLike",
  follow: "notif.follow",
  media_approved: "notif.mediaApproved",
  media_rejected: "notif.mediaRejected",
};

export function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ringKey, setRingKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await db()
      .from("notifications")
      .select(
        "id, type, thread_id, reply_id, message, read_at, created_at, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url), thread:forum_threads(id, title)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25);
    setItems((data as unknown as NotificationRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          load();
          setRingKey((key) => key + 1);
          playSound("notify");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const unread = items.filter((item) => !item.read_at).length;

  const markAllRead = async () => {
    const now = new Date().toISOString();
    setItems((list) => list.map((item) => (item.read_at ? item : { ...item, read_at: now })));
    await db().from("notifications").update({ read_at: now }).eq("user_id", user.id).is("read_at", null);
  };

  const openItem = async (item: NotificationRow) => {
    setOpen(false);
    if (!item.read_at) {
      const now = new Date().toISOString();
      setItems((list) => list.map((row) => (row.id === item.id ? { ...row, read_at: now } : row)));
      await db().from("notifications").update({ read_at: now }).eq("id", item.id);
    }
    if (item.thread_id) {
      router.push(`/forum/${item.thread_id}${item.reply_id ? `#reply-${item.reply_id}` : ""}`);
    } else if (item.type === "moderation" || item.type === "follow") {
      router.push("/profile");
    }
  };

  const describe = (item: NotificationRow) => {
    const key = MESSAGE_KEYS[item.type === "moderation" ? item.message ?? "" : item.type];
    if (!key) return item.message ?? "";
    return t(key, {
      name: item.actor?.display_name ?? t("common.someone"),
      title: item.thread?.title ?? "",
    });
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t("notif.title")}
        title={t("notif.title")}
        data-sound={open ? "close" : "open"}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
          open
            ? "border-white/40 bg-white/[0.08] text-white"
            : "border-white/[0.12] bg-white/[0.025] text-white/45 hover:border-white/30 hover:text-white"
        }`}
      >
        <span key={ringKey} className={ringKey ? "zx-ring" : ""}>
          <BellIcon size={16} />
        </span>
        {unread > 0 && (
          <span
            key={`badge-${unread}`}
            className="zx-pop absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#080808] bg-white px-1 text-[9px] font-bold text-black shadow-[0_0_14px_rgba(255,255,255,0.6)]"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="zx-drop-in absolute right-0 top-full z-50 mt-3 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-white/[0.1] bg-[#0a0a0a]/95 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div>
              <p className="text-[12px] font-semibold text-white">{t("notif.title")}</p>
              <p className="mt-0.5 text-[10px] text-white/35">
                {unread ? t("notif.unread", { count: unread }) : t("notif.allCaughtUp")}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[1.5px] text-white/50 hover:border-white/30 hover:text-white"
                data-sound="success"
              >
                <CheckIcon size={11} />
                {t("notif.markAll")}
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto overscroll-contain py-1">
            {loading &&
              [0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-3 px-5 py-3">
                  <span className="zx-skeleton h-9 w-9 rounded-full" />
                  <span className="flex-1 space-y-2">
                    <span className="zx-skeleton block h-3 w-4/5 rounded" />
                    <span className="zx-skeleton block h-2.5 w-1/3 rounded" />
                  </span>
                </div>
              ))}

            {!loading && items.length === 0 && (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] text-white/30">
                  <BellIcon size={16} />
                </span>
                <p className="mt-4 text-[12px] text-white/40">{t("notif.empty")}</p>
              </div>
            )}

            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className="zx-rise-in group relative flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.04]"
                style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
              >
                {!item.read_at && (
                  <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                )}
                <Avatar name={item.actor?.display_name ?? "Z"} src={item.actor?.avatar_url} size={34} ring />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[12px] leading-5 ${item.read_at ? "text-white/50" : "text-white/85"} group-hover:text-white`}
                  >
                    {describe(item)}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-white/25">{timeAgo(lang, item.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
