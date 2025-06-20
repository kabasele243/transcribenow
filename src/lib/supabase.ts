import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client with Clerk integration
export function createClientSupabaseClient(session: { getToken(options?: { template?: string }): Promise<string | null> } | null | undefined) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      async accessToken() {
        return session?.getToken({ template: 'supabase' }) ?? null
      },
    },
  )
} 