"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/actions/social";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function handleFollowClick() {
    setLoading(true);

    if (isFollowing) {
      const result = await unfollowUser(userId);
      if (result.success) {
        setIsFollowing(false);
        onFollowChange?.(false);
      }
    } else {
      const result = await followUser(userId);
      if (result.success) {
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleFollowClick}
      disabled={loading}
      className={`
        px-6 py-2 rounded-full border font-semibold text-[11px] tracking-[2px] uppercase
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isFollowing
            ? "border-white/25 bg-white/[0.06] text-white hover:border-white/40 hover:bg-white/[0.12]"
            : "border-white/25 bg-white text-black hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        }
      `}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
