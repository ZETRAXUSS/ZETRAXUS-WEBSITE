/**
 * Authentication and user-related types.
 */

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export type ProfileRole = "user" | "creator" | "moderator" | "admin";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  is_banned: boolean;
  banned_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}
