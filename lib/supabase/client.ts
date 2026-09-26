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

/*
 * Untyped query helper.
 *
 * The project has no generated `Database` types, and without them
 * supabase-js types insert/update/filter values as `never` (which is why
 * older code casts `as never`). New code uses `db()` for table and RPC
 * queries and casts results to the interfaces in lib/forum/types.ts.
 * Auth and realtime keep using the fully typed `createClient()`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Untyped = any;

export function db(): {
  from: (relation: string) => Untyped;
  rpc: (fn: string, args?: Record<string, unknown>) => Untyped;
} {
  return createClient() as unknown as {
    from: (relation: string) => Untyped;
    rpc: (fn: string, args?: Record<string, unknown>) => Untyped;
  };
}
