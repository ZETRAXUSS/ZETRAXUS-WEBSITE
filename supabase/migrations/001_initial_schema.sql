-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT 'Creator',
  bio text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create follows table
CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Enable RLS on follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for follows
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Create forum_categories table
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_forum_categories_slug ON forum_categories(slug);

-- Enable RLS on forum_categories
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_categories
CREATE POLICY "Categories are viewable by everyone" ON forum_categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories" ON forum_categories
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update categories" ON forum_categories
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create forum_threads table
CREATE TABLE forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_created ON forum_threads(created_at DESC);

-- Enable RLS on forum_threads
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_threads
CREATE POLICY "Threads are viewable by everyone" ON forum_threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON forum_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own threads" ON forum_threads
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own threads" ON forum_threads
  FOR DELETE USING (auth.uid() = author_id);

-- Create forum_replies table
CREATE TABLE forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_created ON forum_replies(created_at DESC);

-- Enable RLS on forum_replies
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_replies
CREATE POLICY "Replies are viewable by everyone" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies" ON forum_replies
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies" ON forum_replies
  FOR DELETE USING (auth.uid() = author_id);

-- Create thread_likes table
CREATE TABLE thread_likes (
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX idx_thread_likes_user ON thread_likes(user_id);

-- Enable RLS on thread_likes
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for thread_likes
CREATE POLICY "Likes are viewable by everyone" ON thread_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON thread_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON thread_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create reply_likes table
CREATE TABLE reply_likes (
  reply_id uuid NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (reply_id, user_id)
);

CREATE INDEX idx_reply_likes_user ON reply_likes(user_id);

-- Enable RLS on reply_likes
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for reply_likes
CREATE POLICY "Likes are viewable by everyone" ON reply_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON reply_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON reply_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_username text;
BEGIN
  -- Generate username from email (take part before @)
  generated_username := split_part(NEW.email, '@', 1);
  
  -- Ensure username is unique by appending timestamp if needed
  IF EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) THEN
    generated_username := generated_username || '_' || to_char(now(), 'YYMMDDHHmiss');
  END IF;

  INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Creator'),
    NULL,
    'user'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
