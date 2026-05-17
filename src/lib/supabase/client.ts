import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const domain = process.env.NODE_ENV === 'production' ? '.sampleswala.com' : undefined;

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: domain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  )
}
