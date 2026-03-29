import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client for use in Server Components and API routes.
 * Uses the service-level anon key — safe because all tables have RLS enabled.
 * Returns null if env vars are not set.
 */
export function getServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}
