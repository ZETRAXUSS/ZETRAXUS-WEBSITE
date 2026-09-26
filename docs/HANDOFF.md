# ZETRAXUS — Handoff for the next AI session

Read this first. It describes the whole project state as of 2026‑09‑26.
The owner writes in Turkish; answer in Turkish, casual tone.

## Owner rules (important)
- Keep the premium black/white design, animations, sounds and performance. **Never redesign or delete** existing features ("tasarımı bozmadan").
- Push everything to GitHub `main` (Vercel auto-deploys). Commit trailer used so far: `Co-Authored-By: Claude …`.
- Never type passwords/secrets. The owner sets secrets (OPENAI_API_KEY, Google secret) in Supabase himself.
- Legal: not a lawyer; recommend a lawyer. `privacy@zetraxus.com` in `lib/legal/content.ts` is a **placeholder** the owner must replace.
- Links are **forbidden** in the whole Projects area.

## Stack & access
- Next.js 16 (app router), React 19, Tailwind 4, TypeScript.
- Repo: https://github.com/ZETRAXUSS/ZETRAXUS-WEBSITE (branch `main`). Site: https://zetraxus.com (Vercel, deploy on push).
- Supabase project id: `eicbvvrayoubpbkuttmi` (Postgres + Auth + Storage bucket `media` + Edge Functions).
- Needed in a new session: GitHub repo access, Supabase connector (MCP) for that project, optional Vercel connector (its MCP returned 403 for this team — check deploys via GitHub commit status API instead). Browser pane for live checks (zetraxus.com, vercel.com approved).
- Admins: Google account "zetraxus" (username `zetraxus`) and `testzetraxus`.
- Local build is not possible in the cloud sandbox (npm registry blocked). Type-check with stubs, then verify Vercel status:
  `curl https://api.github.com/repos/ZETRAXUSS/zetraxus-website/commits/<SHA>/status` → wait for `success`, then ~60 s before testing production.
- `tsconfig.json` excludes `supabase/functions` (Deno code broke the Vercel build once).

## Features done
- Home/Explore/Shop polish, DOM star field (seeded jittered grid), intro animation, **page transition curtain with logo** (`components/fx/page-transition.tsx`, no blur on `.page-transition`), route progress bar, sounds (`lib/sound/engine.ts`, `data-sound`, `data-sound-hover`), FX (`data-spotlight`, `data-magnetic`, `.zx-rise-in`, `.zx-pop` …).
- TR/EN i18n: `lib/i18n/dictionaries/en.ts|tr.ts` are **generated** — edit `scripts/i18n/dict.py` (key: (en, tr)), then run `python3 scripts/i18n/gen.py`.
- Auth: email + Google. Unique `username` (a–z0–9_, 3–20) + free display name; email never shown.
- Forum: categories, threads, replies, likes, bookmarks, search, markdown editor, images, reports, pin/lock.
- Ctrl+K search palette + Explore search (threads, users, categories, projects, creations).
- Notifications bell (forum + project types).
- Admin `/admin`: reports (incl. auto "AI check failed" reports), pending media approval, users/roles/bans.
- Public profiles `/u/[username]` with stat strip, works (projects/creations) and threads.
- Legal pages `/terms`, `/privacy` (KVKK, 5651 notice & takedown, projects link ban).
- **Projects** (`/projects`): real stats (`projects_stats` RPC), tabs Projects/Worlds/Lore/Characters, in-progress/completed filter, search, sort, "mine".
  - Project page `/projects/[id]`: cover, status toggle, team (invite by username, accept/decline, leave/remove, max 20), contents, likes, share, report.
  - Creations: `/worlds/[id]`, `/lore/[id]`, `/characters/[id]`; editor `/create/[project|world|lore|character]` (`?edit=id`, `?project=id`, `?world=id`), draft autosave.
  - World: type, scale, era, overview…conflicts, cities & kingdoms lists, map + planet images. Lore: markdown + inline images. Character: portrait, quote, stats, separate appearance/personality, MBTI picker, backstory etc.
  - Suggestions + comments (like, team marks suggestion "Eklendi").

## Moderation (how it works — verified)
- **Text**: all forum + project text goes through edge function `post-content` (OpenAI omni-moderation; stricter limits; creative content slightly looser on violence; staff skipped). Browsers cannot insert text directly (RLS + protect triggers). Projects text also rejects links (server regex). If AI unavailable/credits out → content is published **and** an `is_auto` report lands in admin Reports.
- **Images**: edge function `moderate-upload` (kinds: forum, avatar, project, world_map, world_planet, lore, character). OpenAI image moderation; world_map/world_planet also get a gpt-4o-mini "is this really a map/planet" check (`IRRELEVANT_IMAGE`). If AI unavailable → status `pending` → admin Media tab; attached automatically when approved (`moderate_media`). Exception: lore **inline** images are not inserted when unverified (user sees an error) — owner may want these to go to moderation too.
- Rate limits in DB triggers (threads, replies, reports, projects 3/day, creations 12/h, comments 5/min + duplicates, uploads 20/h).

## Database
Migrations in `supabase/migrations/001…008` (all applied). Key helpers: `zx_is_internal()`, `zx_internal_on/off()` (lets SECURITY DEFINER counters bypass protect triggers), `is_staff()`, `is_banned()`, `is_project_member()`, `can_edit_creation()`, `is_approved_media()`, `notify()`, `notify_ext()`, `search_site()`, `projects_stats()`, `increment_view()`.
Tables: profiles, forum_*, thread_likes, reply_likes, thread_bookmarks, follows, notifications, reports, media_uploads, projects, project_members, creations, comments, likes.
PostgREST tip: parent world embed must be `world:world_id(...)` (the fk-name hint on the self reference returns children).

## Code map
- Data: `lib/forum/client.ts` (`postContent`, `uploadImage(file, kind, {projectId, creationId, slot})`, `errorKey`), `lib/projects/{client,types,fields,metadata}.ts`, `lib/search.ts`, `lib/supabase/client.ts` (`db()` untyped helper).
- UI: `components/forum/*`, `components/projects/*`, `components/profile/*`, `components/layout/*`, `components/fx/*`, `app/admin/page.tsx`.
- Edge functions source: `supabase/functions/post-content`, `supabase/functions/moderate-upload` (deploy via Supabase MCP `deploy_edge_function`, verify_jwt true).

## Open / next ideas
- Owner should test logged-in flows: create project/world/character, upload map/planet, suggestions, invite.
- Replace privacy email placeholder.
- Risk reductions discussed: IP logging, new-account limits, auto-hide after multiple reports, email verification, takedown log, AI credit warning.
- Optional: lore inline images → moderation queue instead of error; text held until approval when AI is down.
