import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const domain = process.env.NODE_ENV === 'production' ? '.sampleswala.com' : undefined;
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, domain })
            )
          } catch {
            // Server Component error handling
          }
        },
      },
    }
  )
})

export const getUser = cache(async () => {
  const supabase = await createClient()
  return await supabase.auth.getUser()
})
