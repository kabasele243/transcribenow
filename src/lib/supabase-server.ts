import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Server-side Supabase client with Clerk integration
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken({ template: 'supabase' })
      },
    },
  )
} 