# ZETRAXUS Features & API Reference

Complete guide to authentication, user profiles, forum, and social features.

## Table of Contents

1. [Authentication](#authentication)
2. [User Profiles](#user-profiles)
3. [Follow System](#follow-system)
4. [Forum](#forum)
5. [Likes](#likes)
6. [Client Usage](#client-usage)

---

## Authentication

### Server Actions

#### `registerUser(email, password, displayName)`

Register a new user.

```typescript
import { registerUser } from "@/lib/auth";

const result = await registerUser(
  "user@example.com",
  "password123",
  "Display Name"
);

if (result.success) {
  // Registration successful
  console.log(result.user?.id);
} else {
  console.error(result.error);
}
```

#### `loginUser(email, password)`

Log in a user.

```typescript
import { loginUser } from "@/lib/auth";

const result = await loginUser("user@example.com", "password123");

if (result.success) {
  // Login successful, redirect to /profile
}
```

#### `logoutUser()`

Log out the current user.

```typescript
import { logoutUser } from "@/lib/auth";

await logoutUser(); // Redirects to home
```

#### `getSession()`

Get the current session (server-side).

```typescript
import { getSession } from "@/lib/auth";

const session = await getSession();
if (session) {
  console.log(session.user.email);
}
```

#### `getCurrentProfile()`

Get the authenticated user's profile.

```typescript
import { getCurrentProfile } from "@/lib/auth";

const profile = await getCurrentProfile();
if (profile) {
  console.log(profile.display_name);
}
```

### Client Hook

#### `useAuth()`

Access auth state in client components.

```typescript
"use client";

import { useAuth } from "@/lib/auth";

export function MyComponent() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome, {profile?.display_name}!</div>;
}
```

---

## User Profiles

### Server Actions

#### `getProfileById(id)`

Get a user profile by ID.

```typescript
import { getProfileById } from "@/lib/auth";

const profile = await getProfileById("user-id");
console.log(profile?.display_name);
```

#### `getProfileByUsername(username)`

Get a user profile by username.

```typescript
import { getProfileByUsername } from "@/lib/auth";

const profile = await getProfileByUsername("creator123");
console.log(profile?.bio);
```

#### `updateProfile(updates)`

Update the current user's profile. Must be authenticated.

```typescript
import { updateProfile } from "@/lib/auth";

const result = await updateProfile({
  display_name: "New Name",
  bio: "Updated bio",
  avatar_url: "emoji-or-url",
});

if (result.success) {
  console.log(result.profile);
}
```

#### `getFollowerCount(userId)` & `getFollowingCount(userId)`

Get follower/following counts.

```typescript
import { getFollowerCount, getFollowingCount } from "@/lib/auth";

const followers = await getFollowerCount("user-id");
const following = await getFollowingCount("user-id");
```

#### `isFollowing(userId)`

Check if current user follows another user.

```typescript
import { isFollowing } from "@/lib/auth";

const following = await isFollowing("user-id");
```

---

## Follow System

### Server Actions

#### `followUser(userId)`

Follow a user. Must be authenticated.

```typescript
import { followUser } from "@/lib/auth";

const result = await followUser("user-id");
if (result.success) {
  console.log("Following!");
} else {
  console.error(result.error); // "Cannot follow yourself", etc.
}
```

#### `unfollowUser(userId)`

Unfollow a user. Must be authenticated.

```typescript
import { unfollowUser } from "@/lib/auth";

const result = await unfollowUser("user-id");
```

### Components

#### `<FollowButton />`

Ready-to-use follow button component.

```typescript
import { FollowButton } from "@/components/social/follow-button";

export function ProfileCard({ userId, isFollowing }) {
  return (
    <FollowButton
      userId={userId}
      isFollowing={isFollowing}
      onFollowChange={(isNowFollowing) => {
        // Handle state change
      }}
    />
  );
}
```

---

## Forum

### Categories

Categories are pre-created:
- General
- Projects
- Worlds
- Stories
- Characters
- Theory

### Server Actions

#### `getForumCategories()`

Get all forum categories.

```typescript
import { getForumCategories } from "@/lib/auth";

const categories = await getForumCategories();
```

#### `getCategoryBySlug(slug)`

Get a category by slug.

```typescript
import { getCategoryBySlug } from "@/lib/auth";

const category = await getCategoryBySlug("general");
```

#### `getThreadsByCategory(categoryId, limit, offset)`

Get threads in a category (paginated).

```typescript
import { getThreadsByCategory } from "@/lib/auth";

const threads = await getThreadsByCategory(
  "category-id",
  20, // limit
  0   // offset
);
```

#### `getThreadWithReplies(threadId)`

Get a thread and all its replies.

```typescript
import { getThreadWithReplies } from "@/lib/auth";

const { thread, replies } = await getThreadWithReplies("thread-id");
```

#### `createThread(categoryId, title, body)`

Create a new thread. Must be authenticated.

```typescript
import { createThread } from "@/lib/auth";

const result = await createThread(
  "category-id",
  "Thread Title",
  "Thread content..."
);

if (result.success) {
  console.log(result.thread?.id);
}
```

#### `updateThread(threadId, title, body)`

Update a thread (author only).

```typescript
import { updateThread } from "@/lib/auth";

const result = await updateThread(
  "thread-id",
  "Updated Title",
  "Updated content..."
);
```

#### `deleteThread(threadId)`

Delete a thread (author only).

```typescript
import { deleteThread } from "@/lib/auth";

const result = await deleteThread("thread-id");
```

#### `createReply(threadId, body)`

Create a reply. Must be authenticated.

```typescript
import { createReply } from "@/lib/auth";

const result = await createReply("thread-id", "Reply content...");
```

#### `updateReply(replyId, body)`

Update a reply (author only).

```typescript
import { updateReply } from "@/lib/auth";

const result = await updateReply("reply-id", "Updated content...");
```

#### `deleteReply(replyId)`

Delete a reply (author only).

```typescript
import { deleteReply } from "@/lib/auth";

const result = await deleteReply("reply-id");
```

---

## Likes

### Server Actions

#### `likeThread(threadId)` & `unlikeThread(threadId)`

Like/unlike a thread. Must be authenticated.

```typescript
import { likeThread, unlikeThread } from "@/lib/auth";

const result = await likeThread("thread-id");
```

#### `getThreadLikeCount(threadId)`

Get number of likes on a thread.

```typescript
import { getThreadLikeCount } from "@/lib/auth";

const count = await getThreadLikeCount("thread-id");
```

#### `hasLikedThread(threadId)`

Check if current user has liked a thread.

```typescript
import { hasLikedThread } from "@/lib/auth";

const liked = await hasLikedThread("thread-id");
```

#### `likeReply(replyId)` & `unlikeReply(replyId)`

Like/unlike a reply. Must be authenticated.

```typescript
import { likeReply, unlikeReply } from "@/lib/auth";

const result = await likeReply("reply-id");
```

#### `getReplyLikeCount(replyId)`

Get number of likes on a reply.

```typescript
import { getReplyLikeCount } from "@/lib/auth";

const count = await getReplyLikeCount("reply-id");
```

#### `hasLikedReply(replyId)`

Check if current user has liked a reply.

```typescript
import { hasLikedReply } from "@/lib/auth";

const liked = await hasLikedReply("reply-id");
```

### Components

#### `<LikeButton />`

Ready-to-use like button component.

```typescript
import { LikeButton } from "@/components/forum/like-button";

export function ThreadView({ threadId, likeCount, hasLiked }) {
  return (
    <LikeButton
      id={threadId}
      type="thread"
      count={likeCount}
      hasLiked={hasLiked}
      onLikeChange={(newCount) => {
        // Handle count change
      }}
    />
  );
}
```

---

## Client Usage

### Example: Profile Page

```typescript
"use client";

import { useAuth } from "@/lib/auth";
import { FollowButton } from "@/components/social/follow-button";

export function ProfileSection({ profileId }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function load() {
      const prof = await getProfileById(profileId);
      setProfile(prof);
      
      if (user) {
        const following = await isFollowing(profileId);
        setIsFollowing(following);
      }
    }
    load();
  }, [profileId, user]);

  return (
    <div>
      <h1>{profile?.display_name}</h1>
      <p>{profile?.bio}</p>
      {user && user.id !== profileId && (
        <FollowButton
          userId={profileId}
          isFollowing={isFollowing}
        />
      )}
    </div>
  );
}
```

### Example: Forum Thread

```typescript
"use client";

import { useAuth } from "@/lib/auth";
import { LikeButton } from "@/components/forum/like-button";

export function ThreadCard({ threadId }) {
  const { user } = useAuth();
  const [thread, setThread] = useState(null);

  useEffect(() => {
    async function load() {
      const { thread: t } = await getThreadWithReplies(threadId);
      setThread(t);
    }
    load();
  }, [threadId]);

  return (
    <article>
      <h2>{thread?.title}</h2>
      <p>{thread?.body}</p>
      {user && (
        <LikeButton
          id={threadId}
          type="thread"
          count={thread?.likes || 0}
          hasLiked={false}
        />
      )}
    </article>
  );
}
```

---

## Error Handling

All server actions return `{ success: boolean; error?: string; ... }` format:

```typescript
const result = await createThread(categoryId, title, body);

if (!result.success) {
  console.error("Failed:", result.error);
  // Handle error appropriately
}

// Access response data
if (result.thread) {
  console.log(result.thread.id);
}
```

---

## TypeScript Support

All actions are fully typed. Import types from `@/types/auth` and `@/types/database`:

```typescript
import type { Profile, AuthUser } from "@/types/auth";
import type { Database } from "@/types/database";
```

---

## Security

✅ **All operations are protected by:**
- Supabase RLS (Row Level Security)
- Server-side session validation
- Auth state checks on all mutations
- No client-side authorization

Users can only:
- Create/edit/delete their own content
- Like/unlike threads and replies
- Follow/unfollow other users
- Edit their own profile
