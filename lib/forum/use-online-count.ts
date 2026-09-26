"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Live "online now" counter using Supabase Realtime presence. Every forum
 * visitor (signed in or not) joins one presence channel; the count is the
 * number of distinct presences.
 */
export function useOnlineCount(userId: string | null | undefined) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const key =
      userId ??
      (() => {
        try {
          const stored = window.sessionStorage.getItem("zx-presence-key");
          if (stored) return stored;
          const fresh = `guest-${Math.random().toString(36).slice(2, 10)}`;
          window.sessionStorage.setItem("zx-presence-key", fresh);
          return fresh;
        } catch {
          return `guest-${Math.random().toString(36).slice(2, 10)}`;
        }
      })();

    const channel = supabase.channel("zx-online", { config: { presence: { key } } });

    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: Date.now() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
