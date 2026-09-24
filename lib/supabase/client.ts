import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://eicbvvrayoubpbkuttmi.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImVxIjoiZXJ1'

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL.trim(),
    SUPABASE_ANON_KEY.trim()
  )
}
