import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eicbvvrayoubpbkuttmi.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpY2J2dnJheW91YnBia3V0dG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODQyMjcsImV4cCI6MjEwNTY2MDIyN30.OzmAEBVYoHmkfuerbfIqmvxhZ6khtZaaOxWWmcjyXQ4'

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component'lerden çağrıldığında yutulabilir
        }
      },
    },
  })
}
