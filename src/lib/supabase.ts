import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** Returns a Supabase client, or null if env vars are not configured. */
export function getSupabaseClient() {
  if (!url || !key) return null
  return createBrowserClient(url, key)
}
