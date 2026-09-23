/**
 * Re-export all auth utilities for easier importing.
 */

export { createClient } from "@/lib/supabase/client";
export { createClient as createServerClient } from "@/lib/supabase/server";
export { useAuth } from "@/lib/auth/use-auth";

// Server actions
export { loginUser, registerUser, logoutUser, getSession, getCurrentProfile } from "@/lib/actions/auth";

// Profile actions
export {
  getProfileById,
  getProfileByUsername,
  updateProfile,
  getFollowerCount,
  getFollowingCount,
  isFollowing,
} from "@/lib/actions/profiles";

// Social actions
export { followUser, unfollowUser } from "@/lib/actions/social";

// Forum actions
export {
  getForumCategories,
  getCategoryBySlug,
  getThreadsByCategory,
  getThreadWithReplies,
  createThread,
  updateThread,
  deleteThread,
  createReply,
  updateReply,
  deleteReply,
} from "@/lib/actions/forum";

// Like actions
export {
  likeThread,
  unlikeThread,
  getThreadLikeCount,
  hasLikedThread,
  likeReply,
  unlikeReply,
  getReplyLikeCount,
  hasLikedReply,
} from "@/lib/actions/likes";
