"use client";

import { useState } from "react";
import { likeThread, unlikeThread, likeReply, unlikeReply } from "@/lib/actions/likes";

interface LikeButtonProps {
  id: string;
  type: "thread" | "reply";
  count: number;
  hasLiked: boolean;
  onLikeChange?: (count: number) => void;
}

export function LikeButton({
  id,
  type,
  count: initialCount,
  hasLiked: initialHasLiked,
  onLikeChange,
}: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [loading, setLoading] = useState(false);

  async function handleLikeClick() {
    setLoading(true);

    let result;
    if (hasLiked) {
      result =
        type === "thread"
          ? await unlikeThread(id)
          : await unlikeReply(id);
      if (result.success) {
        setHasLiked(false);
        setCount((c) => Math.max(0, c - 1));
        onLikeChange?.(Math.max(0, count - 1));
      }
    } else {
      result =
        type === "thread"
          ? await likeThread(id)
          : await likeReply(id);
      if (result.success) {
        setHasLiked(true);
        setCount((c) => c + 1);
        onLikeChange?.(count + 1);
      }
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleLikeClick}
      disabled={loading}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-semibold tracking-[1px] uppercase
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${
          hasLiked
            ? "border-white/30 bg-white/[0.08] text-white hover:border-white/50"
            : "border-white/[0.12] bg-white/[0.03] text-white/40 hover:border-white/30 hover:text-white"
        }
      `}
    >
      <span>{hasLiked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}
