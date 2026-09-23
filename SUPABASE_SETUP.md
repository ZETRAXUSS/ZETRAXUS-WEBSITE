# Supabase Setup Guide

This guide walks you through setting up Supabase for ZETRAXUS authentication, user profiles, forum, and social features.

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy the **Project URL** and **Anon Public Key**
5. Create a `.env.local` file in the root of this project:

```bash
cp .env.local.example .env.local
```

6. Paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

## Step 2: Create the Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **Run**

This will create:
- `profiles` table (auto-created on signup)
- `follows` table (follow/unfollow system)
- `forum_categories` table
- `forum_threads` table
- `forum_replies` table
- `thread_likes` table
- `reply_likes` table
- All necessary RLS policies
- Indexes for performance
- Auto-profile creation trigger

## Step 3: Enable Email Authentication

1. Go to **Authentication → Providers**
2. Click **Email**
3. Enable **Confirm email** if you want email verification (recommended)
4. Configure email templates as desired

## Step 4: Initialize Forum Categories

Once the schema is set up, you'll need to populate the initial forum categories.

In Supabase SQL Editor, run:

```sql
INSERT INTO forum_categories (name, slug, description) VALUES
  ('General', 'general', 'Welcome, introductions, off-topic chatter.'),
  ('Projects', 'projects', 'Discuss and showcase creative projects.'),
  ('Worlds', 'worlds', 'Share worldbuilding ideas and concepts.'),
  ('Stories', 'stories', 'Creative writing and narrative discussions.'),
  ('Characters', 'characters', 'Character design and development.'),
  ('Theory', 'theory', 'Deep analysis and theoretical discussions.');
```

## Step 5: Test Authentication

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000
3. Click **Register** to create an account
4. Check your email for the confirmation link (or check Supabase email logs)
5. Once confirmed, log in

## Step 6: Verify Profile Creation

1. After registration, a profile should be automatically created
2. In Supabase, go to **SQL Editor** and run:
   ```sql
   SELECT id, username, display_name FROM profiles LIMIT 10;
   ```
3. You should see your newly created profile

## Security Notes

- ✅ All tables have RLS (Row Level Security) enabled
- ✅ Users can only modify their own data
- ✅ Service role key is never exposed to browser
- ✅ Session management is handled server-side
- ✅ Passwords are hashed by Supabase Auth

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not set"
- Make sure `.env.local` exists and has the correct values
- Restart the dev server after adding `.env.local`

### "Auth.users table not found"
- This should exist by default in any Supabase project
- Try creating a new project if the issue persists

### "Profiles not auto-creating on signup"
- Check that the trigger function `handle_new_user()` exists
- Run the migration SQL again if needed
- Check Supabase function logs for errors

### Email confirmation not working
- In Supabase, go to **Authentication → Email Templates**
- Ensure the confirmation link is properly configured
- For development, you can disable email confirmation in the Email provider settings

## Next Steps

Once Supabase is configured:

1. **Forum Categories** - Already created by the initialization SQL
2. **Create Threads** - Users can create threads via the forum page
3. **User Profiles** - Profiles are auto-created on signup and viewable at `/profile`
4. **Follow System** - Users can follow each other from profile pages
5. **Likes** - Thread and reply likes are fully functional

## Useful Supabase Documentation

- [Authentication](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [API Reference](https://supabase.com/docs/reference/javascript/auth-signup)
