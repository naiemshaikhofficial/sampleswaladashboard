import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              cookiesToSet.forEach(({ name, value, options }) => {
                if (domain) {
                  cookieStore.set(name, value, { ...options, domain })
                } else {
                  const { domain: _omittedDomain, ...safeOptions } = options;
                  cookieStore.set(name, value, safeOptions)
                }
              })
            } catch (error) {
              // Ignore
            }
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Force apply cookies to the redirect response
      const allCookies = cookieStore.getAll()
      allCookies.forEach(cookie => {
        response.cookies.set({
          name: cookie.name,
          value: cookie.value,
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
      })
      
      return response
    }
  }

  // return the user to the login page with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-failed`)
}
