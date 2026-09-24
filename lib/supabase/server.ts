import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions | any
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eicbvvrayoubpbkuttmi.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpY2J2dnJheW91YnBia3V0dG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODQyMjcsImV4cCI6MjEwNTY2MDIyN30.OzmAEBVYoHmkfuerbfIqmvxhZ6khtZaaOxWWmcjyXQ4'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component render edilirken cookie seti engellenir.
          // Sayfanın çökmesini önlemek için catch içinde yutulur.
        }
      },
    },
  })
}
